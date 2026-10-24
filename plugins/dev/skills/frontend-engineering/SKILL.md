---
name: frontend-engineering
description: Frontend architecture rules for React, Next.js and React Native/Expo — design tokens, wrapping UI library components, atomic component structure, feature-based folders. Use when starting a frontend project, adding UI components or screens, reviewing frontend code, or refactoring hardcoded styles.
---

# Frontend Engineering

Apply these rules from the first commit. Retrofitting them later costs far more than starting with them.

## Core rules

1. **Design tokens only.** No raw hex colors, pixel values or radii in components. Every value lives in `src/design/tokens.ts` and is named by meaning (`primary`, `danger`, `textMuted`), not by appearance (`green`, `red`).
2. **Wrap library components.** Screens and pages import from `@/components/ui`, never from the UI library directly. Only the atom wrappers in `components/ui/` import the library. Layout primitives (`Box`, `Flex`, `View`) are the exception.
3. **Atomic layers.** Atoms and molecules in `components/ui/` render props and know no business logic. Organisms in `components/<domain>/` may use hooks and call APIs. Screens compose organisms and handle routing.
4. **Feature-based folders.** Group code by domain (`components/orders/`), not by type (`components/buttons/`). Shared pieces go in `components/ui/`.
5. **Data flow.** Context for global state such as auth, component state for UI state, custom hooks for server state. Never scatter raw `api.get()` calls across components.

## How to use this skill

- **Starting a project:** set things up in this order: tokens → atoms → barrel export → folder structure. Then work through the checklist in [reference/refactoring.md](reference/refactoring.md).
- **Adding a component:** decide its layer (rule 3), take every value from tokens, and export it from the barrel when it is shared.
- **Reviewing or refactoring:** run the violation greps and follow the refactor order in [reference/refactoring.md](reference/refactoring.md).

Read a reference file only when the task needs its detail:

| File | Covers |
|---|---|
| [reference/design-tokens.md](reference/design-tokens.md) | Token structure, naming convention, React Native and web examples |
| [reference/component-layers.md](reference/component-layers.md) | Wrapping library components, barrel exports, atomic design, the abstraction test |
| [reference/styling-and-structure.md](reference/styling-and-structure.md) | Styling per platform, folder layout, state and data flow |
| [reference/refactoring.md](reference/refactoring.md) | Anti-patterns, new-project checklist, refactor order and greps |
