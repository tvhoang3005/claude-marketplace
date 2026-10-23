---
paths:
  - "src-tauri/**"
  - "**/src-tauri/**"
---

# Tauri security rule

The webview is untrusted. When editing Rust commands, capabilities or `tauri.conf.json`:

- **No generic commands.** Never add a command that takes a raw filesystem path, URL, shell command or SQL string from the frontend and acts on it. Name the operation (`save_settings`, `export_report`) and build paths/URLs/queries in Rust.
- **User-picked paths** (from the dialog plugin) are canonicalized and checked to be inside an allowed root before use.
- **Validate inputs** (ranges, lengths, enum values) before any side effect.
- **Least-privilege capabilities.** Add the narrowest `allow-*` permission with a scope (`$APPDATA/**`, not `**` or `$HOME/**`) to the window that needs it. Don't switch to a plugin's `:default` set to silence a permission error.
- **CSP stays on.** Never set `app.security.csp` to `null` or add `'unsafe-eval'`; add external origins to `connect-src` one by one.
- **No secrets in the bundle.** Updater private keys, API secrets and signing certificates live in CI secrets or the OS keychain, never in the repo or binary.
- **No `unwrap()` on frontend-controlled data** in commands — return the app `Error` instead of panicking.

When a change adds a command or permission, say which permission/scope was added and why it is the minimum needed. For details, use the `tauri-desktop` skill's `reference/security.md`.
