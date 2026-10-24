# Manifest and Install

## Minimal manifest that installs

```json
{
  "id": "/",
  "name": "My App — what it does",
  "short_name": "My App",
  "description": "One sentence for install dialogs and stores.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#101014",
  "theme_color": "#101014",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#101014" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
```

Notes:
- **`id`** identifies the installed app. Set it explicitly on day one; changing it later makes browsers treat it as a different app.
- **Separate `maskable` icon** with the subject inside the central safe zone (~80%). Don't mark one icon `"any maskable"` — it either gets cropped or looks padded.
- **`theme_color`** in the manifest and `<meta name="theme-color">` should agree, unless the page changes the meta at runtime on purpose (per-theme colours). Note it in a comment if so.
- iOS ignores manifest icons for the home screen; it uses `apple-touch-icon` (180×180, no transparency).
- Serve the manifest as `application/manifest+json` (most hosts do for `.webmanifest`).

## Install criteria (Chromium)

HTTPS (or `localhost`), a manifest with `name` or `short_name`, 192px and 512px icons, `start_url`, and `display` of `standalone`, `fullscreen` or `minimal-ui`. Older Chrome versions also required a service worker with a `fetch` handler; current ones don't, but an app without one won't work offline, which is usually the point. Check the current criteria in Chrome's docs before telling a user why the prompt doesn't appear.

**Richer install dialog:** add `screenshots` (with `form_factor: "wide"` for desktop and `"narrow"` for mobile) and a `description`. Without them Chrome shows the plain mini dialog.

## Custom install button

```ts
let deferred: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();          // keep the browser's own prompt from showing now
  deferred = e as BeforeInstallPromptEvent;
  showInstallButton();
});

async function onInstallClick() {
  if (!deferred) return;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;  // 'accepted' | 'dismissed'
  deferred = null;
  hideInstallButton();
}

window.addEventListener('appinstalled', () => hideInstallButton());
```

- `beforeinstallprompt` is **Chromium-only**. Safari and Firefox never fire it — on iOS, show "Share → Add to Home Screen" instructions instead (see ios-safari.md).
- Detect "already installed / running standalone": `matchMedia('(display-mode: standalone)').matches || navigator.standalone === true` (the second is iOS).

## Optional members worth knowing

| Member | Use | Support |
|---|---|---|
| `shortcuts` | Long-press / right-click actions on the app icon | Chromium (Android, desktop) |
| `display_override` | Fallback chain, e.g. `["window-controls-overlay", "standalone"]` | Chromium |
| `launch_handler` | `"client_mode": "navigate-existing"` to reuse an open window | Chromium |
| `share_target` | Receive shares from the OS share sheet | Chromium (Android) |
| `file_handlers`, `protocol_handlers` | Open files / custom links with the app | Chromium desktop |
| `orientation` | Lock orientation in standalone | Limited; avoid unless required |

Support changes often — check MDN or caniuse for the user's target browsers before relying on one.

## Checklist

- [ ] `id`, `name`, `short_name`, `start_url`, `scope`, `display`, colours set
- [ ] 192 + 512 `any` icons and a separate 512 `maskable`; `apple-touch-icon` for iOS
- [ ] `screenshots` + `description` if the install dialog matters
- [ ] `theme_color` agrees with the meta tag (or the difference is documented)
- [ ] `start_url` is inside `scope` and is served by the worker offline
