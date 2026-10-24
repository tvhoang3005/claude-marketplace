# Design

Decide how to build it before writing code. Inputs: `state.md`, `specs.md`, and the existing code in the affected area. Follow the patterns already in the codebase unless a spec requires otherwise.

## Steps

1. **Domain model** (only when the change adds a data model): entities, value objects, relationships, and invariants.
2. **Components:** the files or modules to add or change, and what each is responsible for.
3. **Flow:** the main path through those components for each acceptance criterion.
4. **Decisions:** any choice with a real alternative, recorded as a short ADR (context, decision, consequence).
5. **Test plan:** which test covers each AC, at which level (unit, integration, e2e).
6. **Waves:** split construction into ordered waves of a few files each, so each wave ends in a green test run.

## Output: `design.md`

```markdown
# Design: <work-id>

## Domain model        (only with a new data model)
## Components
| Path | Change | Responsibility |
## Flow
## Decisions
### ADR-1: <title>
Context / Decision / Consequence
## Test plan
| AC | Test | Level |
## Waves
1. ...
2. ...
```

For a `spike`, end the pipeline here: summarize the answer to the spike question at the checkpoint.
