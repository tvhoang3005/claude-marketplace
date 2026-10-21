# Component Layers

## Rule: never use library components directly in page or screen code

Wrap every third-party component (Chakra `<Button>`, React Native `<TextInput>`, MUI `<TextField>`) in a component of your own.

### Why

- **Library upgrades:** if the library changes its API in a new major version, you fix one wrapper file instead of 50 screens.
- **Consistency:** your `<AppButton>` enforces your design (radius, font weight, padding). A raw `<Button>` doesn't.
- **Variants:** define `primary`, `secondary`, `danger` and `ghost` once instead of repeating `colorPalette="green"` in 30 places.
- **Simpler props:** expose only what the app needs and hide library-specific options.

## Structure

```
src/components/
  ui/                # Atoms and molecules: shared building blocks
    AppButton.tsx
    AppInput.tsx
    Card.tsx
    Chip.tsx
    Tag.tsx
    FAB.tsx
    SegmentedToggle.tsx
    ErrorBox.tsx
    ModalWrapper.tsx
    StatCard.tsx
    index.ts         # Barrel export

  orders/            # Domain organisms
    OrderRow.tsx
    OrderList.tsx
    StatusPicker.tsx

  profile/           # Domain organisms
    ProfileCard.tsx
    AddressList.tsx
```

## Barrel export

```ts
// components/ui/index.ts
export { default as AppButton } from "./AppButton";
export { default as AppInput } from "./AppInput";
export { default as Card } from "./Card";

// Usage in screens
import { AppButton, Card, AppInput } from "@/components/ui";
```

## Atomic design (adapted)

This is a practical version, not Brad Frost's full methodology.

| Level | What | Examples | Where |
|---|---|---|---|
| **Atoms** | Single-purpose UI elements | Button, Input, Card, Tag, Badge, FAB | `components/ui/` |
| **Molecules** | Atoms combined for one purpose | SegmentedToggle, FilterChips, StatCard, ErrorBox | `components/ui/` |
| **Organisms** | Domain-specific sections | OrderList, CheckoutForm, ProfileCard | `components/<domain>/` |
| **Screens/Pages** | Full pages built from organisms | OrdersScreen, ProfilePage | `app/` routes |

- Atoms know nothing about business logic. They take props and render.
- Molecules combine atoms but don't touch APIs or app state.
- Organisms may use hooks, call APIs and keep local state.
- Screens compose organisms and handle routing and navigation.

## Avoid coupling to libraries

### The abstraction test

Ask: "If I swap Chakra, MUI, Tailwind or RN Paper for another library, how many files change?"

- **Bad answer:** 50 or more. You're coupled directly to the library.
- **Good answer:** 5 to 10, just your atom wrappers. You're abstracted from it.

### Practical rules

- Page and screen files import from `@/components/ui`, never from `@chakra-ui/react` directly.
- Only the atom wrappers in `components/ui/` import library components.
- Exception: use layout primitives (`Box`, `Flex`, `View`) directly. They're too basic to be worth wrapping.
