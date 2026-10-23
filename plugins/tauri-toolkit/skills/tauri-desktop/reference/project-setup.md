# Project Setup

## Why Tauri (vs Electron)

| | Tauri 2 | Electron |
|---|---|---|
| Rendering | OS webview (WebView2 / WKWebView / WebKitGTK) | Bundled Chromium |
| Typical installer size | Single-digit MB | ~80 MB and up |
| Backend | Rust | Node.js |
| Frontend → OS access | Capability-based permissions | Full Node.js unless sandboxed |
| Mobile | Android + iOS | No |

Sizes are typical ranges, not guarantees — they depend on assets and Rust dependencies.

Trade-off to call out: the webview differs per OS, so CSS/JS features must work on WebKit (macOS/Linux/iOS) as well as Chromium (Windows/Android). Test on each platform you ship.

## Create a Project

```bash
npm create tauri-app@latest        # interactive: name, frontend, package manager
# or add Tauri to an existing frontend:
npm install -D @tauri-apps/cli@latest
npx tauri init
```

Prerequisites: Rust (rustup), plus platform deps — Xcode CLT on macOS, WebView2 + MSVC build tools on Windows, `webkit2gtk-4.1` and friends on Linux. See [prerequisites](https://v2.tauri.app/start/prerequisites/).

## Layout

```
src-tauri/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── error.rs
│   └── commands/
│       ├── mod.rs
│       └── settings.rs
├── capabilities/default.json
├── build.rs
├── Cargo.toml
└── tauri.conf.json
```

### main.rs / lib.rs

The app logic lives in `lib.rs` so the same code is reused as the mobile entry point.

```rust
// src-tauri/src/main.rs
// Hides the extra console window on Windows release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    my_app_lib::run()
}
```

```rust
// src-tauri/src/lib.rs
mod commands;
mod error;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // one-time init: managed state, tray, desktop-only plugins
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::settings::load_settings,
            commands::settings::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Cargo.toml

```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[lib]
name = "my_app_lib"                              # must match main.rs
crate-type = ["staticlib", "cdylib", "rlib"]     # staticlib/cdylib needed for mobile

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "2"
```

## tauri.conf.json (v2 shape)

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "My App",
  "version": "0.1.0",
  "identifier": "com.example.myapp",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      { "label": "main", "title": "My App", "width": 1024, "height": 768 }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: data:; connect-src 'self' ipc: http://ipc.localhost"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]
  }
}
```

Notes:
- `identifier` is a reverse-DNS ID; it determines app data paths and must be unique. Changing it after release orphans users' data.
- v1 keys (`tauri.allowlist`, `build.distDir`, `build.devPath`) don't exist in v2 — use capabilities, `frontendDist` and `devUrl`.
- Platform overrides go in `tauri.macos.conf.json`, `tauri.windows.conf.json`, `tauri.linux.conf.json`, `tauri.android.conf.json`, `tauri.ios.conf.json` and are merged over the base file.
- Generate all icon sizes from one 1024×1024 PNG: `npm run tauri icon ./app-icon.png`.

## Vite Frontend Config

```ts
// vite.config.ts
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST; // set when running on a physical mobile device

export default defineConfig({
  clearScreen: false,              // keep Rust errors visible
  server: {
    port: 1420,
    strictPort: true,              // must match build.devUrl
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
});
```

## Detecting the Tauri Runtime

```ts
import { isTauri } from '@tauri-apps/api/core';

if (isTauri()) {
  // desktop/mobile app
} else {
  // running in a normal browser (e.g. Storybook, web build)
}
```

`window.__TAURI__` only exists when `app.withGlobalTauri` is `true`; prefer the ES module imports.

## Daily Commands

```bash
npm run tauri dev          # run app with frontend HMR + Rust rebuild
npm run tauri build        # release bundle for the current platform
npm run tauri info         # environment + versions — paste this into bug reports
npm run tauri add <name>   # add an official plugin (see plugins.md)
```
