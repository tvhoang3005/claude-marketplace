---
name: tauri-desktop
description: "Tauri 2 patterns for building cross-platform desktop and mobile apps with a Rust backend and web frontend: project setup, IPC commands, events and channels, capability-based security, plugins, auto-update, and packaging. TRIGGER when: the project has a src-tauri/ directory, tauri.conf.json or capabilities/*.json; code imports from '@tauri-apps/api' or '@tauri-apps/plugin-*'; Rust code uses the tauri crate or #[tauri::command]; or the user asks to build a desktop app with Tauri, add a Tauri command or plugin, configure permissions, set up the updater, or ship a Tauri build. DO NOT trigger for: Electron apps, generic Rust questions without Tauri, or plain web apps."
---

# Tauri Desktop

Opinionated patterns for Tauri 2 apps — Rust backend, any web frontend, one codebase for macOS, Windows, Linux, Android and iOS. Before applying a topic, read its reference file in `reference/`.

**Version check first.** Tauri 1 and Tauri 2 differ in config layout, permissions (allowlist vs capabilities) and plugin names. Check `src-tauri/Cargo.toml` (`tauri = "2..."`) and `package.json` (`@tauri-apps/api` 2.x). If the project is on Tauri 1, say so and don't apply these patterns blindly — point to the [v1 → v2 migration guide](https://v2.tauri.app/start/migrate/from-tauri-1/).

## When to Apply

1. **New project / project layout / tauri.conf.json** → Read [reference/project-setup.md](reference/project-setup.md)
2. **Rust commands, state, errors, events, streaming to the frontend** → Read [reference/ipc.md](reference/ipc.md)
3. **Capabilities, permissions, scopes, CSP** → Read [reference/security.md](reference/security.md)
4. **Adding a plugin (fs, dialog, store, shell, notification…), tray, multi-window** → Read [reference/plugins.md](reference/plugins.md)
5. **Building, signing, auto-update, CI, mobile targets** → Read [reference/release.md](reference/release.md)

Any change that adds a command or a permission also needs [reference/security.md](reference/security.md) — the webview is untrusted input.

## Architecture Overview

```
project/
├── src/                        # Frontend (React/Vue/Svelte/vanilla)
├── src-tauri/
│   ├── src/
│   │   ├── main.rs             # Desktop entry — calls lib::run()
│   │   ├── lib.rs              # Builder: plugins, state, invoke_handler
│   │   ├── commands/           # #[tauri::command] modules, one per domain
│   │   └── error.rs            # Serializable app error type
│   ├── capabilities/           # Permission sets per window/platform
│   ├── icons/
│   ├── build.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Key Rules

| Rule | Why |
|---|---|
| Treat every command argument as untrusted | Any script running in the webview (including injected XSS) can call `invoke` |
| Commands do one specific thing — never `read_file(path)` / `run(cmd)` | Generic commands bypass the capability system and turn XSS into RCE / arbitrary file access |
| Resolve paths in Rust from `app.path()` base dirs, not from frontend strings | Prevents `../` traversal outside the app's data directories |
| Least-privilege capabilities, scoped per window | A compromised secondary window shouldn't inherit the main window's powers |
| Return `Result<T, AppError>` with a serializable error | Frontend gets a typed rejection instead of a panic or opaque string |
| Owned argument types (`String`, not `&str`) in `async` commands | Borrowed args in async commands only compile when the command returns `Result` |
| Long work in `async` commands or `spawn_blocking` | Sync commands run on the main thread and freeze the UI |
| `Channel` for streaming / progress, events for broadcast | Channels are ordered and fast; events are fire-and-forget fan-out |
| Keep a strict CSP; never add `'unsafe-eval'` or remote script origins casually | CSP is the main XSS mitigation in the webview |
| Sign updates; never commit the private signing key | The updater rejects unsigned artifacts — the key is the root of trust |

## Quick Reference

```
Starting a project or editing tauri.conf.json?
  → reference/project-setup.md

Adding a Rust command or calling Rust from the frontend?
  → reference/ipc.md, then reference/security.md

Frontend gets "not allowed" / permission denied?
  → reference/security.md

Need file access, dialogs, persistent settings, tray, notifications?
  → reference/plugins.md

Shipping a build, setting up updates, or targeting mobile?
  → reference/release.md
```

## Output

When writing Tauri code, show both sides of the boundary together: the Rust command, its registration in `generate_handler!`, the capability/permission change, and the TypeScript `invoke` call. State which files changed and any permission you added.
