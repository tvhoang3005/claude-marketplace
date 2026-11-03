#!/usr/bin/env node
// SessionStart hook: lists AI-DLC work items with unfinished phases, and open handoffs, so the user can resume them.
// Reads the "## Pipeline" checklist in .ai-dlc/*/state.md (written by Plan) and the "Status: open" line in
// .ai-dlc/*/handoff.md and .ai-dlc/handoffs/*.md (written by the handoff skill).
// Also lists unfinished work items in the repo's other git worktrees (isolation: worktree), so they aren't forgotten.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const MAX_ITEMS = 5;

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

function pipelineSection(text) {
  const match = text.match(/^## Pipeline[^\S\n]*$([\s\S]*?)(?=^## |(?![\s\S]))/m);
  return match ? match[1] : "";
}

function unfinishedItem(dir, workId) {
  let text;
  try {
    text = fs.readFileSync(path.join(dir, workId, "state.md"), "utf8");
  } catch {
    return null;
  }
  const pending = [...pipelineSection(text).matchAll(/^\s*- \[ \] (\S+)/gm)].map((m) => m[1]);
  if (pending.length === 0) return null;
  const mtime = fs.statSync(path.join(dir, workId, "state.md")).mtimeMs;
  return { workId, next: pending[0], mtime };
}

function openHandoff(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  if (!/^Status:\s*open\s*$/m.test(text.split("\n").slice(0, 5).join("\n"))) return null;
  return { file, mtime: fs.statSync(file).mtimeMs };
}

function listOpenHandoffs(dir, workIds) {
  const files = workIds.map((id) => path.join(dir, id, "handoff.md"));
  try {
    for (const name of fs.readdirSync(path.join(dir, "handoffs"))) {
      if (name.endsWith(".md")) files.push(path.join(dir, "handoffs", name));
    }
  } catch {
    // No standalone handoffs.
  }
  return files.map(openHandoff).filter(Boolean).sort((a, b) => b.mtime - a.mtime);
}

function capped(lines) {
  const shown = lines.slice(0, MAX_ITEMS);
  if (lines.length > MAX_ITEMS) shown.push(`- …and ${lines.length - MAX_ITEMS} more in .ai-dlc/`);
  return shown.join("\n");
}

function listWorkIds(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return []; // No artifacts folder.
  }
}

function unfinishedItems(dir) {
  return listWorkIds(dir)
    .map((id) => unfinishedItem(dir, id))
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime);
}

function realpath(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

// Paths of the repo's other worktrees, or [] when this isn't a git repo or git isn't available.
function otherWorktrees(dir) {
  let out;
  try {
    out = execFileSync("git", ["-C", dir, "worktree", "list", "--porcelain"], {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return [];
  }
  let top;
  try {
    top = execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    top = dir;
  }
  const self = realpath(top);
  return out
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length))
    .filter((p) => realpath(p) !== self);
}

const cwd = readInput().cwd || process.cwd();
const artifactsDir = path.join(cwd, ".ai-dlc");

const workIds = listWorkIds(artifactsDir);
const items = unfinishedItems(artifactsDir);
const handoffs = listOpenHandoffs(artifactsDir, workIds);
const elsewhere = otherWorktrees(cwd)
  .flatMap((wt) => unfinishedItems(path.join(wt, ".ai-dlc")).map((i) => ({ ...i, worktree: wt })))
  .sort((a, b) => b.mtime - a.mtime);

if (items.length === 0 && handoffs.length === 0 && elsewhere.length === 0) process.exit(0);

const parts = [];
if (items.length > 0) {
  parts.push(
    "dev: unfinished AI-DLC work items in this repo (most recent first):\n" +
      capped(items.map((i) => `- ${i.workId}: next phase "${i.next}"`)) +
      "\nIf the user's request relates to one of these, offer to resume it with /dev:ai-dlc <work-id>. Otherwise don't mention them."
  );
}
if (elsewhere.length > 0) {
  parts.push(
    "dev: unfinished AI-DLC work items in other worktrees of this repo (most recent first):\n" +
      capped(elsewhere.map((i) => `- ${i.workId}: next phase "${i.next}" in ${i.worktree}`)) +
      "\nIf the user asks to resume one of these, tell them to open Claude in that folder and run /dev:ai-dlc <work-id> there. Otherwise don't mention them."
  );
}
if (handoffs.length > 0) {
  parts.push(
    "dev: open handoffs from earlier sessions (most recent first):\n" +
      capped(handoffs.map((h) => `- ${path.relative(cwd, h.file)}`)) +
      "\nIf the user wants to continue earlier work, offer /dev:handoff resume <path>. Otherwise don't mention them."
  );
}
const context = parts.join("\n\n");

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }));
