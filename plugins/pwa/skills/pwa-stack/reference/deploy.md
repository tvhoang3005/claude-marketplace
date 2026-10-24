# Deploy: Headers, CSP, Rewrites, Stale Chunks

## Headers that matter

| Path | Header | Why |
|---|---|---|
| `/sw.js` | `Cache-Control: no-cache` | CDNs and proxies must revalidate the worker on every check |
| `/manifest.webmanifest` | `Cache-Control: no-cache` (or short max-age) | Name/icon changes reach installed apps |
| `/index.html` | `Cache-Control: no-cache` | Always fetch the HTML that names the current chunks |
| `/assets/*` (hashed) | `Cache-Control: public, max-age=31536000, immutable` | Safe because the name changes with the content |
| `*.wasm` | `Content-Type: application/wasm` | Required for streaming compilation |
| all | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, framing protection | Baseline hardening |

Vercel example:

```json
{
  "headers": [
    { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

## SPA rewrites without breaking old tabs

A catch-all rewrite (`/(.*) → /index.html`) also answers **missing hashed assets** with `index.html` and status 200. After a deploy, an open tab that lazy-imports an old chunk gets HTML, fails with a MIME error, and the route crashes.

Fix both sides:

1. **Server:** rewrite only paths that aren't files. Exclude `/assets/` (and other static folders) from the SPA rewrite so a missing chunk is a real 404:
   ```json
   { "rewrites": [{ "source": "/((?!assets/|icons/|sw.js|manifest.webmanifest).*)", "destination": "/index.html" }] }
   ```
2. **Client:** recover from a failed chunk load by reloading once:
   ```ts
   // Vite fires this when a dynamic import's preload fails
   window.addEventListener('vite:preloadError', (event) => {
     event.preventDefault();
     if (!sessionStorage.getItem('reloaded-for-chunk')) {
       sessionStorage.setItem('reloaded-for-chunk', '1');
       location.reload();
     }
   });
   ```
   Also give routes an error boundary / `errorElement`, so any other render error shows a recoverable screen instead of a blank page or a stack trace.

The precaching worker hides this for installed users (it serves the old chunk from cache) until the cache is cleaned on activate — so test it in a plain tab too.

## Content-Security-Policy for a PWA

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval' 'sha256-…';   /* wasm only if you ship WASM; hashes for inline scripts */
worker-src 'self' blob:;
connect-src 'self' https://api.example.com wss://api.example.com;
img-src 'self' data: blob:;
style-src 'self' 'unsafe-inline';                  /* only if a library injects styles */
manifest-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self';
```

- Inline scripts in `index.html` (theme bootstrapping, etc.) need hashes computed at build time; a `<meta http-equiv>` CSP written by the build works for static hosting. `frame-ancestors` can't be set by meta — use `X-Frame-Options: DENY` or a header CSP for that.
- The worker's own `fetch()` calls are governed by the worker's CSP (the response headers of `sw.js`), not the page's.
- Run the app with the production CSP before shipping (`vite preview`); fail e2e tests on any CSP violation.

## Cross-origin isolation (only if you need it)

`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` enable `SharedArrayBuffer`. Needed for SQLite's `opfs` VFS and some WASM threading, **not** for `opfs-sahpool`. COEP blocks cross-origin resources that lack CORP/CORS headers — audit images, fonts and embeds before turning it on.

## Release checklist

- [ ] Build output deployed atomically (HTML and its chunks together)
- [ ] `sw.js`, `index.html`, manifest: `no-cache`; hashed assets: `immutable`
- [ ] Missing `/assets/*` returns 404; chunk-load error reloads once
- [ ] Production CSP tested; no violations in the console
- [ ] Second deploy tested on an installed app: update offered, reload lands on the new version, old caches removed
