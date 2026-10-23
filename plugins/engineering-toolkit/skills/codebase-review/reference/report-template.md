# Report template: `codebase-review.md`

```markdown
# Codebase review: <work-id>

- Date: <yyyy-mm-dd> · Commit: <short sha> · Area: <path or "whole repo"> · Focus: <all | …>
- Stack: <framework + major version, language, key libraries>
- Yardstick: <stack skill and references used, or "general practice — no stack skill installed">
- Tests: `<command>` → <passed | failed (n) | none found>

## Verdict
One or two sentences: overall health and the single most important thing to do.

| High | Medium | Low |
|---|---|---|
| n | n | n |

## Findings

### F1 · <title> — high · effort S|M|L · <dimension>
- **Evidence:** `path/to/file.rs:42` — <what is there>
- **Why it matters:** <the concrete cost or risk>
- **Recommendation:** <the change, following the yardstick reference if one applies>

### F2 · ...

## Also noted
- <one line each for lower-priority findings beyond the top 15>

## What's working
- <practices worth keeping, with a file reference>

## Suggested order
1. Quick wins (high/medium, effort S): F…, F…
2. Next PRs (effort M): F…
3. Larger work (effort L, consider `sdlc-breakdown`): F…

## Not reviewed
- <areas skipped, dimensions out of focus, anything that couldn't be checked and why>
```

Rules:
- Findings are numbered F1…Fn in the order shown, so the user can refer to them ("fix F3").
- A finding the reviewer could not confirm is marked `(unverified)` in its title.
- No generic advice ("add more tests") — name the file, the path or the missing piece.
