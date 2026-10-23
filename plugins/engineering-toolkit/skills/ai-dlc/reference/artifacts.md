# Artifacts

Every work item has a folder `.ai-dlc/<work-id>/`. Phases and agents communicate through these files, not through conversation history.

## Files and commit policy

| File | Written by | Tier | Commit? |
|---|---|---|---|
| `specs.md` | Inception | Durable | **Yes** — the agreed requirements are useful history |
| `design.md` | Design | Durable | **Yes** — keeps the ADRs next to the code they shaped |
| `discovery.md` | Discovery | Transient | No |
| `state.md` | Plan, every checkpoint | Transient | No |
| `breakdown.md` | `sdlc-breakdown` | Transient | No |
| `investigation.md` | Investigate / `debugger` | Transient | No |
| `requirements-review.md` | `requirements-reviewer` | Transient | No |
| `code-review.md` | `code-reviewer` | Transient | No |
| `security-review.md` | `security-reviewer` | Transient | No |
| `review.md` | Verify (merged) | Transient | No |
| `handoff.md` | `handoff` skill | Transient | No |

Handoffs not tied to a work item go in `.ai-dlc/handoffs/<yyyy-mm-dd>-<slug>.md` — also transient and ignored by the block below.

## Gitignore setup

The first time Plan runs in a repo, check that `.gitignore` contains the block below. If it is missing, show it to the user and add it once they agree:

```gitignore
# engineering-toolkit: keep durable AI-DLC artifacts, ignore working files
.ai-dlc/**
!.ai-dlc/*/
!.ai-dlc/*/specs.md
!.ai-dlc/*/design.md
```

`ship-n-check` stages `specs.md` and `design.md` for the work item it is shipping, and nothing else under `.ai-dlc/`.

## Agent hand-off: return a pointer, not the report

When the orchestrator delegates to an agent, it passes the output path. The agent writes its full report there and returns only:

```
status: <done | failed | blocked>
report: .ai-dlc/<work-id>/<file>.md
summary:
- at most 5 lines
```

The orchestrator reads the file only when it needs the detail (for example, to merge reviews into `review.md`). This keeps the main session small on large diffs.
