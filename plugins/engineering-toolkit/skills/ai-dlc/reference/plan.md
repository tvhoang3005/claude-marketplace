# Plan

Classify the request and choose the pipeline. Read enough of the codebase to judge size and risk (entry points, affected modules); don't design yet.

## 1. Classify intent

| Intent | Signals |
|---|---|
| `bug-fix-known` | Broken behaviour, cause is identified or obvious |
| `bug-fix-unclear` | Broken behaviour, cause unknown |
| `small-feature` | New behaviour touching 1–2 modules, no new data model |
| `full-feature` | New behaviour across modules, new data model, or new external integration |
| `refactor` | No behaviour change intended |
| `spike` | Question to answer, no production code expected |

## 2. Pick the pipeline

| Intent | Pipeline |
|---|---|
| `bug-fix-known` | plan → inception (light) → construct → verify → release |
| `bug-fix-unclear` | plan → investigate → inception (light) → construct → verify → release |
| `small-feature` | plan → inception → design → construct → verify → release |
| `full-feature` | plan → inception → design → construct → verify → release |
| `refactor` | plan → inception → design → construct → verify → release |
| `spike` | plan → inception → design → STOP |

For `full-feature`, Design must include a domain model section (see design.md).

## Output: `state.md`

```markdown
# State: <work-id>

- Request: <one line>
- Intent: <intent>
- Size: S | M | L  (reason)
- Risks: <bullets, or "none identified">

## Pipeline
- [x] plan — done
- [ ] inception
- [ ] design
- [ ] construct
- [ ] verify
- [ ] release

## Notes
Decisions and user feedback from checkpoints, newest last.
```

Record every checkpoint decision under **Notes**.
