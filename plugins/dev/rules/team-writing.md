---
paths:
  - "**/*"
---

# Team-facing writing

Anything that leaves this session goes out under the user's name: PR titles and bodies, PR and review comments, Jira or GitHub issues and comments, commit messages, committed docs (`specs.md`, `design.md`, README changes), and the comments in the code itself. Write it the way a busy senior engineer on the team would write it by hand. AI drafted it, but the user is the one presenting it.

## Rules

- **Lead with the point.** The first line says what changed, what's decided, or what's needed from the reader. No preamble.
- **Cut ceremony.** No greetings, sign-offs, "This PR…", "In summary", "I hope this helps", praise, or a recap of the ticket the reader already has. Leave out filler words like just, really, basically, simply and comprehensive.
- **Say each fact once.** Link to the ticket, file or CI run instead of restating it. Don't repeat in prose what the diff, a table or a checklist already shows.
- **Leave out empty sections.** A section with nothing worth saying is deleted, not filled with "N/A" or "None".
- **Plain sentences, not caveman.** Use full, short sentences and active voice. Bullets are fine. Don't drop articles or negations, and don't invent abbreviations.
- **Keep the payload exact.** Code, commands, paths, error text, numbers and ticket ids are copied verbatim.
- **No AI tells.** No emoji headers, decorative bold, "Key changes:"/"Overview:" scaffolding, or an "AI-generated" signature unless the user or repo asks for one.
- **Don't pad uncertainty.** Say a risk once, where it applies ("Not tested on Safari."), not as a hedging paragraph.

## Code comments

Code is read long after the ticket is closed, by people who never open it. A comment explains the code that stays, not the change that added it.

- **Comment rarely.** Add one only when a careful reader would get the code wrong without it: a non-obvious reason, a workaround, an invariant, a gotcha in an external API. Clear names beat comments.
- **No ticket, decision or work-item ids** (`TTT-6083`, `D-011`, `ADR-2`, `AC3`) and no links to them. The commit, the PR and `specs.md`/`design.md` already trace the change to its ticket. If a reason matters, write the reason itself in one line.
- **No change narration:** no "Added for…", "Fixed bug where…", "New: …", "Updated to…", or "As requested in review". That history belongs in the commit message.
- **One line is the norm.** A multi-line comment is only for something like an algorithm or a protocol quirk, never for restating what the code does.
- **Test names and test comments follow the same rules.** Describe the behaviour (`rejects expired tokens`), not the criterion id.
- **Exception:** `TODO(<ticket>)` for a known follow-up, when the repo already uses that form.

Follow the repo's comment format (docstrings, JSDoc), but not existing ticket-id comments. Old code full of `// TTT-1234` is not a convention to copy. When you edit lines that carry such a comment, rewrite it as a one-line reason or delete it. Leave untouched lines alone: a repo-wide sweep is a separate cleanup change.

## Length budgets

| Output | Budget |
|---|---|
| Commit message | Subject ≤ 72 chars; a body only when the *why* isn't obvious, ≤ 3 lines |
| PR body | ≤ 15 lines before the checklist, which is usually 3–5 sentences of summary |
| PR or review comment | 1–3 sentences per finding: what, why it matters, the suggested fix |
| Jira/issue comment | ≤ 5 lines: status or answer first, then the blocker or next step |
| New issue/ticket | One-sentence goal, acceptance criteria, links. No background essay |
| `specs.md` / `design.md` | Only sections that carry a decision or a criterion; one line per item where possible |

Going over a budget is fine when the content needs it, such as a migration with real rollout steps. Length should come from content, not from explanation.

## Exceptions: write in full sentences

- Security issues, data loss and irreversible steps: state the impact and the required action plainly.
- Ordered steps a reader will follow, such as rollout, migration or repro steps: number them.

Before posting a comment or creating a ticket outside the repo (Jira, GitHub issues, PR comments), show the user the text and post it only once they agree. PRs opened by `ship-n-check` are the exception, because the user asked to ship.
