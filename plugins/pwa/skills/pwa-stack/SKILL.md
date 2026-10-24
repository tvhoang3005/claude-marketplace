---
name: pwa-stack
description: "Progressive Web App patterns: web app manifest and installability, service worker lifecycle and updates, precaching and runtime caching, offline storage (Cache API, IndexedDB, OPFS/SQLite WASM), push notifications and badging, deploy headers, and Mobile Safari quirks. TRIGGER when: the project has a manifest.webmanifest/manifest.json, a sw.js/service-worker file, vite-plugin-pwa or Workbox; code calls navigator.serviceWorker, caches, PushManager or setAppBadge; or the user asks to make an app installable, work offline, add push notifications, fix a stale-cache or update problem, or audit a PWA. DO NOT trigger for: ordinary web apps with no install or offline goal, Tauri/Electron desktop apps, or React Native."
---

# PWA Stack

Patterns for installable, offline-capable web apps. Before applying a topic, read its reference file in `reference/`.

**Check the setup first.** Look for `vite-plugin-pwa` / Workbox (generated or `injectManifest` worker) versus a hand-written `sw.js`, the bundler, and the hosting (Vercel, Netlify, Nginx…). Follow what the project already uses; don't swap a working hand-written worker for Workbox or the reverse without being asked.

## When to Apply

1. **Manifest, icons, install prompt, standalone display** → [reference/manifest-install.md](reference/manifest-install.md)
2. **Service worker: registration, lifecycle, precache, updates, navigation fallback** → [reference/service-worker.md](reference/service-worker.md)
3. **Offline data, storage choice, quota, persistence, caching strategies** → [reference/offline-storage.md](reference/offline-storage.md)
4. **Push notifications, badging, periodic sync** → [reference/push.md](reference/push.md)
5. **Hosting headers, CSP, SPA rewrites, stale chunks after deploy** → [reference/deploy.md](reference/deploy.md)
6. **Anything that must work on iPhone/iPad** → [reference/ios-safari.md](reference/ios-safari.md) — read it alongside the topic above

## Key Rules

| Rule | Why |
|---|---|
| Serve the worker script with `Cache-Control: no-cache` and never rename it per build | A cached or renamed worker strands users on an old version |
| Version the precache by content hash, and make the worker file change when the list changes | The browser installs a new worker only when its bytes change |
| Never `skipWaiting()` silently while a page is open — offer "update available", then reload on `controllerchange` | Swapping the worker under a running page mixes old HTML with new chunks |
| Navigations fall back to the cached app shell; hashed assets are cache-first | Offline launch works and a deploy never serves a half-new app |
| A missing hashed asset must be a 404, not `index.html` with 200 | Otherwise an old tab's lazy import gets HTML as JavaScript and crashes |
| Keep the install-time precache to the shell and core data; cache heavy media on first use | `install` is all-or-nothing — one failed fetch on a slow network means no offline at all |
| Durable user data lives in IndexedDB or OPFS, never only in the Cache API | Cache entries are for responses; they're evicted with the rest of the origin and have no transactions |
| Call `navigator.storage.persist()` for apps whose data matters | Without it the browser may evict the origin under storage pressure |
| Don't disable zoom (`user-scalable=no`, `maximum-scale=1`) | Fails WCAG 1.4.4; prevent iOS focus-zoom with ≥16px inputs and double-tap zoom with `touch-action: manipulation` |
| Verify on a real installed app on each target (Mobile Safari especially) | Standalone mode, storage, push and safe areas behave differently from a browser tab and from desktop |

## Quick Reference

```
"Make it installable" / install prompt not showing   → manifest-install.md
"Users don't get the new version" / stuck on old UI   → service-worker.md (update flow) + deploy.md (headers)
"Works online, blank offline"                          → service-worker.md (navigation fallback, precache)
"ChunkLoadError / Failed to fetch dynamically imported module" → deploy.md (stale chunks)
"Where do I store data offline?"                       → offline-storage.md
"Push notifications" / app badge                       → push.md, then ios-safari.md
"Works on Android, broken on iPhone"                   → ios-safari.md
```

## Output

When changing PWA code, state which of these it affects — worker lifecycle, cache contents, storage schema, manifest, response headers — and how to verify it: which browser, installed or in a tab, online/offline, and that a second deploy updates cleanly.
