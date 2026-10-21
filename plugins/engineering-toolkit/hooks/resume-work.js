#!/usr/bin/env node
// SessionStart hook: lists AI-DLC work items with unfinished phases so the user can resume them.
// Reads .ai-dlc/*/state.md and looks at the "## Pipeline" checklist written by the Plan phase.

const fs = require("fs");
const path = require("path");

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

const cwd = readInput().cwd || process.cwd();
const artifactsDir = path.join(cwd, ".ai-dlc");

let workIds = [];
try {
  workIds = fs.readdirSync(artifactsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
} catch {
  process.exit(0); // No artifacts folder: nothing to resume.
}

const items = workIds
  .map((id) => unfinishedItem(artifactsDir, id))
  .filter(Boolean)
  .sort((a, b) => b.mtime - a.mtime);

if (items.length === 0) process.exit(0);

const lines = items.slice(0, MAX_ITEMS).map((i) => `- ${i.workId}: next phase "${i.next}"`);
if (items.length > MAX_ITEMS) lines.push(`- …and ${items.length - MAX_ITEMS} more in .ai-dlc/`);

const context =
  "engineering-toolkit: unfinished AI-DLC work items in this repo (most recent first):\n" +
  lines.join("\n") +
  "\nIf the user's request relates to one of these, offer to resume it with /engineering-toolkit:ai-dlc <work-id>. Otherwise don't mention them.";

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }));
