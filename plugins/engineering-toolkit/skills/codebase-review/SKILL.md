---
name: codebase-review
description: Audits an existing project or area without changing code — structure, boundaries, tests, tooling and project-wide security — and writes prioritized findings with file:line evidence. Use for "review the project", "audit the codebase", "is this structured correctly", "what should we improve", or when ai-dlc Plan classifies a request as audit. Not for reviewing a diff.
argument-hint: "[path or area] [focus, e.g. security | structure | tests]"
---

# Codebase Review

Assess what exists; don't change it. The output is a findings report the user can turn into work items.

## 1. Scope

- **Work id:** from ai-dlc if it handed off, otherwise `codebase-review-<yyyy-mm-dd>` (add the area for a partial review, e.g. `codebase-review-src-tauri-2026-10-23`). Artifact folder: `.ai-dlc/<work-id>/`.
- **Area:** the path the user named, else the whole repo. In a monorepo with several apps or packages, ask which one unless the user said "all".
- **Focus:** default is all dimensions in [reference/review-dimensions.md](reference/review-dimensions.md). If the user named a focus (security, structure, tests…), review only that.
- **Project context:** reuse the **Project** section of `state.md` if it exists; otherwise follow ai-dlc's [project-context.md](../ai-dlc/reference/project-context.md) steps 1–2 to detect commands. Run the test command once and record the result — a failing or missing test suite is itself a finding.

## 2. Pick the yardstick

Detect the stack from manifests (`package.json`, `Cargo.toml`, `src-tauri/`, `next.config.*`, `pyproject.toml`, `go.mod`…) and record the framework **and major version**.

If a skill for that stack is available in this session (for example `tauri-toolkit:tauri-desktop`, `nextjs-toolkit:nextjs-stack`, `pwa-toolkit:pwa-stack`), load it and collect the absolute paths of the reference files relevant to the focus. Those references are the yardstick. If no stack skill is available, say so in the report: findings then rest on general engineering practice and the project's own conventions, and are labelled that way.

## 3. Delegate, in parallel

Run as subagents at the same time, each writing its own report and returning a short pointer:

| Agent | When | Brief |
|---|---|---|
| `engineering-toolkit:architecture-reviewer` | unless focus is security only | area, stack + version, yardstick reference paths, absolute path of [reference/review-dimensions.md](reference/review-dimensions.md), test result, output `.ai-dlc/<work-id>/architecture-review.md` |
| `engineering-toolkit:security-reviewer` | unless focus excludes security | `scope: project`, the area, stack, yardstick security reference path if any, absolute path of `../security-review/reference/secure-coding-patterns.md` resolved from this skill's base directory, output `.ai-dlc/<work-id>/security-review.md` |

## 4. Merge into `codebase-review.md`

Read both reports and write `.ai-dlc/<work-id>/codebase-review.md` using [reference/report-template.md](reference/report-template.md):

- Deduplicate findings both agents raised; keep the stronger evidence.
- Map security severities: `blocking` → **high**, `should-fix` → **medium**.
- At most 15 findings, highest impact first; put the rest in one line each under **Also noted**.
- Keep a short **What's working** section — it tells the user what not to change.
- Every finding needs `file:line` (or the file/config that is missing) as evidence. Drop findings without evidence.

## 5. Checkpoint

Show: the overall verdict in one line, counts by severity, the top 3 findings, and the report path. Then offer:

- **Fix one finding:** start `/engineering-toolkit:ai-dlc` with the finding as the request, e.g. `refactor: F3 from .ai-dlc/<work-id>/codebase-review.md — move IPC commands out of lib.rs`.
- **Plan several:** run `sdlc-breakdown` with the chosen findings as the parent request.
- **Stop:** the report stays in `.ai-dlc/<work-id>/` (local; it is gitignored like other working files).

Don't fix anything in this skill, even small things — the user picks what to change.
