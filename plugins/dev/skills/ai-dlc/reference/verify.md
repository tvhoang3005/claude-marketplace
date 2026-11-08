# Verify

Check the change against the specs and review it adversarially. Choose reviewers by risk, then run them **in parallel** as subagents so each starts with fresh context.

## Pick reviewers

| Condition (from `state.md`) | Reviewers |
|---|---|
| Always | `dev:code-reviewer` — code review plus the acceptance-criteria check against `specs.md` |
| `security-sensitive: yes` | add `dev:security-reviewer` |

Use these full agent names: another installed plugin may have an agent with the same short name.

## Brief each reviewer

Give every reviewer:

- the work id and the output path it must write to (`code-review.md`, `security-review.md`),
- the changed files: `git diff --name-only <base-branch>...HEAD` plus uncommitted changes,
- `specs.md` path (`code-reviewer`),
- the risk flags from `state.md`, and the absolute path of `../security-review/reference/secure-coding-patterns.md` resolved from the ai-dlc skill's base directory (`security-reviewer`).

Each returns a pointer (status, report path, ≤ 5-line summary). Read the report files to merge them.

## Merge the results into `review.md`

```markdown
# Review: <work-id>

Reviewers: code-reviewer[, security-reviewer]

## Acceptance criteria
| AC | Status | Evidence |
| AC1 | MET / NOT MET / PARTIAL | test name or file:line |

## Findings
| Severity | Source | file:line | Issue | Fix |
| blocking / should-fix / nit | code / security | ... |

## Verdict
PASS | FAIL (n blocking)
```

De-duplicate findings that two reviewers report on the same line; keep the higher severity.

## Triage each finding

Reviewers can be wrong. Check each finding against the code before acting on it.

| Finding | Do |
|---|---|
| Wrong (the code already handles it, or the trigger can't happen) | Mark it `rejected` in `review.md` with a one-line reason. Don't drop it silently |
| Pre-existing, not caused by this change | Add it to `## Follow-ups` in `state.md`. It doesn't block this item |
| `blocking`, or an unmet AC | Fix it now |
| `should-fix` | Fix it now if it's small and inside this change; otherwise ask the user whether to fix it or add it to Follow-ups |
| `nit` | Fix it only if trivial; otherwise leave it |

## Then

- **Anything to fix:** fix it (back to Construct for that item), re-run the tests, and re-verify only what changed with the reviewer that raised it. After 2 fix rounds with blocking findings still open, stop and ask the user. Don't keep looping.
- **PASS:** checkpoint with the user, then continue to Release.
