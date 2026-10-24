# Security Model

Threat model in one line: **assume the webview can be compromised** (XSS via a dependency, rendered user content, a malicious remote page). Everything the frontend can call — commands and plugin APIs — is attack surface. Tauri's job is to make that surface small and explicit; yours is not to undo it.

## Capabilities

A capability grants a set of permissions to specific windows (and optionally platforms). Files in `src-tauri/capabilities/` are picked up automatically.

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Main window permissions",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:allow-open",
    {
      "identifier": "fs:allow-read-text-file",
      "allow": [{ "path": "$APPDATA/**" }]
    },
    {
      "identifier": "fs:allow-write-text-file",
      "allow": [{ "path": "$APPDATA/**" }]
    }
  ]
}
```

Rules:
- Grant specific `allow-*` permissions rather than a plugin's `:default` set when you only need one or two operations. Check what a default set includes in `src-tauri/gen/schemas/` or the plugin's docs before using it.
- Scope filesystem permissions to base-dir variables (`$APPDATA`, `$APPLOCALDATA`, `$APPCONFIG`, `$DOCUMENT`, `$DOWNLOAD`, `$RESOURCE`, …). Never `"**"` or `"$HOME/**"`.
- Use `deny` entries to carve out sensitive subpaths from a broader allow.
- One capability per window role. A secondary window that renders untrusted content (e.g. a markdown preview) gets its own capability with almost nothing in it.
- Platform-specific grants: add `"platforms": ["macOS", "windows", "linux"]` or `["iOS", "android"]`.
- `"remote": { "urls": ["https://*.example.com"] }` lets remote pages use IPC. Avoid it; if unavoidable, pair it with a capability holding the bare minimum.

Permission errors in the frontend (`… not allowed. Permissions associated with this command: …`) mean the capability is missing — add the narrowest permission named in the message, don't switch to `:default`.

## Your Own Commands

By default every command in `generate_handler!` is callable from every window. That makes **command design** the main control:

| Don't | Do |
|---|---|
| `read_file(path: String)` | `load_project(id: Uuid)` — Rust builds the path from `app.path().app_data_dir()` |
| `run_shell(cmd: String)` | `export_pdf(doc_id)` — Rust picks the binary and arguments |
| `http_get(url: String)` | `fetch_release_notes()` — URL is fixed in Rust |
| `exec_sql(query: String)` | `list_invoices(filter: InvoiceFilter)` — parameterised query inside |

When a path must come from the user, get it from the dialog plugin (the user picked it), canonicalize it, and check it is under an allowed root before touching it:

```rust
fn ensure_within(root: &std::path::Path, candidate: &std::path::Path) -> crate::error::Result<std::path::PathBuf> {
    let root = root.canonicalize()?;
    // canonicalize resolves .. and symlinks but requires the path to exist;
    // for a new file, canonicalize its parent and re-append the file name.
    let p = candidate.canonicalize()?;
    if !p.starts_with(&root) {
        return Err(crate::error::Error::Invalid("path outside allowed directory".into()));
    }
    Ok(p)
}
```

To gate app commands per window like plugin commands, declare them in `build.rs` so Tauri generates `allow-<command>` permissions, then grant those in capabilities:

```rust
// src-tauri/build.rs
fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(&["load_settings", "save_settings"])),
    )
    .expect("failed to run tauri-build");
}
```

Once declared this way, a command is denied unless a capability grants it — verify against the [permissions docs](https://v2.tauri.app/security/permissions/) for your Tauri version.

## Content Security Policy

Set `app.security.csp` in `tauri.conf.json`. Tauri injects nonces/hashes for bundled scripts and styles at build time.

```json
"security": {
  "csp": "default-src 'self'; img-src 'self' asset: data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ipc: http://ipc.localhost https://api.example.com"
}
```

- Keep `ipc: http://ipc.localhost` in `connect-src` — that's the IPC transport.
- Add each external API origin explicitly; no `*`.
- Never `'unsafe-eval'`. `'unsafe-inline'` for styles only if your CSS-in-JS needs it.
- `"csp": null` disables CSP — reject this in review.

## Other Controls

- **Isolation pattern** (`app.security.pattern: { "use": "isolation" }`) runs a sandboxed iframe that can inspect/modify every IPC message. Worth it for apps with many third-party frontend dependencies.
- **Asset protocol** (`app.security.assetProtocol`) — if enabled to display local files, scope it like fs permissions.
- **Shell / opener**: open URLs with `tauri-plugin-opener` and restrict allowed URLs/schemes; spawning processes via `tauri-plugin-shell` requires an explicit, argument-validated scope per program.
- **Secrets**: don't ship API secrets in the frontend bundle or the binary — they are extractable. Use the OS keychain (e.g. the `keyring` crate) for user tokens and a backend you control for service credentials.
- **Dependencies**: run `cargo audit` and `npm audit` in CI.

## Review Checklist

- [ ] New command takes no raw path / URL / shell / SQL string from the frontend, or validates it against an allowed root
- [ ] Inputs validated (ranges, lengths, enums) before side effects
- [ ] New permission is the narrowest `allow-*` with a scope, granted to the window that needs it
- [ ] No `"**"` / `$HOME` scopes, no `remote` capability without justification
- [ ] CSP unchanged or tightened; no `'unsafe-eval'`, no `csp: null`
- [ ] Errors returned to the frontend don't leak secrets or internal paths
