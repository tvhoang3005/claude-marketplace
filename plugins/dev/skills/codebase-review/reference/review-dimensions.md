# Review dimensions

The `architecture-reviewer` agent works through these in order, within the area and focus it was given. Security has its own agent and is not repeated here.

For each dimension: look for evidence, compare against the stack yardstick (if given) and the project's own conventions, and record findings only where there is a concrete cost — a bug risk, friction for the next change, or a mismatch with the framework that will bite on upgrade.

## 1. Layout and conventions

- Does the directory layout match the framework's expected structure for this major version? (e.g. Tauri 2 `src-tauri/capabilities/`, Next.js `app/` vs `pages/`)
- Is the same kind of thing done the same way across the codebase (naming, file placement, module style)? Inconsistency is a finding only when it misleads.
- Leftovers from an older framework version or a template (dead config keys, unused scaffolding files).

## 2. Boundaries and dependencies

- Are responsibilities separated (UI / domain logic / IO), or is business logic tangled into handlers, components or entry files?
- Circular imports, god files (well over ~500 lines doing several jobs), modules reaching into another module's internals.
- Duplicate implementations of the same thing.

## 3. Error handling and robustness

- Errors swallowed, turned into strings too early, or surfaced to users with internal detail.
- Panics/crashes on input the program doesn't control (`unwrap`, unchecked casts, missing null handling) at boundaries.
- Blocking or long work on a UI/main thread.

## 4. Configuration and build

- Config files valid for the framework version in use; environment-specific values not hard-coded.
- Lockfile present and committed; one package manager.
- Build, lint, format and type-check scripts exist and run.

## 5. Tests

- Does the test command exist and pass? (given in the brief)
- Which critical paths have no tests? Name the paths, not a coverage percentage.
- Tests that test implementation details or are skipped/disabled.

## 6. Tooling and delivery

- Linter/formatter configured and enforced (pre-commit or CI).
- CI exists and runs the quality gates; release/signing steps if the project ships binaries.
- README: can a new developer install, run and test from it?

## 7. Dependencies

- Outdated major versions of the framework or core libraries, especially ones past end of support.
- Unused dependencies; heavy dependencies for trivial use.
- Do not run installs. Read manifests; run an already-available audit command only if it is read-only.

## Severity

| Severity | Meaning |
|---|---|
| **high** | Likely to cause a bug, data loss, broken build/release, or blocks a framework upgrade |
| **medium** | Real friction or risk, but not urgent |
| **low** | Consistency or polish |

## Effort

| Effort | Meaning |
|---|---|
| **S** | Under an hour, one or two files |
| **M** | A focused PR |
| **L** | Several PRs or a migration — candidate for `breakdown` |
