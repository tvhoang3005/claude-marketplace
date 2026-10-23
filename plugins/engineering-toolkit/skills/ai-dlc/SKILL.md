---
name: ai-dlc
description: AI-driven development lifecycle orchestrator. Takes a ticket, feature request, bug or vague idea through an adaptive pipeline (Discovery → Plan → Inception → Design → Construct → Verify → Release) with user checkpoints between phases. Use when the user says "work on TICKET-123", "build this feature", "fix this bug", "implement this", "plan this", "resume TICKET-123", or runs /engineering-toolkit:ai-dlc. Accepts a phase name as the first argument to run one phase only.
argument-hint: "[discovery|plan|inception|design|construct|verify|release] [ticket-id or description]"
---

# AI-DLC Orchestrator

You drive the work; the user approves at checkpoints. Stay lean: read each phase's reference file only when that phase starts, keep decisions in the artifact files rather than in conversation, and let subagents return pointers rather than full reports ([reference/artifacts.md](reference/artifacts.md)).

## 1. Set up the work item

- **Work id:** the ticket id if one is given (e.g. `TICKET-123`), otherwise a short kebab-case slug of the request (e.g. `user-dashboard`). No ticket is fine — personal projects without a tracker work the same way ([reference/project-context.md](reference/project-context.md#3-fetch-the-ticket)).
- **Artifact folder:** `.ai-dlc/<work-id>/`. Create it if missing.
- **Resume:** if `state.md` already exists there, read it (including its **Project** section) and continue from the first unchecked phase under `## Pipeline`. Tell the user which phase you are resuming.

## 2. Route

| First argument | Do this |
|---|---|
| `discovery` | Run Discovery only, then offer to continue with Plan |
| `plan`, `inception`, `design`, `construct`, `verify`, `release` | Run that one phase only. Read `state.md` first; if it doesn't exist and the phase isn't `plan`, run [reference/project-context.md](reference/project-context.md) first so commands and the ticket are known |
| anything else / none | Full pipeline: if the request is vague (no clear user, problem or outcome), start with Discovery; otherwise start with Plan |

## 3. Phases

| Phase | Reference | Writes | Checkpoint after? |
|---|---|---|---|
| Discovery | [reference/discovery.md](reference/discovery.md) | `discovery.md` | Yes |
| Plan | [reference/plan.md](reference/plan.md) | `state.md` | Yes |
| Breakdown (size L only) | use the `sdlc-breakdown` skill | `breakdown.md` | Yes |
| Investigate | use the `investigate` skill | `investigation.md` | Yes |
| Inception | [reference/inception.md](reference/inception.md) | `specs.md` | Yes |
| Design | [reference/design.md](reference/design.md) | `design.md` | Yes |
| Construct | [reference/construct.md](reference/construct.md) | code + tests | No — goes straight to Verify |
| Verify | [reference/verify.md](reference/verify.md) | `review.md` | Yes |
| Release | [reference/release.md](reference/release.md) | PR link in `state.md` | — |

Plan decides which phases run. Follow the `## Pipeline` checklist in `state.md`; do not add or skip phases on your own.

## 4. Checkpoints

After each phase marked "Yes" above:

1. Tick the phase in `state.md` (`- [x] <phase> — done`).
2. Show the user a summary of at most 5 bullets plus the artifact path.
3. Ask: **continue**, **revise** (redo this phase with their feedback), or **stop**.
4. Do not start the next phase until the user answers.

Skip checkpoints for this work item if the user says "dev mode" or "no checkpoints", or if the Project section says `Checkpoints: off`. Even then, stop if Verify reports a blocking issue.

## 5. Rules for every phase

- Never claim a phase is done without evidence produced in this session (test output, command output, file written).
- Write each artifact before summarizing it; the file is the contract for the next phase.
- Use the commands recorded in the Project section of `state.md`; don't rediscover them.
- When something in the request is ambiguous and the answer changes what you build, ask — don't guess.
