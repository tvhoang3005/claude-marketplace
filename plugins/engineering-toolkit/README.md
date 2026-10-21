# engineering-toolkit — Engineering Toolkit

An opinionated toolkit for Claude Code that introduces the **AI-DLC** (AI-driven development lifecycle) workflow: an adaptive pipeline from requirements to pull request, where the AI drives and you approve at checkpoints.

> **v0.1 — minimal core.** This release ships the AI-DLC orchestrator, the shipping pipeline, investigation, three review agents and a git-safety hook. See [Roadmap](#roadmap) for what's planned.

## Install

```bash
# 1. Add the marketplace
/plugin marketplace add tvhoang3005/claude-marketplace

# 2. Install the toolkit
/plugin install engineering-toolkit@hoangtruong-marketplace
```

Requires Node.js on `PATH` for the git-safety hook.

## How It Works

```
          "work on TICKET-123" / "build a user dashboard" / "fix the auth bug"
                                        |
                                        v
                                +--------------+
                                |    ai-dlc    |  Development orchestrator
                                +--------------+  Plan → Build → Ship
                                        |
          +-------------+---------------+---------------+-------------+
          |             |               |               |             |
      Discovery       Plan         Inception →       Verify        Release
      (if vague)   (classify)   Design → Construct  (2 agents)   (delegates)
                                                                      |
                                                                      v
                                                             +--------------+
                                                             | ship-n-check |
                                                             +--------------+
                                                       Branch → Quality → PR → CI
```

Every phase writes an artifact to `.claude/artifacts/<work-id>/`. The next phase reads that file, not the chat history, so you can stop and resume a work item at any time.

| Phase | Writes | What happens |
|---|---|---|
| Discovery | `discovery.md` | Six forcing questions to sharpen a vague idea |
| Plan | `state.md` | Classifies intent and picks the pipeline |
| Investigate | `investigation.md` | Root-cause analysis for bugs with an unclear cause |
| Inception | `specs.md` | Given/When/Then acceptance criteria, NFRs, open questions |
| Design | `design.md` | Components, flow, ADRs, test plan, construction waves |
| Construct | code + tests | TDD per wave: Red → Green → Refactor → Validate |
| Verify | `review.md` | `requirements-reviewer` + `code-reviewer` run in parallel |
| Release | PR link | Hands off to `ship-n-check` |

You get a checkpoint (**continue / revise / stop**) after every phase except Construct. Say "dev mode" to skip checkpoints for the current work item.

### Adaptive pipeline

| Intent | Pipeline |
|---|---|
| Vague request | Discovery → Plan → (chosen by Plan) |
| Bug fix, cause known | Plan → Inception (light) → Construct → Verify → Release |
| Bug fix, cause unclear | Plan → Investigate → Inception (light) → Construct → Verify → Release |
| Small feature / refactor | Plan → Inception → Design → Construct → Verify → Release |
| Full feature | Plan → Inception → Design (+ domain model) → Construct → Verify → Release |
| Spike | Plan → Inception → Design → STOP |

## Usage

| You want to... | Just say... | What triggers |
|---|---|---|
| Work on a ticket | "work on TICKET-123" | `ai-dlc` — full adaptive pipeline |
| Build a feature | "build a user dashboard" | `ai-dlc` — Discovery if vague, Plan if clear |
| Fix a bug | "fix the auth bug" | `ai-dlc` — adds Investigate if the cause is unclear |
| Debug something | "why is this failing?" | `investigate` — hypothesis-driven, never fixes |
| Ship your code | "ship it", "commit and push", "create a PR" | `ship-n-check` — branch, quality, draft PR, CI |

Run a single phase:

```bash
/engineering-toolkit:ai-dlc discovery "idea for offline mode"
/engineering-toolkit:ai-dlc plan TICKET-123
/engineering-toolkit:ai-dlc inception TICKET-123
/engineering-toolkit:ai-dlc verify TICKET-123
```

## Contents

### Skills (3)

| Skill | Purpose |
|---|---|
| `ai-dlc` | Orchestrator for the full lifecycle; phase guides live in `skills/ai-dlc/reference/` |
| `ship-n-check` | Branch → commit → format/lint/type-check/test → push → draft PR → CI watch |
| `investigate` | Delegates to `debugger`, writes `investigation.md`, recommends a fix |

### Agents (3)

| Agent | Purpose |
|---|---|
| `debugger` | Hypothesis-driven root-cause analysis, max 3 rounds, read-only |
| `code-reviewer` | Adversarial review: correctness, security, tests, design |
| `requirements-reviewer` | Checks each acceptance criterion is implemented and tested |

### Hooks (1)

| Hook | Trigger | What it blocks |
|---|---|---|
| `git-safety` | PreToolUse (Bash) | `--no-verify`, force-push to main/master, `reset --hard`, `clean -f`, `checkout .`, `branch -D main` |

## Opinions

- **AI drives, human validates:** the orchestrator recommends; you approve at checkpoints.
- **Adaptive pipelines:** intent decides which phases run, not a fixed sequence.
- **Artifact-driven contracts:** phases talk through files, not conversation history.
- **TDD:** Red → Green → Refactor → Validate.
- **Adversarial review:** assume bugs exist until shown otherwise.
- **Hooks over prompts:** deterministic guardrails for things that must never happen.

## Roadmap

Planned for later versions:

- **Phases:** Observe (post-deploy health checks), separate Domain and Logical Design
- **Skills:** `sdlc-breakdown`, `mode-dev` / `mode-research` / `mode-review`, `ship-pr-review`, `daily-summary`, `review-learning`, `update-docs`, `handoff`, `create-user-story`
- **Agents:** `scout`, `inspector`, `steward`, `security-reviewer`, `ci-watcher`, Jira `clerk`
- **Rules:** language rules for TypeScript, Python and Go; testing, naming and logging rules
- **Hooks:** configurable `ship-conventions`, sensitive-file warning, debug-statement detection
- **Stacks:** separate `nestjs-toolkit`, `nextjs-toolkit` and `django-toolkit` plugins
