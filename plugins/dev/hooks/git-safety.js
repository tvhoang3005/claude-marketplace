#!/usr/bin/env node
// PreToolUse hook for Bash: blocks destructive or gate-skipping git commands.
// Exit code 2 blocks the tool call and shows stderr to Claude.

const RULES = [
  { pattern: /\bgit\b.*\s--no-verify\b/, reason: "--no-verify skips the project's git hooks." },
  {
    test: (cmd) =>
      /\bgit\s+push\b/.test(cmd) &&
      /\s(--force|--force-with-lease|-f)(\s|=|$)/.test(cmd) &&
      /[\s:+](main|master)(\s|$)/.test(cmd),
    reason: "Force-pushing to main/master rewrites shared history.",
  },
  { pattern: /\bgit\s+reset\s+--hard\b/, reason: "reset --hard discards uncommitted work." },
  { pattern: /\bgit\s+clean\s+-[a-zA-Z]*f/, reason: "clean -f deletes untracked files permanently." },
  { pattern: /\bgit\s+checkout\s+(--\s+)?\.(\s|$)/, reason: "checkout . discards all unstaged changes." },
  { pattern: /\bgit\s+branch\s+-D\s+(main|master)\b/, reason: "Deleting main/master is not allowed." },
];

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let command = "";
  try {
    command = JSON.parse(input).tool_input?.command ?? "";
  } catch {
    process.exit(0); // Malformed input: don't block.
  }

  const hit = RULES.find((rule) => (rule.test ? rule.test(command) : rule.pattern.test(command)));
  if (hit) {
    process.stderr.write(
      `Blocked by dev git-safety: ${hit.reason}\n` +
        "Ask the user to run this command themselves if they really intend it.\n",
    );
    process.exit(2);
  }
  process.exit(0);
});
