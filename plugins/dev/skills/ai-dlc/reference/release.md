# Release

Hand off to the `ship-n-check` skill. Pass it:

- the work id (used for the branch name and commit scope),
- the artifact folder path, so it can read the **Project** section of `state.md` (base branch, commands) and stage `specs.md` and `design.md`,
- a one-paragraph summary of the change from `state.md`,
- the acceptance criteria from `specs.md` for the PR description,
- the verdict line from `review.md`,
- the `## Follow-ups` from `state.md`, if any, for the PR's Notes line.

When `ship-n-check` returns, record the PR URL and CI status under **Notes** in `state.md` and tick `release`. Tell the user the PR link and anything still pending (CI running, reviewers requested). If there are Follow-ups, list them and offer to create tickets for them. Show the ticket text first (see the `team-writing` rule).

With `Release: commit-only`, record the branch and commit SHA instead of a PR URL, and tell the user the work is committed locally and how to merge it (`git checkout <base> && git merge <branch>`).

If the Project section records a `Worktree`, tell the user how to remove it once the PR is merged (or, for `commit-only`, once the branch is merged): from the main checkout, run `git worktree remove <path>`. This also deletes the worktree's `.ai-dlc/` working files. Don't run it yourself, and never pass `--force`.

If this item is a child from `breakdown`, also tell the user which sibling is next according to the parent's `breakdown.md`.
