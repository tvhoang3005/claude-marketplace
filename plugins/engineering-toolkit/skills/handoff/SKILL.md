---
name: handoff
description: Writes a self-contained handoff of the current session (goal, evidence, decisions, dead ends, next step, git state) so work can continue in a new session or by a teammate; also resumes one. Use for "handoff", "wrap up for today", "I'm stopping here", "save context to continue later", "pick up where we left off". Not for shipping (ship-n-check).
argument-hint: "[resume [handoff-path]]"
---

# Handoff

Capture what the code and git history don't: what we were trying to do, what was ruled out and why, and the exact next step. The reader is a future session with no access to this conversation — by default the user, possibly a teammate.

## Write (default)

1. **Pick the location.**
   - An ai-dlc work item is active in this session (or the work clearly belongs to one in `.ai-dlc/`): `.ai-dlc/<work-id>/handoff.md`. It replaces any older `handoff.md` there.
   - Otherwise: `.ai-dlc/handoffs/<yyyy-mm-dd>-<slug>.md`, where the slug names the topic (e.g. `2026-10-23-ci-flaky-checkout`).
2. **Collect state by running commands, not from memory:** `git branch --show-current`, `git status --short`, `git stash list`, `git log --oneline -5`, and the last test/build command's result if one ran this session. If the folder isn't a git repo, say so in the file.
3. **Write the file** using [reference/template.md](reference/template.md). Fill it from this session; leave out empty sections rather than writing "none".
4. **Check before saving:**
   - Self-contained: no "as discussed above", no references to messages.
   - Every "done" item has evidence (command + result, file path); anything not verified is marked `(unverified)`.
   - The first next step is concrete enough to start without thinking: a command, or a `file:line` and the change.
   - No secrets, tokens or credentials — name the env var, never its value. This applies to your reply as well as the file: if the user pasted a secret, say that a credential was shared and suggest rotating it, without repeating the value.
   - About one page. Link to existing artifacts (`state.md`, `investigation.md`) instead of copying them.
5. **Tell the user** the path and the first next step. If an ai-dlc work item is involved, add one line under **Notes** in its `state.md`: `Handoff written: handoff.md (<date>)`.

`.ai-dlc/` is gitignored except `specs.md` and `design.md`, so handoffs stay local. If the user wants to share one with a teammate, offer to copy it somewhere they choose rather than changing the gitignore.

## Resume (`resume [path]`)

1. No path: list handoffs with `Status: open` in `.ai-dlc/*/handoff.md` and `.ai-dlc/handoffs/*.md`, newest first, and ask which one. If there's exactly one, use it.
2. Read the handoff and any artifacts it links.
3. Compare the recorded git state with the current one (`git branch --show-current`, `git status --short`). Point out anything that changed since — a different branch, new commits, missing uncommitted changes.
4. Summarize in at most 5 bullets: goal, where it stopped, the next step, open questions. Ask whether to start on the next step.
5. Once the user continues, set the file's status line to `Status: resumed (<yyyy-mm-dd>)`. Don't delete the file.
