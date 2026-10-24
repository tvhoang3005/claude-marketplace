# Report template: `ux-review.md`

```markdown
# UX review: <work-id>

- Date: <yyyy-mm-dd> · Commit: <short sha> · Source: <Storybook | preview | dev server | URL>
- Scope: <screens / flow> · Viewports: <mobile, desktop…> · Focus: <all | …>
- Project rules used: <paths, or "none found">
- Stack references used: <paths, or "none">
- Automated checks: axe <on | not installed> · touch targets <measured | not measured>

## Verdict
One or two sentences: how the experience feels overall and the single change with the most impact.

| High | Medium | Low | Tensions |
|---|---|---|---|
| n | n | n | n |

## Suggestions

### U1 · <title> — high · effort S|M|L · <area: flow | hierarchy | a11y | mobile | states | content | consistency>
- **Evidence:** `ux/<file>.png` — <what is visible, where> (+ axe rule / measurement if any)
- **Why it matters:** <the user's cost: extra step, missed action, unreadable text…>
- **Suggestion:** <the concrete change, within the project's design rules>
- **Rule:** <project rule it supports, or the heuristic>

### U2 · ...

## Tensions (need a decision)
- **<topic>:** heuristic <x> suggests <y>, but the project rule <path §…> says <z>. Options: …

## What's working
- <strengths to keep, with a screenshot reference>

## Not reviewed
- <screens, states, viewports or checks not covered, and why>
```

Rules:
- Every suggestion cites a screenshot file. No screenshot, no suggestion.
- At most 12 suggestions, highest impact first; numbered U1…Un so the user can say "do U3".
- Never suggest something a documented project rule forbids — that goes under Tensions.
