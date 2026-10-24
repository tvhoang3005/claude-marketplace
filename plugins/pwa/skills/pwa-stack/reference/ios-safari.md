# iOS / iPadOS Safari

Every browser on iOS uses WebKit, so these apply to Chrome and Firefox on iPhone too. Behaviour changes between iOS releases — confirm on the versions you support, on a real device, **installed to the Home Screen**.

## Install

- No `beforeinstallprompt`. Show your own hint: "Tap Share → Add to Home Screen", only in Safari, only when not already standalone (`navigator.standalone !== true`).
- Home screen icon comes from `<link rel="apple-touch-icon">` (180×180, opaque), not the manifest.
- Status bar: `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` draws content under the status bar — then pad with `env(safe-area-inset-top)`. iOS reads this when the app is added and caches it; changing it requires re-adding the app.
- `viewport-fit=cover` is required for `env(safe-area-inset-*)` to be non-zero.

## Storage

- An installed web app has **its own storage**, separate from Safari's for the same site. Data does not move between "tab" and "installed" — offer export/import or sync.
- For sites used in a Safari tab (not installed), WebKit's tracking prevention can delete script-writable storage (IndexedDB, localStorage, Cache API, service worker registrations) after a period without user interaction — historically 7 days. Installed home-screen apps are exempt. Don't promise "your data is safe" to tab users without sync.
- OPFS, including sync access handles in workers, is available in current iOS versions; check the minimum iOS you support.

## Push and badges

- Web Push requires **iOS/iPadOS 16.4+** and the app **added to the Home Screen**. In a Safari tab, `PushManager` isn't available.
- `Notification.requestPermission()` must be called from a user gesture (tap) inside the installed app.
- `setAppBadge()` works for home-screen apps once notification permission is granted.

## Viewport, zoom, keyboard

- **Don't** use `maximum-scale=1` / `user-scalable=no` to stop zoom. iOS ignores them for pinch-zoom anyway (since iOS 10), while they still block zoom for Android users (WCAG 1.4.4).
- iOS **auto-zooms when focusing a field with font-size below 16px**. Fix it with `font-size: 16px` (or larger) on inputs, textareas and contenteditable on touch devices, not with `maximum-scale`.
- Double-tap zoom: `touch-action: manipulation` on interactive elements (or `body`).
- The software keyboard shrinks the *visual* viewport, not the layout viewport: use `window.visualViewport` (`resize`/`scroll`) to keep focused fields and bottom bars visible; `100vh` includes the area under browser chrome — prefer `100dvh`/`100svh`.
- Fixed-position bottom bars and sheets are the usual source of keyboard bugs — test every text field inside a sheet on a device.

## Display

- `theme-color`: Safari's handling has changed across versions (recent Safari tints toolbars from page colours at the edges rather than the meta tag). Check the current behaviour for your target version.
- `display: standalone` hides Safari UI — provide your own back navigation; there's no browser back button.
- No pull-to-refresh in standalone: give users a way to retry after an offline failure.

## Test matrix

| Scenario | Why |
|---|---|
| Safari tab, online | First visit, install hint |
| Installed, online | Standalone layout, safe areas, push permission |
| Installed, airplane mode | Offline launch from the worker |
| Installed, after a new deploy | Update flow end to end |
| Keyboard open in each sheet/form | Focus zoom, hidden fields, fixed bars |
