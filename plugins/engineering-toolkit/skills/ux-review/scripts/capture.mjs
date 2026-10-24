#!/usr/bin/env node
// Captures UI evidence for the ux-review skill: a screenshot per target and viewport, axe-core
// accessibility violations when axe-core is installed in the project, and interactive elements
// smaller than the touch-target minimum. Run from the project root so Playwright and axe-core
// resolve from the project's own node_modules; nothing is installed.
//
//   node capture.mjs --targets targets.json --out .ai-dlc/<work-id>/ux [--viewports mobile,desktop]
//
// targets.json: [{ "name": "review", "url": "http://localhost:4173/review",
//                  "steps": [{ "click": "text=Show answer" }, { "wait": 300 }], "shotEachStep": true }]
// Steps: { click: selector } | { fill: [selector, text] } | { press: key } | { wait: ms } | { goto: url } | { waitFor: selector }
// A shot whose page shows almost no text is flagged "looksEmpty" — usually a spinner or an unrendered story.

import { createRequire } from 'node:module';
import { access, chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const VIEWPORTS = {
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  tablet: { width: 820, height: 1180, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  desktop: { width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
};
const MIN_TARGET = 44; // Apple HIG; WCAG 2.2 AA's floor is 24
const MAX_SHOTS = 40;

function args() {
  const out = { viewports: 'mobile,desktop', colorScheme: 'dark', reducedMotion: 'no-preference' };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) out[argv[i].replace(/^--/, '')] = argv[i + 1];
  if (!out.targets || !out.out) {
    console.error('usage: capture.mjs --targets <file.json> --out <dir> [--viewports mobile,tablet,desktop]');
    process.exit(2);
  }
  return out;
}

const projectRequire = createRequire(join(process.cwd(), 'package.json'));
function load(name) {
  try {
    return projectRequire(name);
  } catch {
    return null;
  }
}

const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// An x64 Node under Rosetta on Apple Silicon launches the Intel build of Chrome, which makes
// WASM- and worker-heavy apps tens of times slower (a boot that takes 3 s can time out). Launch
// the native build through `arch -arm64` instead.
async function rosettaChrome() {
  if (process.platform !== 'darwin' || process.arch !== 'x64' || !cpus()[0]?.model.startsWith('Apple')) return null;
  try {
    await access(MAC_CHROME);
  } catch {
    return null;
  }
  const wrapper = join(tmpdir(), 'ux-review-chrome-arm64.sh');
  await writeFile(wrapper, `#!/bin/sh\nexec /usr/bin/arch -arm64 "${MAC_CHROME}" "$@"\n`);
  await chmod(wrapper, 0o755);
  return wrapper;
}

async function launch(chromium) {
  const native = await rosettaChrome();
  if (native) return chromium.launch({ executablePath: native });
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ channel: 'chrome' }); // installed Chrome when Playwright's own browsers aren't
  }
}

async function smallTargets(page) {
  return page.evaluate((min) => {
    const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=tab], [role=switch], [role=checkbox], [tabindex]:not([tabindex="-1"])';
    const found = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || style.visibility === 'hidden' || style.display === 'none') continue;
      if (r.bottom < 0 || r.top > innerHeight) continue; // only what is on screen
      if (r.width < min || r.height < min) {
        const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.tagName).trim().slice(0, 40);
        found.push({ label, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) });
      }
    }
    return found.slice(0, 30);
  }, MIN_TARGET);
}

async function runAxe(page, axeSource) {
  if (!axeSource) return null;
  try {
    return await axeViolations(page, axeSource);
  } catch (e) {
    return [{ id: 'axe-failed', impact: null, help: String(e).slice(0, 200), nodes: [], count: 0 }];
  }
}

async function axeViolations(page, axeSource) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 5).map((n) => ({ target: n.target.join(' '), summary: (n.failureSummary || '').split('\n').slice(0, 3).join(' ') })),
      count: v.nodes.length,
    }));
  });
  return result;
}

async function step(page, s) {
  if (s.click) await page.click(s.click, { timeout: 5000 });
  else if (s.fill) await page.fill(s.fill[0], s.fill[1], { timeout: 5000 });
  else if (s.press) await page.keyboard.press(s.press);
  else if (s.goto) await page.goto(s.goto, { waitUntil: 'networkidle' });
  else if (s.waitFor) await page.waitForSelector(s.waitFor, { state: 'visible', timeout: 15000 });
  if (s.wait) await page.waitForTimeout(s.wait);
}

const opts = args();
const playwright = load('playwright') ?? load('@playwright/test');
if (!playwright) {
  console.error('Playwright is not installed in this project (looked for "playwright" and "@playwright/test"). Not installing it; use a browser tool instead or ask the user.');
  process.exit(3);
}
let axeSource = null;
try {
  axeSource = await readFile(projectRequire.resolve('axe-core/axe.min.js'), 'utf8');
} catch {
  // axe-core not installed: accessibility violations are skipped and reported as such
}

const targets = JSON.parse(await readFile(opts.targets, 'utf8'));
const viewports = opts.viewports.split(',').map((v) => v.trim()).filter((v) => VIEWPORTS[v]);
const outDir = resolve(opts.out);
await mkdir(outDir, { recursive: true });

const browser = await launch(playwright.chromium);
const report = { capturedAt: new Date().toISOString(), axe: Boolean(axeSource), minTarget: MIN_TARGET, shots: [], errors: [] };
let shots = 0;

for (const target of targets) {
  for (const vp of viewports) {
    // bypassCSP lets axe be injected into apps with a strict script-src; it changes nothing in the app itself.
    const { width, height, ...device } = VIEWPORTS[vp];
    const context = await browser.newContext({ viewport: { width, height }, ...device, colorScheme: opts.colorScheme, reducedMotion: opts.reducedMotion, bypassCSP: true });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)));
    page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)));
    try {
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(target.settle ?? 800);
      const steps = target.steps ?? [];
      for (let i = 0; i <= steps.length && shots < MAX_SHOTS; i += 1) {
        if (i > 0) await step(page, steps[i - 1]);
        // No steps: one shot. shotEachStep: the initial state and after every step. Otherwise: the end state.
        if (i < steps.length && !target.shotEachStep) continue;
        const file = `${target.name}-${vp}${steps.length ? `-${i}` : ''}.png`;
        await page.screenshot({ path: join(outDir, file), fullPage: Boolean(target.fullPage) });
        shots += 1;
        report.shots.push({
          target: target.name,
          viewport: vp,
          step: i,
          stepAction: i > 0 ? steps[i - 1] : null,
          file,
          url: page.url(),
          looksEmpty: (await page.evaluate(() => document.body.innerText.trim().length)) < 20,
          axe: await runAxe(page, axeSource),
          smallTargets: VIEWPORTS[vp].hasTouch ? await smallTargets(page).catch(() => []) : [],
          consoleErrors: consoleErrors.splice(0),
        });
      }
    } catch (e) {
      report.errors.push({ target: target.name, viewport: vp, error: String(e).slice(0, 300) });
    }
    await context.close();
  }
}

await browser.close();
await writeFile(join(outDir, 'capture.json'), JSON.stringify(report, null, 2));
const empty = report.shots.filter((s) => s.looksEmpty).length;
console.log(`${report.shots.length} screenshots, ${report.errors.length} errors, ${empty} look empty, axe: ${report.axe ? 'on' : 'not installed'} → ${join(outDir, 'capture.json')}`);
if (empty) console.log('Some screenshots look empty (spinner or unrendered page): wait longer, add a waitFor step, or use another source before reviewing.');
if (shots >= MAX_SHOTS) console.log(`stopped at ${MAX_SHOTS} screenshots`);
