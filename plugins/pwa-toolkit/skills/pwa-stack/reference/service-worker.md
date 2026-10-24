# Service Worker

## Generated or hand-written?

| Option | Pick when |
|---|---|
| `vite-plugin-pwa` / Workbox `generateSW` | Standard app shell + runtime caching, no custom worker logic |
| `vite-plugin-pwa` / Workbox `injectManifest` | You need custom logic (push, badges, messages) but want Workbox's precache manifest and routing |
| Hand-written `sw.js` | Small, well-understood worker where you control every byte — then you must build the precache list and versioning yourself (below) |

Whichever it is, the rules below apply.

## Registration

Register on every launch, after the page has loaded, from one place:

```ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // insecure origin, private mode, policy — the app must still work without it
    });
  });
}
```

- **Scope** defaults to the script's directory; a worker at `/assets/sw.js` can't control `/`. Keep `sw.js` at the root (or send `Service-Worker-Allowed`).
- **Don't register only when a feature is enabled** (e.g. inside "turn on notifications"): users who never enable it get no offline support.
- Calling `register()` again with an unchanged script is a no-op; it's safe on every launch.

## Lifecycle in one paragraph

A changed worker script **installs** (precache), then **waits** while any page is still controlled by the old worker, then **activates** (clean old caches) and takes control of new navigations. `skipWaiting()` skips the wait; `clients.claim()` takes control of already-open pages. The browser checks for a new script on navigation and at least every 24h, bypassing the HTTP cache for the script itself by default (`updateViaCache: 'imports'`), but a CDN can still serve a stale copy — hence `no-cache` on `sw.js` (deploy.md).

## Precache, versioned by content

The worker's bytes must change whenever any precached file changes, or users never get the update. Generate the list at build time with a hash per file:

```js
// sw.js — the build replaces this line with [{ url, rev }, ...]
const PRECACHE = [];
const CACHE = 'app-precache';
const keyFor = (e) => `${e.url}?__rev=${e.rev}`;
const KEYS = new Map(PRECACHE.map((e) => [e.url, keyFor(e)]));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (e) => {
      const key = keyFor(e);
      if (await cache.match(key)) return;           // unchanged file: no download
      const res = await fetch(e.url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`precache ${e.url}: ${res.status}`);
      await cache.put(key, res);
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const keep = new Set([...KEYS.values()].map((k) => new URL(k, self.location.href).href));
    for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
    await self.clients.claim();
  })());
});
```

- Fail the build if the placeholder is missing — a worker with an empty list installs fine and caches nothing.
- Exclude source maps and the worker itself from the list.
- **Keep the list small.** `install` is all-or-nothing: a 10 MB precache on a weak connection often fails, and a failed install means no offline at all until the next attempt. Precache the shell (HTML, entry JS/CSS, fonts, core WASM, core data); runtime-cache images, illustrations, audio and large optional data (offline-storage.md).

## Fetch: shell for navigations, cache-first for hashed assets

```js
const SHELL = '/index.html';

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // let cross-origin go to the network

  const key = request.mode === 'navigate'
    ? (KEYS.get(url.pathname) ?? KEYS.get(SHELL))      // SPA: any route → shell
    : url.search === '' ? KEYS.get(url.pathname) : undefined;
  if (!key) return;                                    // not precached: browser default

  event.respondWith(caches.match(key, { cacheName: CACHE }).then((hit) => hit ?? fetch(request)));
});
```

Don't intercept API calls or auth redirects with the shell fallback — only `mode === 'navigate'` requests for app routes.

## Updates the user can see

Never `skipWaiting()` on install while a page is open. Tell the page, let the user (or a safe moment) decide, then reload once:

```js
// sw.js
self.addEventListener('message', (e) => { if (e.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
```

```ts
// page
const reg = await navigator.serviceWorker.getRegistration();
const offer = (w: ServiceWorker) => showToast('Update available', () => w.postMessage({ type: 'SKIP_WAITING' }));

if (reg?.waiting) offer(reg.waiting);
reg?.addEventListener('updatefound', () => {
  const w = reg.installing;
  w?.addEventListener('statechange', () => {
    if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
  });
});

let reloaded = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (reloaded) return;
  reloaded = true;
  location.reload();
});
```

- `navigator.serviceWorker.controller` being null on `installed` means first install, not an update — don't prompt.
- Apps open for days (installed PWAs) should also call `reg.update()` on `visibilitychange` to visible.

## Debugging

- Chrome DevTools → Application → Service Workers ("Update on reload" while developing) and Cache Storage.
- Don't run the production worker on the dev server: an empty `PRECACHE` in dev (as above) makes it a no-op.
- `chrome://serviceworker-internals` and Safari's Develop → Service Workers for stuck registrations.
- To unbrick a bad worker: ship a worker that deletes its caches and calls `self.registration.unregister()` — at the same URL.
