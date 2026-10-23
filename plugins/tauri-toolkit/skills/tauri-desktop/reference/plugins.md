# Plugins, Windows, Tray

## Adding an Official Plugin

```bash
npm run tauri add store
```

This adds the Rust crate and the `@tauri-apps/plugin-*` npm package and registers the plugin in `lib.rs`. Review the diff, then **add the permissions you need to a capability** — a plugin without permissions is installed but uncallable from the frontend.

Manual equivalent:

```toml
# src-tauri/Cargo.toml
tauri-plugin-store = "2"
```

```bash
npm install @tauri-apps/plugin-store
```

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
```

Keep the Rust crate and npm package on matching major/minor versions.

## Common Plugins

| Need | Plugin | Notes |
|---|---|---|
| Native open/save dialogs | `dialog` | Prefer over `<input type="file">` — returns real paths |
| Read/write files | `fs` | Always scope (`$APPDATA/**` etc.) |
| Key-value settings | `store` | JSON file in app data dir |
| Open URL / file in default app | `opener` | Replaces `shell.open` from v1 |
| Spawn processes / sidecars | `shell` | Needs explicit per-program scope |
| HTTP from Rust side (bypasses CORS) | `http` | Scope allowed URLs |
| SQLite / MySQL / Postgres | `sql` | Or use `sqlx`/`rusqlite` directly in commands |
| Notifications | `notification` | Request permission first |
| Logging to file + console | `log` | Register early to capture startup |
| Restore window size/position | `window-state` | |
| Single running instance | `single-instance` | Register **first**; desktop only |
| `myapp://` links | `deep-link` | Pair with `single-instance` on Windows/Linux |
| Auto-update | `updater` | See release.md |
| Relaunch / exit | `process` | Needed for `relaunch()` after update |
| Global hotkeys | `global-shortcut` | Desktop only |
| Clipboard | `clipboard-manager` | |
| Launch at login | `autostart` | Desktop only |

Full list: [v2.tauri.app/plugin](https://v2.tauri.app/plugin/).

Desktop-only plugins must be guarded so mobile builds compile:

```rust
.setup(|app| {
    #[cfg(desktop)]
    app.handle().plugin(tauri_plugin_global_shortcut::Builder::new().build())?;
    Ok(())
})
```

## Example: Settings with `store`

```json
// capability permissions
"store:default"
```

```ts
import { load } from '@tauri-apps/plugin-store';

const store = await load('settings.json', { autoSave: true });
await store.set('theme', 'dark');
const theme = await store.get<string>('theme');
```

The `load` options shape has changed across 2.x minor versions — check the installed `@tauri-apps/plugin-store` types.

## Example: Open Dialog + Scoped Read

```json
"dialog:allow-open",
{ "identifier": "fs:allow-read-text-file", "allow": [{ "path": "$DOCUMENT/**" }] }
```

```ts
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';

const path = await open({ multiple: false, filters: [{ name: 'Markdown', extensions: ['md'] }] });
if (typeof path === 'string') {
  const text = await readTextFile(path); // fails if outside the fs scope
}
```

## Multiple Windows

Rust:

```rust
use tauri::{WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
async fn open_settings(app: tauri::AppHandle) -> crate::error::Result<()> {
    WebviewWindowBuilder::new(&app, "settings", WebviewUrl::App("settings.html".into()))
        .title("Settings")
        .inner_size(600.0, 480.0)
        .build()?;
    Ok(())
}
```

Frontend (needs `core:webview:allow-create-webview-window`):

```ts
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

const win = new WebviewWindow('settings', { url: '/settings', title: 'Settings' });
win.once('tauri://error', (e) => console.error(e));
```

Labels are unique — creating a window with an existing label fails. Use `app.get_webview_window("settings")` to focus an existing one. Give each window's label its own capability.

## System Tray

```toml
tauri = { version = "2", features = ["tray-icon"] }
```

```rust
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

// inside .setup(|app| { ... })
let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
let menu = Menu::with_items(app, &[&show, &quit])?;

TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&menu)
    .on_menu_event(|app, event| match event.id.as_ref() {
        "show" => {
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
        }
        "quit" => app.exit(0),
        _ => {}
    })
    .build(app)?;
```

## Writing Your Own Plugin

When a group of commands is reused across apps, scaffold a plugin: `npx @tauri-apps/cli plugin new <name>`. It generates the Rust crate, JS bindings, and a `permissions/` directory — define `allow-*` permissions and a `default` set for every command, following the same least-privilege rules as security.md.
