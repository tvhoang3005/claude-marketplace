# Handoff template

Keep the first two lines exactly in this form — the `resume-work` hook reads `Status: open` to list pending handoffs.

```markdown
# Handoff: <topic or work-id>
Status: open
Date: <yyyy-mm-dd> · Branch: <branch> · Work item: <work-id or "none">

## Goal
One or two sentences: what we are trying to achieve and why.

## Status
- Done: <item> — evidence: `<command>` → <result> | `<file path>`
- In progress: <item> — stopped at `<file:line>`, <what is half-done>
- Not started: <item>

## Decisions
- <decision> — because <reason>. Alternative considered: <x>.

## Dead ends
- Tried <approach> — failed because <evidence>. Don't retry unless <condition>.

## Open questions
- <question> — who/what can answer it.

## Next steps
1. <first concrete action: a command to run, or `file:line` + the change>
2. ...

## Environment
- Uncommitted: <`git status --short` summary, or "clean">
- Stash: <entries, or omit>
- Running / needed: <dev server, docker services, env var NAMES required>
- Commands: test `<cmd>`, run `<cmd>`

## Links
- <artifacts, PRs, issues, docs, log files>
```

Guidance:
- **Decisions** and **Dead ends** are the most valuable sections — they are what a new session can't recover from the code.
- Write for someone who has the repo but not the conversation.
- Prefer exact identifiers (paths, commands, error messages) over descriptions.
