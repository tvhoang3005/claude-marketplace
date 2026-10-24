# Offline Storage and Caching

## Pick the store by what the data is

| Data | Store | Notes |
|---|---|---|
| App shell, hashed assets | Cache API (precache) | Written by the worker at install |
| Images, audio, large optional files | Cache API (runtime) | Cache on first use, cap the count |
| Structured user data, small–medium | IndexedDB (via `idb`/Dexie) | Transactions, indexes, works in workers |
| Relational data, SQL, large datasets | SQLite WASM on OPFS | Run in a Web Worker |
| Small preferences read before first paint | `localStorage` | Synchronous; keep it tiny; never the only copy of user data |

Never keep the only copy of user data in the Cache API or `localStorage`.

## SQLite WASM on OPFS

`@sqlite.org/sqlite-wasm` offers two OPFS VFSes:

| VFS | Needs | Notes |
|---|---|---|
| `opfs` | `SharedArrayBuffer` → **cross-origin isolation** (`COOP: same-origin` + `COEP: require-corp`) | COEP blocks cross-origin images/scripts without CORP headers — painful for most apps |
| `opfs-sahpool` | A dedicated worker; no special headers | One connection per pool (no multi-tab concurrent writers); usually the right choice for a PWA |

```ts
// db.worker.ts
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
const sqlite3 = await sqlite3InitModule();
const pool = await sqlite3.installOpfsSAHPoolVfs({ initialCapacity: 8 });
const db = new pool.OpfsSAHPoolDb('/app.sqlite3');
```

- The `.wasm` must be served with `application/wasm`, and CSP needs `'wasm-unsafe-eval'` in `script-src` (deploy.md).
- Precache the WASM files; the app can't open its database offline without them.
- Coordinate tabs (Web Locks API or a `BroadcastChannel` leader) so only one opens the pool.

## Caching strategies (runtime)

| Strategy | For |
|---|---|
| Cache-first | Hashed/immutable assets, fonts, versioned media |
| Stale-while-revalidate | Avatars, non-critical JSON that may lag a little |
| Network-first with cache fallback | Data that should be fresh but must work offline |
| Network-only | Auth, payments, anything with side effects |

Cap runtime caches (entry count or age) — they grow without limit otherwise. Cross-origin `no-cors` responses are opaque: they can't be inspected, and browsers count them against quota with heavy padding. Prefer CORS for cached cross-origin files.

## Quota and eviction

```ts
const { usage, quota } = await navigator.storage.estimate();
const persisted = await navigator.storage.persisted() || await navigator.storage.persist();
```

- Without persistence, storage is "best effort": the browser may evict the whole origin under pressure. Ask for `persist()` in apps whose data matters (local-first apps), ideally after the user has invested in it. Chromium grants it by heuristics (installed, engaged); check the current behaviour for Safari and Firefox on MDN.
- Eviction removes the **whole origin** — Cache API, IndexedDB and OPFS together. An export/sync path is the real backup.
- Safari has its own rules for sites that aren't installed — see ios-safari.md.

## Schema changes

Data on the user's device outlives every deploy. Version the schema, migrate forward on open, and test opening a database written by the previous release — an old worker can serve old code against a new database for one session.
