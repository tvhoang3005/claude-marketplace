# Styling, File Structure, and Data Flow

## Styling

### React Native

- Always use `StyleSheet.create()`. Avoid inline style objects, because they create a new object on every render.
- Import all values from tokens. `grep -rn '"#' src/` should return no hits outside `tokens.ts`.
- Move repeated style patterns into a shared stylesheet or component.

### Web (CSS-in-JS, Chakra, Tailwind)

- Use the framework's design system first: Chakra semantic tokens or Tailwind classes.
- Fall back to inline `style={}` only for values the framework can't express.
- If you write `style={{ color: "#4CAF50" }}` more than once, the value belongs in tokens.

### Cross-platform

- Keep token values identical on mobile and web (`primary` is `#4CAF50` in both).
- Token structure can differ: React Native uses objects, web uses CSS variables or Chakra tokens.
- As the project grows, consider a shared `tokens.json` that both platforms import.

## File organization: by feature, not by type

```
# BAD: grouped by type (scales badly)
components/
  buttons/
  inputs/
  cards/
hooks/
services/

# GOOD: grouped by feature or domain
src/
  design/          # Tokens, theme
  components/
    ui/            # Shared atoms and molecules
    orders/        # Orders domain components
    profile/       # Profile domain components
  hooks/           # Shared hooks (useAuth, useDebounce)
  services/        # API client, storage
  types/           # TypeScript types
  lib/             # Utilities (formatCurrency, formatDate)
```

- Keep related code together. If `OrderRow` is used only by orders, it belongs in `components/orders/`.
- Shared components go in `components/ui/`.
- Each domain folder should make sense without reading the other domains.

## State and data flow

- **Context for global state such as auth:** wrap it in providers and read it through hooks.
- **Component state for UI:** form inputs, toggles, whether a modal is open.
- **Hooks for server state:** `useFetch`, `useOrders`, or a query library. Don't scatter `api.get()` calls across components.
- **Transform at the boundary:** components receive data ready to render. Serialization, mapping and any encryption happen in the service layer, not in UI code.
