# Design Tokens

Never use raw values (hex colors, pixel numbers) in components. Define tokens once and import them everywhere.

## Structure

```
src/design/
  tokens.ts       # colors, spacing, radii, fontSizes, fontWeights, shadows
```

## Rules

- **Colors:** every hex value lives in `tokens.colors`. Name by meaning (`primary`, `success`, `danger`, `textPrimary`, `border`), not by color (`green`, `red`).
- **Spacing:** use a scale (`xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24`). Never write `padding: 17`.
- **Radii:** define `sm, md, lg, xl, full`. Never write `borderRadius: 12` inline.
- **Typography:** define `fontSizes` and `fontWeights` as named scales.
- **Shadows:** define them as reusable objects (React Native) or CSS variables (web).

## Why

- Change the whole app's look by editing one file.
- Spacing and sizing stay consistent across all screens.
- New developers can't introduce stray values.
- Dark mode becomes a token swap instead of an edit across hundreds of files.

## Example: React Native

```ts
// src/design/tokens.ts
export const colors = {
  primary: "#4CAF50",
  primaryLight: "#E8F5E9",
  success: "#4CAF50",
  danger: "#F44336",
  background: "#f8f9fa",
  surface: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#666666",
  textMuted: "#999999",
  border: "#e0e0e0",
} as const;

// Component usage
import { colors } from "@/design/tokens";
<View style={{ backgroundColor: colors.background }}>
```

## Example: Web with Chakra UI

```ts
// theme/tokens.ts: only for inline overrides
export const colors = { primary: "#4CAF50" } as const;

// With Chakra, extend the theme with custom semantic tokens.
// Use Chakra's built-in palette (gray.500, green.600) for standard colors.
// Use tokens.ts only for values Chakra doesn't cover.
```

## Naming convention

```
colors.primary          # Brand color
colors.primaryLight     # Light variant for backgrounds
colors.success          # Positive state, confirmations
colors.danger           # Destructive actions, negative values
colors.background       # App background
colors.surface          # Card/container background
colors.textPrimary      # Main text
colors.textSecondary    # Secondary text
colors.textMuted        # Disabled/placeholder text
colors.border           # Borders and dividers
colors.error            # Error states
colors.warning          # Warning states

spacing.xs → 4          # Tight gaps
spacing.sm → 8          # Small gaps
spacing.md → 12         # Medium gaps
spacing.lg → 16         # Standard padding
spacing.xl → 20         # Large padding
spacing["2xl"] → 24     # Section spacing
spacing["3xl"] → 32     # Large section spacing

radii.sm → 8            # Tags, badges
radii.md → 12           # Cards, inputs, buttons
radii.lg → 16           # Large cards
radii.xl → 20           # Pills, filter chips
radii.full → 9999       # FABs, avatars (fully round)
```
