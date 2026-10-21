# Plan

Classify the request and choose the pipeline. Read enough of the codebase to judge size and risk (entry points, affected modules); don't design yet.

## 0. Project context

Follow [project-context.md](project-context.md): read the config, detect commands, and fetch the ticket. On the first run in a repo, also check the `.gitignore` block from [artifacts.md](artifacts.md).

## 1. Classify intent

| Intent | Signals |
|---|---|
| `bug-fix-known` | Broken behaviour, cause is identified or obvious |
| `bug-fix-unclear` | Broken behaviour, cause unknown |
| `small-feature` | New behaviour touching 1–2 modules, no new data model |
| `full-feature` | New behaviour across modules, new data model, or new external integration |
| `refactor` | No behaviour change intended |
| `spike` | Question to answer, no production code expected |

## 2. Size

| Size | Rule of thumb |
|---|---|
| S | ≤ 3 files, one module, one acceptance criterion or so |
| M | One feature slice across a few modules, fits in one PR a reviewer can read in one sitting |
| L | Multiple independent slices, more than ~15 files, or more than one deployable change |

**Size L:** recommend splitting before continuing. At the checkpoint, offer to run the `sdlc-breakdown` skill. If the user agrees, this work item becomes the parent, and each child item runs its own pipeline. If they decline, record "split declined" under Notes and continue.

## 3. Risk flags

Set `security-sensitive: yes` if any of these apply; Verify then adds a security review:

- touches authentication, authorization, sessions or tokens
- handles payments, personal data, secrets or credentials
- parses untrusted input (request bodies, uploads, webhooks, deserialization)
- adds or changes an external integration, or raw SQL or shell commands
- touches a path listed in `securityPaths` in the project config

## 4. Pick the pipeline

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
- Security-sensitive: yes | no  (which flag)
- Risks: <bullets, or "none identified">
- Parent: <parent work-id, if this is a child item>

## Project
(see project-context.md)

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

**Always write `state.md`, even with gaps.** If you can't confirm something (the code the ticket names isn't found, no test command exists, no `.gitignore`), still classify from what you have, write the file, and mark each gap inline, e.g. `Size: S (unverified: src/lib/date.ts not found)`. Raise the gaps at the checkpoint instead of stopping before the file exists. The checkpoint is where the user resolves them.

Record every checkpoint decision under **Notes**. Keep the `## Pipeline` checklist format exactly as shown: the session-start hook reads it to list unfinished work.
