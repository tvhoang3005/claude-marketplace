---
name: security-review
description: Security review of the current branch's changes against a catalogue of secure-coding patterns (injection, access control, auth and sessions, SSRF, XSS, deserialization, crypto, DoS, races, uploads, business logic). Use when the user asks for a "security review", "check this for vulnerabilities", "is this safe", or when ai-dlc Verify adds a security reviewer.
argument-hint: "[work-id or base branch]"
---

# Security Review

Delegate to the **`dev:security-reviewer`** agent; don't review inline. Inline review would pull the whole diff and the pattern catalogue into the main session.

1. **Scope:** the changed files, `git diff --name-only <base-branch>...HEAD` plus uncommitted changes. If `.ai-dlc/<work-id>/state.md` exists, take the base branch and risk flags from it; otherwise use the default branch.
2. **Brief the agent** with:
   - the changed files and base branch,
   - the absolute path of [reference/secure-coding-patterns.md](reference/secure-coding-patterns.md), built from this skill's base directory,
   - the risk flags, if any,
   - the output path: `.ai-dlc/<work-id>/security-review.md` when there is a work id, otherwise ask for the table directly.
3. **Report back:** blocking findings first, each with `file:line`, the attack, the CWE and the fix. If there are none, say so in one line and list what was checked.

Don't fix anything unless the user asks.
