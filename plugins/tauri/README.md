# tauri

Tauri 2 patterns for cross-platform desktop and mobile apps: project setup, Rust IPC commands, capability-based security, plugins, auto-update and distribution.

## Install

```bash
/plugin marketplace add tvhoang3005/claude-marketplace
/plugin install tauri@hoangtruong
```

## Usage

The skill triggers automatically when Claude sees a Tauri project (`src-tauri/`, `tauri.conf.json`, `@tauri-apps/*` imports, `#[tauri::command]`) or when you ask about building a desktop app with Tauri.

```bash
# Explicit invocation
/tauri:tauri-desktop

# Auto-triggers on requests like:
# "add a Rust command that saves settings"
# "why does the frontend say fs.read_text_file not allowed?"
# "set up auto-update for the app"
# "add a system tray menu"
```

## Contents

| Type | Name | Invoke |
|---|---|---|
| Skill | tauri-desktop | `/tauri:tauri-desktop` |
| Rule | tauri-security | applies automatically to `src-tauri/**` |

## Reference Topics (5)

| Topic | What It Covers |
|---|---|
| **Project Setup** | Scaffolding, `src-tauri` layout, `tauri.conf.json` v2 shape, Vite config, runtime detection |
| **IPC** | Commands, serializable errors, managed state, channels, events, IPC mocking in tests |
| **Security** | Capabilities and scopes, safe command design, path validation, CSP, review checklist |
| **Plugins** | Adding plugins, common plugin table, dialog/fs/store examples, multi-window, system tray |
| **Release** | Builds and targets, CI, code signing, auto-updater, versioning, Android/iOS |

References are loaded on demand — only the relevant topic is read when needed.

## Rules (1)

| Rule | Applies to | What It Enforces |
|---|---|---|
| **tauri-security** | `src-tauri/**` | No generic path/shell/URL commands, validated inputs, least-privilege scoped capabilities, CSP kept on, no secrets in the bundle |

## Evals

Routing cases live in [evals/](evals/) — run `claude plugin eval ./plugins/tauri --tag routing` after changing the skill's `description`.

## Scope

Targets **Tauri 2.x**. For Tauri 1 projects the skill flags the version and points to the migration guide instead of applying v2 patterns.
