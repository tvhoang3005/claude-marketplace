# engineering-toolkit evals

Behaviour tests for the plugin, run with `claude plugin eval`. Each case is one `case.yaml`.

| Case | Checks |
|---|---|
| `route-feature-to-ai-dlc` | A feature request starts `ai-dlc` |
| `route-debug-to-investigate` | "Why is this failing" starts `investigate` |
| `route-ship-to-ship-n-check` | "Ship it" starts `ship-n-check` |
| `route-split-to-breakdown` | "Break this down" starts `sdlc-breakdown` |
| `no-trigger-on-general-question` | A general question starts no toolkit skill (all 7) |
| `vague-request-starts-discovery` | Vague request → Discovery questions, no specs |
| `plan-bug-known-pipeline` | Known-cause bug → `bug-fix-known`, no Investigate, checklist format, stops at checkpoint |
| `plan-flags-security` | Auth change → `Security-sensitive: yes` |
| `plan-large-offers-breakdown` | Epic → size L and a split offer |
| `route-audit-to-codebase-review` | "Is this project structured correctly?" starts `codebase-review` |
| `route-wrapup-to-handoff` | "Stopping for today, save context" starts `handoff` |
| `handoff-writes-file` | Handoff file written with `Status: open`, dead ends and a concrete next step |
| `plan-no-ticket-utf8` | No ticket + `UTF-8` in the request → slug work id, `state.md` written, no ticket prompt |

## Run

From the repo root:

```bash
# Routing cases only (read-only tools, cheap)
claude plugin eval ./plugins/engineering-toolkit --tag routing

# Everything — Plan cases write state.md, so grant Write
claude plugin eval ./plugins/engineering-toolkit --allow-tools Write

# One case, one run, while iterating on a skill
claude plugin eval ./plugins/engineering-toolkit --case plan-bug-known-pipeline --runs 1 --allow-tools Write
```

Each run starts a full Claude session on your account, and cases run 3 times by default, so a full suite costs real tokens. Use `--max-cost-usd` to cap it.

Routing graders (`tool_used: Skill`) are reported as indicators rather than scored in the default with/without-plugin comparison, because the skill can't fire without the plugin. The negative case uses `arm: both` so it is scored in both arms.

## Adding a case

Create `evals/<case-name>/case.yaml`. Prefer deterministic graders (`tool_used`, `file_exists`, `regex` on a file) over `llm`. Use an `llm` grader only for judgement calls such as "asked before designing". Put ticket text inline in the prompt; cases have no fixture project.
