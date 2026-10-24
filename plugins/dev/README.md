# dev

An opinionated toolkit for Claude Code that introduces the **AI-DLC** (AI-driven development lifecycle) workflow: an adaptive pipeline from requirements to pull request, where the AI drives and you approve at checkpoints.

> **v0.2.** AI-DLC orchestrator, shipping pipeline, investigation, ticket breakdown, four review agents, git-safety and resume hooks, and an eval suite. See [Roadmap](#roadmap) for what's planned.

## Install

```bash
# 1. Add the marketplace
/plugin marketplace add tvhoang3005/claude-marketplace

# 2. Install the plugin
/plugin install dev@hoangtruong

# 3. Optional: Next.js stack plugin (App Router, Server Components, Server Actions, data fetching, performance)
/plugin install nextjs@hoangtruong

# 4. Optional: Tauri 2 stack plugin (desktop & mobile apps — IPC commands, capability-based security, plugins, auto-update)
/plugin install tauri@hoangtruong

# 5. Optional: PWA stack plugin (manifest, service worker, offline storage, push, Mobile Safari)
/plugin install pwa@hoangtruong
```

> Renamed in 0.7: this plugin was `engineering-toolkit` and the marketplace was `hoangtruong-marketplace`. Remove the old ones and install again (see the root README).

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
      (if vague)   (classify,   Design → Construct  (1–2 agents)  (delegates)
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
| Verify | `review.md` | `code-reviewer`, plus `security-reviewer` when risky, in parallel (see below) |
| Release | PR link | Hands off to `ship-n-check` |

You get a checkpoint (**continue / revise / stop**) after every phase except Construct. Say "dev mode" to skip checkpoints for the current work item.

### Adaptive pipeline

| Intent | Pipeline |
|---|---|
| Vague request | Discovery → Plan → (chosen by Plan) |
| Bug fix, cause known | Plan → Inception (light) → Construct → Verify → Release |
| Bug fix, cause unclear | Plan → Investigate → Inception (light) → Construct → Verify → Release |
| Feature / refactor | Plan → Inception → Design → Construct → Verify → Release (Design adds a domain model when there's a new data model) |
| Any intent, size S | No Design phase, and one checkpoint covering Plan + Inception |
| Spike | Plan → Inception → Design → STOP |
| Audit ("review the project") | Plan → Review (`codebase-review`) → STOP; each finding you pick becomes its own work item |
| Any intent, size L | Plan → offer Breakdown → each child runs its own pipeline |

### Risk-scaled review

| Change | Reviewers in Verify |
|---|---|
| Every change | `code-reviewer` (code review + acceptance-criteria check) |
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
| Get UI/UX suggestions | "review the UX of the capture flow", "how can we improve this screen?" | `ux-review` — screenshots + axe + touch targets, judged against your design rules first |
| Audit an existing project | "review this project's structure", "what should we improve?" | `codebase-review` — prioritized findings with `file:line`, using a stack plugin (e.g. `tauri`) as yardstick when installed |
| Set up or review frontend structure | "add a Button component", "refactor hardcoded styles" | `frontend-engineering` — design tokens, wrapped library components, atomic layers (React, Next.js, React Native) |
| Ship your code | "ship it", "commit and push", "create a PR" | `ship-n-check` — branch, quality, draft PR, CI |

Run a single phase:

```bash
/dev:ai-dlc discovery "idea for offline mode"
/dev:ai-dlc plan TICKET-123
/dev:ai-dlc inception TICKET-123
/dev:ai-dlc verify TICKET-123
```

### Tickets

Plan fetches the ticket text when the request contains a ticket id:

- **GitHub issues:** through `gh issue view`.
- **Jira:** through a Jira/Atlassian MCP connector, if you have one connected and authorized.
- **Neither available:** Claude asks you to paste the ticket.
- **No ticket at all:** just describe the work — `/dev:ai-dlc add dark mode to settings`. The work id becomes a slug (`settings-dark-mode`) and `specs.md` serves as the ticket. Strings like `UTF-8` or `SHA-256` in a request aren't treated as ticket ids.

#### Personal projects (no tracker, maybe no remote)

```json
{ "ticketSource": "none", "release": "commit-only" }
```

`ticketSource: none` skips ticket lookup entirely. `release: commit-only` makes Release stop after a tested local commit on a `<type>/<work-id>` branch — no push, PR or CI. Without a config, a repo with no `git remote` gets `commit-only` automatically.

### Project config (optional)

Plan auto-detects the base branch and format, lint, type-check and test commands, and records them in `state.md`. To override detection, copy [`config.example.json`](config.example.json) to `.claude/ai-dlc.json` in your repo. Every field is optional.

### Git

On the first run in a repo, Plan offers to add this to `.gitignore`. It commits the agreed specs and design decisions and ignores the working files:

```gitignore
.ai-dlc/**
!.ai-dlc/*/
!.ai-dlc/*/specs.md
!.ai-dlc/*/design.md
```

## Contents

### Skills (8)

| Skill | Purpose |
|---|---|
| `security-review` | Runs `security-reviewer` against a catalogue of secure-coding patterns (CWE-mapped, with known-safe list) |
| `ai-dlc` | Orchestrator for the full lifecycle; phase guides live in `skills/ai-dlc/reference/` |
| `ship-n-check` | Branch → commit → format/lint/type-check/test → push → draft PR → CI watch |
| `investigate` | Delegates to `debugger`, writes `investigation.md`, recommends a fix |
| `sdlc-breakdown` | Splits large work into vertical, independently shippable child items |
| `codebase-review` | Audits existing code (structure, boundaries, tests, tooling, project-wide security) in parallel agents, writes `codebase-review.md` with numbered findings |
| `ux-review` | Captures screenshots, axe results and touch-target sizes with the project's Playwright, then `ux-reviewer` writes numbered, screenshot-backed suggestions (project rules first; conflicts become tensions) |
| `handoff` | Writes a self-contained handoff (goal, evidence, decisions, dead ends, next step, git state) and resumes from it |

### Agents (5)

| Agent | Purpose |
|---|---|
| `debugger` | Hypothesis-driven root-cause analysis, max 3 rounds, never edits code |
| `code-reviewer` | Adversarial review: correctness, acceptance criteria vs tests, security, design |
| `security-reviewer` | OWASP-style review of security-sensitive changes, or of a whole area (`scope: project`) |
| `ux-reviewer` | Reviews screenshots and accessibility data against the project's design rules and UX heuristics |
| `architecture-reviewer` | Read-only structure review of existing code against framework conventions |

### Hooks (2)

| Hook | Trigger | What it does |
|---|---|---|
| `git-safety` | PreToolUse (Bash) | Blocks `--no-verify`, force-push to main/master, `reset --hard`, `clean -f`, `checkout .`, `branch -D main` |
| `resume-work` | SessionStart | Lists unfinished work items from `.ai-dlc/*/state.md` and open handoffs (`Status: open`) |

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
- **Skills:** `mode-dev` / `mode-research` / `mode-review`, `ship-pr-review`, `daily-summary`, `review-learning`, `update-docs`, `create-user-story`
- **Agents:** `scout`, `inspector`, `steward`, `ci-watcher`, Jira `clerk`
- **Rules:** language rules for TypeScript, Python and Go; naming and logging rules (a `testing` rule ships now)
- **Hooks:** configurable `ship-conventions`, sensitive-file warning, debug-statement detection
- **Stacks:** separate `nestjs` and `django` plugins (`nextjs`, `tauri` and `pwa` are available now — see [Install](#install))
