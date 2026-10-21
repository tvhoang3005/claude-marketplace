# Anti-patterns, Checklist, and Refactoring

## Common anti-patterns

| Anti-pattern | Why it's bad | Do this instead |
|---|---|---|
| Hardcoded colors in components | Can't be themed, drifts out of sync | Design tokens |
| Copying a component and tweaking it | A bug fixed in one copy stays in the others | Extract one component with props or variants |
| `style={{ marginTop: 24 }}` in 50 places | Magic numbers you can't change globally | `spacing["2xl"]` from tokens |
| Importing Chakra's `Button` in pages | A library upgrade means rewriting pages | Import `AppButton` from `ui/` |
| 500-line screen components | Hard to test, reuse and review | Extract organisms and molecules |
| Ad-hoc error display on each screen | Inconsistent UX | `<ErrorBox message={err} />` |
| Duplicated modal overlay code | Changing the animation means editing everywhere | `<ModalWrapper>` |

## Checklist for a new frontend project

```
[ ] Design tokens defined (colors, spacing, radii, typography, shadows)
[ ] UI atom components created (Button, Input, Card)
[ ] Barrel export (index.ts) for components/ui/
[ ] Library components wrapped, never imported directly in pages
[ ] Folders organized by feature or domain
[ ] Auth context and API client set up, with interceptors
[ ] TypeScript strict mode on
[ ] No hardcoded hex colors outside tokens.ts
```

## Refactoring an existing project

Work in this order:

1. **Create `tokens.ts`.** Extract all colors, spacing and sizes, then find-and-replace across files.
2. **Extract atoms.** Start with the most-used ones (Button, Input, Card) and wrap the library components.
3. **Extract molecules.** For example toggles, ErrorBox and modal wrappers.
4. **Update screens.** Import from the `ui/` barrel export and replace inline patterns.
5. **Grep for violations:**
   ```bash
   grep -rn '"#' src/ | grep -v tokens.ts                      # should return nothing
   grep -rln 'from "@chakra-ui' src/ | grep -v components/ui/  # should return nothing
   ```
