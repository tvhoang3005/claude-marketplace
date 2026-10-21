# Release

Hand off to the `ship-n-check` skill. Pass it:

- the work id (used for the branch name and commit scope),
- the artifact folder path, so it can read the **Project** section of `state.md` (base branch, commands) and stage `specs.md` and `design.md`,
- a one-paragraph summary of the change from `state.md`,
- the acceptance criteria from `specs.md` for the PR description,
- the verdict line from `review.md`.

When `ship-n-check` returns, record the PR URL and CI status under **Notes** in `state.md` and tick `release`. Tell the user the PR link and anything still pending (CI running, reviewers requested).

If this item is a child from `sdlc-breakdown`, also tell the user which sibling is next according to the parent's `breakdown.md`.
