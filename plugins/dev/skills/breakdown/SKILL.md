---
name: breakdown
description: Splits a large ticket or feature into small, independently shippable work items, each run through its own ai-dlc pipeline. Use when the user says "break this down", "split this ticket", "this is too big", or when ai-dlc Plan rates work as size L.
argument-hint: "<parent work-id or description>"
---

# Breakdown

Turn one large work item into child items that can each be built, reviewed and shipped on their own.

## 1. Understand the whole

Read the parent's `state.md` and `specs.md` if they exist in `.ai-dlc/<parent-id>/`. Otherwise read the ticket or request and skim the affected code. Don't design the solution; just find the seams.

## 2. Split

Prefer **vertical slices** (each delivers a user-visible piece end to end) over horizontal layers (all the DB work, then all the API work). Every child must:

- be size S or M (see the ai-dlc Plan sizing),
- ship behind its own PR, leaving the main branch working,
- have 1–4 acceptance criteria of its own,
- list which other children it depends on, if any.

Split along whichever seam fits: user-visible capability, data migration before behaviour, read path before write path, or feature flag first then the behaviour behind it. Aim for 2–6 children; if you need more, the parent is probably several tickets.

## 3. Check

Confirm that together the children cover every parent acceptance criterion, that no child depends on a later one, and that the first child can start today.

## Output

Write `.ai-dlc/<parent-id>/breakdown.md`:

```markdown
# Breakdown: <parent-id>

| # | Child id | Title | Size | Depends on | Covers parent AC |
|---|---|---|---|---|---|
| 1 | <parent-id>-1 | ... | S | — | AC1 |

## <parent-id>-1: <title>
Acceptance criteria:
- Given ..., when ..., then ...
```

Then:

1. In the parent's `state.md`, add the child ids under **Notes** and mark the remaining parent phases `- [x] <phase> — split into children`.
2. Show the user the table and ask whether to create the children as tickets (GitHub issues via `gh issue create`, or Jira through its connector if available) or keep them local.
3. Offer to start the first child: `/dev:ai-dlc <parent-id>-1`.
