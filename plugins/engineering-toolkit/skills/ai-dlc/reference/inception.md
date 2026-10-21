# Inception

Turn the request into testable requirements. Inputs: `state.md`, plus `discovery.md` or `investigation.md` if present, plus the ticket text.

## Steps

1. Write acceptance criteria in Given / When / Then form. Each one must be checkable by a test or a command.
2. List non-functional requirements only when they matter here (performance, security, accessibility, data retention).
3. List open questions. Ask the user any that change scope **before** writing the file.
4. For `refactor`: describe current behaviour that must be preserved instead of new behaviour.

**Light mode** (bug fixes): one acceptance criterion for the fix, one regression criterion, no NFR section.

## Output: `specs.md`

```markdown
# Specs: <work-id>

## Acceptance criteria
- AC1: Given ..., when ..., then ...
- AC2: ...

## Non-functional requirements
- NFR1: ...

## Out of scope
- ...

## Open questions
- (resolved) Q: ... → A: ...
```
