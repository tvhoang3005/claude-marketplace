# UX heuristics

The `ux-reviewer` agent checks these after the project's own design rules. Each item says what to look for in a screenshot or in `capture.json`.

## 1. Task flow

- **Steps and decisions:** count taps/screens and choices to finish the flow. Each one that can be removed or defaulted is a candidate.
- **Dead ends:** after the last step, is the next obvious action visible? Is there a way back without losing work?
- **Feedback:** every action shows a result (state change, toast, animation) within the screenshot after it.
- **Error and undo:** destructive actions are undoable or confirmed; errors say what happened and what to do.

## 2. Nielsen's heuristics (as visible signs)

| Heuristic | Look for |
|---|---|
| Visibility of system status | Loading, saving, syncing and offline states shown |
| Match with the real world | Labels in the user's words, not internal names |
| User control and freedom | Back, cancel, undo present where expected |
| Consistency and standards | Same action looks and sits the same on every screen; platform conventions kept |
| Error prevention | Disabled/guarded actions instead of errors after the fact |
| Recognition over recall | Options visible; no memorised gestures as the only path |
| Flexibility and efficiency | Shortcuts for frequent actions without cluttering the basic path |
| Aesthetic and minimalist design | Every element earns its place; one primary action per screen |
| Help users recover from errors | Plain-language errors next to the cause |
| Help and documentation | Empty states that teach the first action |

## 3. Visual hierarchy

- One clear primary action per screen; secondary actions visibly quieter.
- Type scale: a few sizes used consistently; headings distinguishable from body.
- Spacing: consistent rhythm; related things grouped, unrelated things separated.
- Alignment: edges line up across sections; no near-misses of a few pixels.
- Density: neither cramped on mobile nor sparse and stretched on desktop.

## 4. Accessibility (WCAG 2.2 AA essentials)

- **Contrast** (axe `color-contrast`): text ≥ 4.5:1, large text and UI components ≥ 3:1. Check text over images/glass by eye — axe can't measure backgrounds that are images.
- **Target size** (`smallTargets` in `capture.json`): WCAG 2.2 AA requires ≥ 24×24 px (or enough spacing); aim for 44×44 on touch.
- **Names and roles** (axe `button-name`, `link-name`, `label`, `aria-*`): icon-only buttons have accessible names.
- **Focus visible** and logical order; nothing reachable only by hover or gesture.
- **Motion:** honours reduced motion (capture with `--reducedMotion reduce` if motion is heavy).
- **Zoom:** zoom not disabled in the viewport meta; text reflows at 200%.

## 5. Mobile ergonomics

- Primary actions within thumb reach (lower half) on phones; destructive ones not where a thumb rests.
- Safe areas respected (notch, home indicator); fixed bars don't cover content.
- Keyboard: focused fields stay visible; inputs ≥ 16px to avoid iOS focus-zoom.
- Landscape and tablet layouts use the space instead of a stretched phone layout.

## 6. States

For each screen in scope, is there a designed **empty**, **loading**, **error**, **offline** and **long-content** state? Missing states are findings only if the screen can reach them.

## 7. Content

- Microcopy: short, specific, consistent verbs ("Save" everywhere, not "Save"/"Done"/"OK").
- Numbers and dates formatted for the user's locale.
- No truncation of important text at mobile widths.

## Severity

| Severity | Meaning |
|---|---|
| **high** | Blocks or seriously slows a core task, or fails WCAG AA |
| **medium** | Noticeable friction, inconsistency or confusion |
| **low** | Polish |
