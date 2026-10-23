# IPC: Commands, State, Events, Channels

Pick the primitive by direction and shape of data:

| Need | Use |
|---|---|
| Frontend asks Rust for something and awaits a result | Command (`invoke`) |
| Rust streams progress / chunks to one caller | `Channel` passed as a command argument |
| Rust broadcasts a notification to windows | Event (`emit` / `listen`) |
| Frontend ↔ frontend across windows | Event |

## Error Type

Commands return `Result<T, E>` where `E: Serialize`. Define one app error instead of `map_err(|e| e.to_string())` everywhere.

```rust
// src-tauri/src/error.rs
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("invalid input: {0}")]
    Invalid(String),
}

impl serde::Serialize for Error {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, Error>;
```

Don't leak internal details (absolute paths, SQL) in messages the UI will show — map them to user-safe variants where it matters.

## Commands

```rust
// src-tauri/src/commands/settings.rs
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use crate::error::{Error, Result};

#[derive(Serialize, Deserialize, Default)]
pub struct Settings {
    pub theme: String,
    pub font_size: u8,
}

fn settings_path(app: &AppHandle) -> Result<std::path::PathBuf> {
    // Path is decided in Rust — the frontend never supplies it.
    Ok(app.path().app_config_dir()?.join("settings.json"))
}

#[tauri::command]
pub async fn load_settings(app: AppHandle) -> Result<Settings> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(Settings::default());
    }
    Ok(serde_json::from_str(&std::fs::read_to_string(path)?)?)
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, settings: Settings) -> Result<()> {
    if !(8..=48).contains(&settings.font_size) {
        return Err(Error::Invalid("font_size out of range".into()));
    }
    let path = settings_path(&app)?;
    std::fs::create_dir_all(path.parent().unwrap())?;
    std::fs::write(path, serde_json::to_string_pretty(&settings)?)?;
    Ok(())
}
```

Register every command in **one** `generate_handler!` — calling `.invoke_handler()` twice replaces the first list.

```rust
.invoke_handler(tauri::generate_handler![
    commands::settings::load_settings,
    commands::settings::save_settings,
])
```

### Frontend

```ts
import { invoke } from '@tauri-apps/api/core';

type Settings = { theme: string; fontSize: number };

const settings = await invoke<Settings>('load_settings');

try {
  await invoke('save_settings', { settings: { ...settings, fontSize: 16 } });
} catch (err) {
  // err is the serialized Error (a string with the impl above)
}
```

Wrap `invoke` calls in a typed module (`src/lib/ipc.ts`) so command names and payload types live in one place. For generated bindings, consider [tauri-specta](https://github.com/specta-rs/tauri-specta).

### Argument naming and types

- Top-level argument names are camelCase in JS and snake_case in Rust by default (`fontSize` → `font_size`). Override with `#[tauri::command(rename_all = "snake_case")]`.
- Fields of a struct argument follow serde — add `#[serde(rename_all = "camelCase")]` to the struct if the frontend sends camelCase fields.
- Injected arguments not sent from JS: `AppHandle`, `WebviewWindow`, `Window`, `State<'_, T>`, `tauri::ipc::Request`.

### Sync vs async

- Non-`async` commands run on the main thread — anything slow blocks the UI.
- `async` commands run on the async runtime. Use owned args (`String`, `Vec<u8>`); borrowed args (`&str`, `State<'_, T>`) in an async command only compile when it returns `Result`.
- CPU-heavy or blocking I/O: `tauri::async_runtime::spawn_blocking(move || ...)`.

## Managed State

```rust
use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
struct Counter(u32);

#[tauri::command]
fn increment(counter: State<'_, Mutex<Counter>>) -> u32 {
    let mut c = counter.lock().unwrap();
    c.0 += 1;
    c.0
}

// in run():
tauri::Builder::default()
    .manage(Mutex::new(Counter::default()))
```

- No `Arc` needed — Tauri already shares managed state.
- Use `std::sync::Mutex` unless the guard is held across `.await`, then `tokio::sync::Mutex`.
- The `State<'_, T>` type must match the managed type exactly (`Mutex<Counter>`, not `Counter`) or the command panics at runtime.
- Access from outside commands: `app.state::<Mutex<Counter>>()`.

## Channels (streaming to the caller)

```rust
use serde::Serialize;
use tauri::ipc::Channel;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum ImportEvent {
    Progress { done: usize, total: usize },
    Finished,
}

#[tauri::command]
pub async fn import_files(files: Vec<String>, on_event: Channel<ImportEvent>) -> crate::error::Result<()> {
    let total = files.len();
    for (i, _f) in files.iter().enumerate() {
        // ... work ...
        on_event.send(ImportEvent::Progress { done: i + 1, total })?;
    }
    on_event.send(ImportEvent::Finished)?;
    Ok(())
}
```

```ts
import { invoke, Channel } from '@tauri-apps/api/core';

type ImportEvent =
  | { event: 'progress'; data: { done: number; total: number } }
  | { event: 'finished' };

const onEvent = new Channel<ImportEvent>();
onEvent.onmessage = (msg) => { /* update progress bar */ };
await invoke('import_files', { files, onEvent });
```

## Events (broadcast)

```rust
use tauri::{AppHandle, Emitter};

fn notify_sync_done(app: &AppHandle, count: usize) -> tauri::Result<()> {
    app.emit("sync-finished", count)?;              // all listeners
    // app.emit_to("main", "sync-finished", count)?; // one window by label
    Ok(())
}
```

```ts
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<number>('sync-finished', (e) => console.log(e.payload));
// call unlisten() on component unmount — otherwise listeners leak on every remount
```

## Testing

- Rust: keep business logic in plain functions that take paths/values, and unit test those; the `#[tauri::command]` wrapper should be thin. For command-level tests, Tauri has a `test` feature with a mock runtime (`tauri::test::mock_builder`).
- Frontend: mock IPC with `mockIPC` from `@tauri-apps/api/mocks` so component tests run in jsdom without the Rust side; call `clearMocks()` in `afterEach`.

```ts
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';

beforeEach(() => {
  mockIPC((cmd, args) => {
    if (cmd === 'load_settings') return { theme: 'dark', fontSize: 14 };
  });
});
afterEach(() => clearMocks());
```
