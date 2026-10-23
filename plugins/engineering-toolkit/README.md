# engineering-toolkit — Engineering Toolkit

An opinionated toolkit for Claude Code that introduces the **AI-DLC** (AI-driven development lifecycle) workflow: an adaptive pipeline from requirements to pull request, where the AI drives and you approve at checkpoints.

> **v0.2.** AI-DLC orchestrator, shipping pipeline, investigation, ticket breakdown, four review agents, git-safety and resume hooks, and an eval suite. See [Roadmap](#roadmap) for what's planned.

## Install

```bash
# 1. Add the marketplace
/plugin marketplace add tvhoang3005/claude-marketplace

# 2. Install the toolkit
/plugin install engineering-toolkit@hoangtruong-marketplace

# 3. Optional: companion plugin with frontend architecture rules (React, Next.js, React Native)
/plugin install basic-engineering@hoangtruong-marketplace

# 4. Optional: Next.js stack plugin (App Router, Server Components, Server Actions, data fetching, performance)
/plugin install nextjs-toolkit@hoangtruong-marketplace

# 5. Optional: Tauri 2 stack plugin (desktop & mobile apps — IPC commands, capability-based security, plugins, auto-update)
/plugin install tauri-toolkit@hoangtruong-marketplace
```

Requires Node.js on `PATH` for the hooks. `gh` is optional (GitHub issues, PRs and CI checks).

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
      (if vague)   (classify,   Design → Construct  (2–3 agents)  (delegates)
                   size, risk)                                        |
                        |                                             v
                  size L? → sdlc-breakdown                   +--------------+
                                                             | ship-n-check |
                                                             +--------------+
                                                       Branch → Quality → PR → CI
```

Every phase writes an artifact to `.ai-dlc/<work-id>/`. The next phase reads that file, not the chat history, so you can stop and resume a work item at any time. When you open a new session, a hook lists unfinished work items so Claude can offer to resume them.

| Phase | Writes | What happens |
|---|---|---|
| Discovery | `discovery.md` | Six forcing questions to sharpen a vague idea |
| Plan | `state.md` | Fetches the ticket, detects project commands, classifies intent, size and security risk, picks the pipeline |
| Breakdown | `breakdown.md` | Size L only: splits into child work items, each with its own pipeline |
| Investigate | `investigation.md` | Root-cause analysis for bugs with an unclear cause |
| Inception | `specs.md` | Given/When/Then acceptance criteria, NFRs, open questions |
| Design | `design.md` | Components, flow, ADRs, test plan, construction waves |
| Construct | code + tests | TDD per wave: Red → Green → Refactor → Validate |
| Verify | `review.md` | Reviewers chosen by risk, run in parallel (see below) |
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
| Any intent, size L | Plan → offer Breakdown → each child runs its own pipeline |

### Risk-scaled review

| Change | Reviewers in Verify |
|---|---|
| Size S, not security-sensitive | `code-reviewer` |
| Everything else | `requirements-reviewer` + `code-reviewer` |
| Security-sensitive (auth, payments, personal data, untrusted input, `securityPaths`) | + `security-reviewer` |

Each reviewer writes its report to `.ai-dlc/<work-id>/` and returns a short pointer, so the main session stays small on large diffs.

## Usage

| You want to... | Just say... | What triggers |
|---|---|---|
| Work on a ticket | "work on TICKET-123" | `ai-dlc` — full adaptive pipeline |
| Build a feature | "build a user dashboard" | `ai-dlc` — Discovery if vague, Plan if clear |
| Fix a bug | "fix the auth bug" | `ai-dlc` — adds Investigate if the cause is unclear |
| Debug something | "why is this failing?" | `investigate` — hypothesis-driven, never fixes |
| Split a big ticket | "break this down" | `sdlc-breakdown` — vertical slices, each shippable |
| Check for vulnerabilities | "security review this branch" | `security-review` — CWE-mapped findings with fixes |
| Ship your code | "ship it", "commit and push", "create a PR" | `ship-n-check` — branch, quality, draft PR, CI |

Run a single phase:

```bash
/engineering-toolkit:ai-dlc discovery "idea for offline mode"
/engineering-toolkit:ai-dlc plan TICKET-123
/engineering-toolkit:ai-dlc inception TICKET-123
/engineering-toolkit:ai-dlc verify TICKET-123
```

### Tickets

Plan fetches the ticket text when the request contains a ticket id:

- **GitHub issues:** through `gh issue view`.
- **Jira:** through a Jira/Atlassian MCP connector, if you have one connected and authorized.
- **Neither available:** Claude asks you to paste the ticket.

### Project config (optional)

Plan auto-detects the base branch and format, lint, type-check and test commands, and records them in `state.md`. To override detection, copy [`config.example.json`](config.example.json) to `.claude/engineering-toolkit.json` in your repo. Every field is optional.

### Git

On the first run in a repo, Plan offers to add this to `.gitignore`. It commits the agreed specs and design decisions and ignores the working files:

```gitignore
.ai-dlc/**
!.ai-dlc/*/
!.ai-dlc/*/specs.md
!.ai-dlc/*/design.md
```

## Contents

### Skills (5)

| Skill | Purpose |
|---|---|
| `security-review` | Runs `security-reviewer` against a catalogue of secure-coding patterns (CWE-mapped, with known-safe list) |
| `ai-dlc` | Orchestrator for the full lifecycle; phase guides live in `skills/ai-dlc/reference/` |
| `ship-n-check` | Branch → commit → format/lint/type-check/test → push → draft PR → CI watch |
| `investigate` | Delegates to `debugger`, writes `investigation.md`, recommends a fix |
| `sdlc-breakdown` | Splits large work into vertical, independently shippable child items |

### Agents (4)

| Agent | Purpose |
|---|---|
| `debugger` | Hypothesis-driven root-cause analysis, max 3 rounds, never edits code |
| `code-reviewer` | Adversarial review: correctness, security, tests, design |
| `requirements-reviewer` | Checks each acceptance criterion is implemented and tested |
| `security-reviewer` | OWASP-style review of security-sensitive changes |

### Hooks (2)

| Hook | Trigger | What it does |
|---|---|---|
| `git-safety` | PreToolUse (Bash) | Blocks `--no-verify`, force-push to main/master, `reset --hard`, `clean -f`, `checkout .`, `branch -D main` |
| `resume-work` | SessionStart | Lists unfinished work items from `.ai-dlc/*/state.md` |

### Evals

[`evals/`](evals/) holds behaviour tests for routing, Plan classification, risk flags and checkpoints. See [evals/README.md](evals/README.md) for how to run them.

## Opinions

- **AI drives, human validates:** the orchestrator recommends; you approve at checkpoints.
- **Adaptive pipelines:** intent, size and risk decide which phases and reviewers run, not a fixed sequence.
- **Artifact-driven contracts:** phases talk through files, not conversation history.
- **TDD:** Red → Green → Refactor → Validate.
- **Adversarial review:** assume bugs exist until shown otherwise.
- **Hooks over prompts:** deterministic guardrails for things that must never happen.

## Roadmap

Planned for later versions:

- **Phases:** Observe (post-deploy health checks), separate Domain and Logical Design
- **Skills:** `mode-dev` / `mode-research` / `mode-review`, `ship-pr-review`, `daily-summary`, `review-learning`, `update-docs`, `handoff`, `create-user-story`
- **Agents:** `scout`, `inspector`, `steward`, `ci-watcher`, Jira `clerk`
- **Rules:** language rules for TypeScript, Python and Go; testing, naming and logging rules
- **Hooks:** configurable `ship-conventions`, sensitive-file warning, debug-statement detection
- **Stacks:** separate `nestjs-toolkit` and `django-toolkit` plugins (`nextjs-toolkit` and `tauri-toolkit` are available now — see [Install](#install))
