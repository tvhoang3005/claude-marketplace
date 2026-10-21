# Verify

Check the change against the specs and review it adversarially. Run both reviews in parallel as subagents so they start with fresh context:

- **`requirements-reviewer`** agent — give it the paths to `specs.md` and the changed files (`git diff --name-only` against the base branch). It checks each AC against the code and tests.
- **`code-reviewer`** agent — give it the diff. It looks for correctness bugs, security issues and design problems.

## Merge the results into `review.md`

```markdown
# Review: <work-id>

## Acceptance criteria
| AC | Status | Evidence |
| AC1 | MET / NOT MET / PARTIAL | test name or file:line |

## Findings
| Severity | file:line | Issue | Fix |
| blocking / should-fix / nit | ... |

## Verdict
PASS | FAIL (n blocking)
```

## Then

- **Any blocking finding or unmet AC:** fix it (back to Construct for that item), re-run tests, and re-verify only what changed.
- **PASS:** checkpoint with the user, then continue to Release.
