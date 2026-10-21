# Release

Hand off to the `ship-n-check` skill. Pass it:

- the work id (used for the branch name and commit scope),
- a one-paragraph summary of the change from `state.md`,
- the acceptance criteria from `specs.md` for the PR description,
- the verdict line from `review.md`.

When `ship-n-check` returns, record the PR URL and CI status under **Notes** in `state.md` and mark `release` done. Tell the user the PR link and anything still pending (CI running, reviewers requested).
