#!/usr/bin/env bash
# Minimal Node CLI repo with a real test, so Plan finds the code, commands and gitignore block, and has no gaps to raise.
set -euo pipefail
mkdir -p src test
cat > package.json <<'JSON'
{
  "name": "tiny-cli",
  "version": "1.4.2",
  "type": "module",
  "bin": { "tiny-cli": "src/cli.js" },
  "scripts": { "test": "node --test" }
}
JSON
cat > src/cli.js <<'JS'
#!/usr/bin/env node
const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log("Usage: tiny-cli [--help]");
  process.exit(0);
}

console.log("tiny-cli: nothing to do");
JS
cat > test/cli.test.js <<'JS'
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const run = (...args) => execFileSync("node", ["src/cli.js", ...args], { encoding: "utf8" }).trim();

test("--help prints usage", () => {
  assert.equal(run("--help"), "Usage: tiny-cli [--help]");
});

test("no flags prints the default message", () => {
  assert.equal(run(), "tiny-cli: nothing to do");
});
JS
cat > .gitignore <<'GI'
node_modules/
# engineering-toolkit: keep durable AI-DLC artifacts, ignore working files
.ai-dlc/**
!.ai-dlc/*/
!.ai-dlc/*/specs.md
!.ai-dlc/*/design.md
GI
git init -q
git add -A
git -c user.name=eval -c user.email=eval@example.com commit -q -m "init"
