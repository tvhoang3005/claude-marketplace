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

## Then

- **Any blocking finding or unmet AC:** fix it (back to Construct for that item), re-run the tests, and re-verify only what changed with the reviewer that raised it.
- **PASS:** checkpoint with the user, then continue to Release.
