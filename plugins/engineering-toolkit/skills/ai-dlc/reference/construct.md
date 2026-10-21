# Construct

Implement with TDD, one wave at a time from `design.md` (or one wave covering `specs.md` when there was no Design phase).

## For each wave

1. **Red:** write the tests for this wave's acceptance criteria. Run them and confirm they fail for the expected reason.
2. **Green:** write the minimum code to pass. Run the tests.
3. **Refactor:** clean up names and duplication with the tests still green.
4. **Validate:** run the project's lint, type-check and full affected test suite. Fix anything you broke.

Discover the project's commands from `package.json`, `Makefile`, `pyproject.toml`, `go.mod` or the README — don't guess them.

## Rules

- Follow existing code patterns in the module you are changing.
- Don't change code outside the components listed in `design.md` without noting why in `state.md`.
- If a test can't be made to pass within the design, stop and tell the user; don't weaken the test.

## Done when

Every AC in `specs.md` has a passing test, and lint, type-check and tests pass. Mark `construct` done in `state.md` with the test command and result, then go straight to Verify.
