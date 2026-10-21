# Verify

Check the change against the specs and review it adversarially. Choose reviewers by risk, then run them **in parallel** as subagents so each starts with fresh context.

## Pick reviewers

| Condition (from `state.md`) | Reviewers |
|---|---|
| Size S and `security-sensitive: no` | `code-reviewer` |
| Otherwise | `requirements-reviewer` + `code-reviewer` |
| `security-sensitive: yes` (any size) | add `security-reviewer` |

For size S, `code-reviewer` also confirms each AC has a test; there is no separate requirements report.

## Brief each reviewer

Give every reviewer:

- the work id and the output path it must write to (see the table in [artifacts.md](artifacts.md)),
- the changed files: `git diff --name-only <base-branch>...HEAD` plus uncommitted changes,
- `specs.md` path (`requirements-reviewer`, and `code-reviewer` for size S),
- the risk flags from `state.md` (`security-reviewer`).

Each returns a pointer (status, report path, ≤ 5-line summary). Read the report files to merge them.

## Merge the results into `review.md`

```markdown
# Review: <work-id>

Reviewers: code-reviewer, requirements-reviewer[, security-reviewer]

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
