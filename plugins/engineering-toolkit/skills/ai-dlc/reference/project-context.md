# Project Context

Plan gathers this once per work item and records it in the **Project** section of `state.md`. Later phases and `ship-n-check` read it from there instead of rediscovering it.

## 1. Config file (optional)

If `.claude/engineering-toolkit.json` exists, read it first. Its values win over detection. Fields (all optional; see `config.example.json` in the plugin):

| Field | Meaning | Default |
|---|---|---|
| `baseBranch` | Branch PRs target | `git symbolic-ref refs/remotes/origin/HEAD`, else `main` |
| `ticketPattern` | Regex for ticket ids | `[A-Z][A-Z0-9]+-\d+` |
| `ticketSource` | `github`, `jira`, `paste`, `auto`, or `none` (no tracker: never fetch, the request is the ticket) | `auto` |
| `checkpoints` | `on` or `off` (dev mode by default) | `on` |
| `release` | `pr` (push + draft PR) or `commit-only` (commit locally, no push/PR) | `pr`; `commit-only` if the repo has no remote |
| `commands.format/lint/typecheck/test` | Exact commands | detected |
| `securityPaths` | Globs that always trigger security review | none |

## 2. Detect commands

For any command the config doesn't set, look in this order and take the first match. Record `none` if nothing fits — don't invent a command.

| Source | Where to look |
|---|---|
| `package.json` | `scripts`: `format:check`/`format`, `lint`, `typecheck`/`type-check`/`tsc`, `test`; use the lockfile to pick `npm`, `pnpm`, `yarn` or `bun` |
| `Makefile` / `justfile` | targets named `fmt`, `format`, `lint`, `typecheck`, `test` |
| `pyproject.toml` | `ruff format --check`, `ruff check`, `mypy`, `pytest` if those tools are configured |
| `go.mod` | `gofmt -l .`, `go vet ./...`, `go test ./...` |
| README / CONTRIBUTING | documented commands |

Run the test command once to confirm it works before recording it. If it fails on a clean checkout, record it with a note so Construct doesn't mistake the existing failure for a new one.

## 3. Fetch the ticket

If `ticketSource` is `none`, skip this step: record `Ticket: none` and use the request itself (plus Discovery, if it runs) as the ticket.

A match on `ticketPattern` is only a candidate. Treat it as a ticket id when it names the work item — `work on ABC-12`, `/ai-dlc plan ABC-12`, `#123`. Don't when it is part of the description: encodings, hashes, standards and versions such as `UTF-8`, `SHA-256`, `ISO-8601`, `ES-2022`. If you can't tell, ask once: "Is `<id>` a ticket id, or part of the request?"

For a ticket id, fetch the ticket text instead of guessing from the id:

1. **GitHub issue** (`#123`, `owner/repo#123`, or `ticketSource: github`): `gh issue view <id> --json title,body,labels,comments`.
2. **Jira** (`ticketSource: jira`, or a Jira-style key when a Jira/Atlassian MCP tool is available): fetch the issue with that tool — summary, description, acceptance criteria and comments.
3. **Fallback:** if neither works (no `gh`, connector not authorized, no access), say which source failed and ask the user to paste the ticket. Don't continue on the id alone.

Save the fetched title and a link in `state.md`; Inception reads the full text from there.

**No ticket** (none in the request, or `ticketSource: none`): don't ask for one. The work id is a slug of the request (see SKILL.md), `Ticket: none` goes in `state.md`, and Inception writes `specs.md` from the request — `specs.md` becomes the ticket.

## 4. Release mode

Use `release` from the config if set. Otherwise run `git remote`: no remote → `commit-only`, else `pr`. Record it so `ship-n-check` knows whether to push.

## Output: Project section of `state.md`

```markdown
## Project
- Base branch: main
- Ticket: TICKET-123 — <title> (<url>), source: jira   |   none
- Release: pr   |   commit-only (no remote)
- Commands:
  - format: npm run format:check
  - lint: npm run lint
  - typecheck: npm run typecheck
  - test: npm test (passes on clean checkout)
- Checkpoints: on
- Security paths: src/auth/**
```
