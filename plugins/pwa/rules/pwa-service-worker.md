---
paths:
  - "**/sw.js"
  - "**/sw.ts"
  - "**/service-worker.*"
  - "**/*.webmanifest"
  - "**/manifest.json"
---

# PWA service worker and manifest rule

A broken worker reaches every installed user and can keep them on a bad version. When editing these files:

- **Never rename the worker script or move it out of the root scope.** Users stay on the old one.
- **Never `skipWaiting()` unconditionally on install** while pages may be open — go through the "update available" message flow and reload on `controllerchange`.
- **Any change to what is precached must change the worker's bytes** (content-hashed list or a version constant), or nobody receives it.
- **Old caches are deleted in `activate`**, by allowlist of current keys — never by deleting everything, which drops runtime caches and user-visible offline content.
- **Don't intercept what you don't own:** only same-origin `GET`s; never auth, payment or API mutation requests; the shell fallback only for `request.mode === 'navigate'`.
- **Notification clicks navigate to same-origin URLs only**, even when the URL comes from your own push payload.
- **Manifest `id` and `start_url` don't change** once shipped without a migration plan.

When a change touches the worker, say how it was tested: first install, offline launch, and an update from the previous version. For details, use the `pwa-stack` skill's `reference/service-worker.md`.
