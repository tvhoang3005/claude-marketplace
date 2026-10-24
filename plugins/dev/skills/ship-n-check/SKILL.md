---
name: ship-n-check
description: Shipping pipeline for finished code — branch, commit, local quality gates, push, draft PR and CI check; commits locally only when the repo has no remote or is set to commit-only. Use when the user says "I'm done", "ship it", "commit and push", "create a PR", or when the ai-dlc Release phase hands off.
argument-hint: "[ticket-id or work-id]"
---

# Ship & Check

Take finished local changes to a draft PR with green CI — or, in `commit-only` mode, to a tested local commit. Stop at the first failing gate and report it; never bypass a gate.

## 0. Project context

If `.ai-dlc/<work-id>/state.md` exists, read its **Project** section for the base branch, commands and release mode. Otherwise read `.claude/ai-dlc.json` (or the older `.claude/engineering-toolkit.json`) if present, then detect the commands from `package.json`, `Makefile`, `pyproject.toml`, `go.mod` or the README. Never invent a command.

**Release mode:** `Release` from `state.md`, else `release` from the config, else `commit-only` if `git remote` prints nothing, otherwise `pr`.

## 1. Branch & commit

1. Run `git status` and `git diff --stat`. If there is nothing to ship, say so and stop.
2. If on the base branch, create a branch: `<type>/<ticket-id>-<short-slug>`, or `<type>/<work-id>` when there is no ticket (e.g. `feat/settings-dark-mode`). `<type>` is `feat`, `fix`, `refactor`, `chore` or `docs`. Never invent a ticket id.
3. Stage files by explicit path. Never `git add -A` or `git add .` — check for secrets, build output and unrelated changes first.
4. From `.ai-dlc/`, stage only `specs.md` and `design.md` of the work item being shipped. Never stage other artifact files.
5. Commit as `<type>: [<ticket-id>] <summary>` (omit the ticket part if there is none).

## 2. Local quality gate

Run, in order: format check, lint, type-check, tests — skipping any recorded as `none`. If one fails, stop, show the failing output, and offer to fix it.

## 3. Push & PR

In `commit-only` mode, stop here: skip push, PR and CI, and report the branch and commit SHA.

1. Push with `git push -u origin <branch>`. Never force-push a shared branch.
2. If `gh` is available, open a **draft** PR against the base branch with `gh pr create --draft`. The body contains: summary, acceptance criteria as a checklist, how it was tested, and the review verdict if ai-dlc provided one.
3. If `gh` is not available, give the user the compare URL instead.

## 4. CI check

If `gh` is available, run `gh pr checks <pr> --watch` in the background. On failure, read the failed job's log (`gh run view <run-id> --log-failed`), summarize the cause, and offer a fix.

## Report

One line per gate: ✅ / ❌ and evidence (command + result), then the PR URL — or, in `commit-only` mode, the branch and commit SHA.
