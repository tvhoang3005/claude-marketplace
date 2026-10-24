# pwa-toolkit

Progressive Web App patterns: manifest and install, service worker lifecycle and updates, offline storage, push, deploy headers and Mobile Safari quirks.

## Install

```bash
/plugin marketplace add tvhoang3005/claude-marketplace
/plugin install pwa-toolkit@hoangtruong-marketplace
```

## Usage

The skill triggers when Claude sees a PWA (`manifest.webmanifest`, `sw.js`, `vite-plugin-pwa`/Workbox, `navigator.serviceWorker`, `PushManager`) or when you ask to make an app installable, offline-capable or push-enabled.

```bash
/pwa-toolkit:pwa-stack

# Auto-triggers on requests like:
# "users are stuck on the old version after a deploy"
# "make the app work offline"
# "add push notifications"
# "the install prompt doesn't show"
```

With `engineering-toolkit` installed, `codebase-review` uses this skill as its yardstick for PWA projects.

## Contents

| Type | Name | Invoke |
|---|---|---|
| Skill | pwa-stack | `/pwa-toolkit:pwa-stack` |
| Rule | pwa-service-worker | applies automatically to `sw.js`, `service-worker.*`, `*.webmanifest`, `manifest.json` |

## Reference Topics (6)

| Topic | What It Covers |
|---|---|
| **Manifest & install** | Minimal installable manifest, icons, install criteria, custom install button, optional members |
| **Service worker** | Generated vs hand-written, registration, lifecycle, content-hashed precache, navigation fallback, user-visible updates |
| **Offline storage** | Choosing Cache API / IndexedDB / SQLite WASM on OPFS, caching strategies, quota and persistence, schema migrations |
| **Push** | VAPID, subscribe/send/show, endpoint validation, notification clicks, badging, periodic sync |
| **Deploy** | Cache headers, SPA rewrites that don't break old tabs, stale-chunk recovery, CSP, cross-origin isolation |
| **iOS Safari** | Install, separate storage, push on 16.4+, zoom and keyboard, test matrix |

## Rules (1)

| Rule | Applies to | What It Enforces |
|---|---|---|
| **pwa-service-worker** | worker and manifest files | No renamed worker, no silent `skipWaiting`, precache changes change the worker, allowlist cache cleanup, same-origin-only interception and notification navigation |

## Evals

```bash
claude plugin eval ./plugins/pwa-toolkit --tag routing
```
