---
name: ux-review
description: Reviews a running app's UI/UX from real evidence — screenshots at several viewports, task flows, axe accessibility results and touch-target measurements — against the project's own design rules first and general heuristics second, and writes numbered suggestions. Use for "review the UI", "UX feedback", "how can we improve this screen/flow", "is this accessible", "design review". Not for code structure (codebase-review).
argument-hint: "[screens, flow or route] [focus, e.g. a11y | flow | consistency]"
---

# UX Review

Suggest UI/UX improvements from what the user actually sees, not from reading JSX. Don't change code.

## 1. Scope

- **Work id:** `ux-review-<yyyy-mm-dd>` (add the area, e.g. `ux-review-capture-flow-2026-10-24`). Evidence goes to `.ai-dlc/<work-id>/ux/`.
- **What to look at:** the screens or flow the user named. If none, pick the app's core flow (from README / product docs) and at most 6 screens. Ask once if the core flow isn't clear.
- **Focus:** default is everything in [reference/heuristics.md](reference/heuristics.md); honour a narrower focus (a11y, flow, consistency, mobile).

## 2. Yardstick — the project's rules come first

Find the project's design rules: design-system or styling docs, token files, an `AGENTS.md`/`CLAUDE.md` styling section, a Storybook docs page. Collect their paths. If a stack skill is available (e.g. `pwa-toolkit:pwa-stack` — its `reference/ios-safari.md` covers viewport, keyboard and safe areas), collect the relevant reference paths too.

A suggestion that breaks a documented project rule is not a finding. If a heuristic and a project rule pull in different directions, report it as a **tension** for the user to decide, never as a defect.

## 3. Capture evidence

1. **Get a URL to render**, in this order: a built Storybook with route/screen stories (stable data), a production preview (`vite preview`, `next start`…), the dev server, or a URL the user gives. Start a server in the background if needed and stop it afterwards.
2. **Write `targets.json`** in the evidence folder: one entry per screen, and for a flow one entry with `steps` and `"shotEachStep": true`. The step format is documented at the top of the script.
3. **Run the capture script from the project root:**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/ux-review/scripts/capture.mjs" --targets .ai-dlc/<work-id>/ux/targets.json --out .ai-dlc/<work-id>/ux --viewports mobile,desktop
   ```
   It uses the project's own Playwright (and axe-core if present), never installs anything, caps at 40 screenshots, and writes `capture.json` (per screenshot: file, axe violations, small touch targets, console errors). Add `tablet` or `--colorScheme light` only when relevant.
4. **No Playwright in the project:** use a browser tool if this session has one (Claude in Chrome, built-in browser) to take the same screenshots, and note that axe and target-size data are missing. Otherwise ask the user — don't install packages.

Before delegating, check `capture.json` for errors and for shots flagged `looksEmpty`, and open one screenshot yourself. A spinner or blank page is not evidence: add a `waitFor` step, wait longer, or switch source (a Storybook whose stories hang → the production preview). Re-run once.

## 4. Delegate the review

Run **`engineering-toolkit:ux-reviewer`** with: the evidence folder, the project rule paths, stack reference paths, the absolute path of [reference/heuristics.md](reference/heuristics.md) and [reference/report-template.md](reference/report-template.md), the focus, and output `.ai-dlc/<work-id>/ux-review.md`. It returns a short pointer.

## 5. Checkpoint

Show the one-line verdict, counts by severity, the top 3 suggestions with their screenshot paths, and any **tensions** needing a decision. Offer:

- **Implement one:** `/engineering-toolkit:ai-dlc` with the suggestion as the request, e.g. `feature: U2 from .ai-dlc/<work-id>/ux-review.md — …`.
- **Plan several:** `sdlc-breakdown` with the chosen suggestions.
- **Stop:** the report and screenshots stay in `.ai-dlc/<work-id>/` (gitignored).
