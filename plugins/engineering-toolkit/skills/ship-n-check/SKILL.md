---
name: ship-n-check
description: Shipping pipeline for finished code — branch, commit, local quality gates, push, draft PR and CI check. Use when the user says "I'm done", "ship it", "commit and push", "create a PR", or when the ai-dlc Release phase hands off.
argument-hint: "[ticket-id]"
---

# Ship & Check

Take finished local changes to a draft PR with green CI. Stop at the first failing gate and report it; never bypass a gate.

## 0. Project context

If `.ai-dlc/<work-id>/state.md` exists, read its **Project** section for the base branch and commands. Otherwise read `.claude/engineering-toolkit.json` if present, then detect the commands from `package.json`, `Makefile`, `pyproject.toml`, `go.mod` or the README. Never invent a command.

## 1. Branch & commit

1. Run `git status` and `git diff --stat`. If there is nothing to ship, say so and stop.
2. If on the base branch, create a branch: `<type>/<ticket-id>-<short-slug>`, where `<type>` is `feat`, `fix`, `refactor`, `chore` or `docs`.
3. Stage files by explicit path. Never `git add -A` or `git add .` — check for secrets, build output and unrelated changes first.
4. From `.ai-dlc/`, stage only `specs.md` and `design.md` of the work item being shipped. Never stage other artifact files.
5. Commit as `<type>: [<ticket-id>] <summary>` (omit the ticket part if there is none).

## 2. Local quality gate

Run, in order: format check, lint, type-check, tests — skipping any recorded as `none`. If one fails, stop, show the failing output, and offer to fix it.

## 3. Push & PR

1. Push with `git push -u origin <branch>`. Never force-push a shared branch.
2. If `gh` is available, open a **draft** PR against the base branch with `gh pr create --draft`. The body contains: summary, acceptance criteria as a checklist, how it was tested, and the review verdict if ai-dlc provided one.
3. If `gh` is not available, give the user the compare URL instead.

## 4. CI check

If `gh` is available, run `gh pr checks <pr> --watch` in the background. On failure, read the failed job's log (`gh run view <run-id> --log-failed`), summarize the cause, and offer a fix.

## Report

One line per gate: ✅ / ❌ and evidence (command + result), then the PR URL.
