---
paths:
  - "**/*"
---

# Team-facing writing

PRs, commits, tickets, review comments, committed docs and code comments go out under the user's name. Write them the way a busy senior engineer would by hand. Put the point first, and skip greetings, recaps of the ticket and filler. Say each fact once and drop empty sections. Use plain, short sentences, copy code and ids verbatim, and don't use emoji headers or "Overview:" scaffolding. A commit subject is at most 72 characters. The skills that write PRs, tickets and docs load the full guide with length budgets.

Before posting a comment or creating a ticket outside the repo (Jira, GitHub issues, PR comments), show the user the text and post it only once they agree. PRs opened by `ship-n-check` are the exception.

## Code comments

A comment explains the code that stays, not the change that added it.

- **Comment rarely.** Add one only when a careful reader would get the code wrong without it: a non-obvious reason, a workaround, an invariant, an external API gotcha. One line is the norm.
- **No ticket, decision or work-item ids** (`TTT-6083`, `D-011`, `ADR-2`, `AC3`) and no links to them. If a reason matters, write the reason itself.
- **No change narration** such as "Added for…", "Fixed bug where…" or "As requested in review". That belongs in the commit message.
- **Test names describe behaviour** (`rejects expired tokens`), not the criterion id.
- **Exception:** `TODO(<ticket>)` for a known follow-up, when the repo already uses that form.

Existing `// TTT-1234` comments are not a convention to copy. Rewrite or delete them only on lines you edit.
