# Build, Update, Distribute

## Building

```bash
npm run tauri build                                          # current platform, all configured bundle targets
npm run tauri build -- --target aarch64-apple-darwin         # note the `--` when going through npm
npm run tauri build -- --target universal-apple-darwin       # Intel + Apple Silicon in one .app
npm run tauri build -- --bundles dmg                         # only specific bundle formats
npm run tauri build -- --debug                               # debug build with devtools
```

Install a target before building for it: `rustup target add aarch64-apple-darwin x86_64-apple-darwin`.

Cross-compiling between OSes is limited (Windows → macOS isn't supported); build each OS on its own runner.

| Platform | Bundle formats |
|---|---|
| macOS | `.app`, `.dmg` |
| Windows | `.msi` (WiX), `.exe` (NSIS) |
| Linux | `.deb`, `.rpm`, `.AppImage` |
| Android | `.apk`, `.aab` |
| iOS | `.ipa` |

## CI (GitHub Actions)

Use [`tauri-apps/tauri-action`](https://github.com/tauri-apps/tauri-action) with an OS matrix (`macos-latest`, `windows-latest`, `ubuntu-22.04`). It builds, uploads to a GitHub Release, and can generate the updater `latest.json`. Cache `src-tauri/target` with `swatinem/rust-cache` — clean Rust builds are slow.

## Code Signing

Unsigned apps trigger Gatekeeper (macOS) and SmartScreen (Windows) warnings; macOS also requires notarization for distribution outside the App Store.

- **macOS**: set `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, and for notarization `APPLE_ID`, `APPLE_PASSWORD` (app-specific password), `APPLE_TEAM_ID` as CI secrets. See [macOS signing](https://v2.tauri.app/distribute/sign/macos/).
- **Windows**: OV/EV certificate via `bundle.windows.certificateThumbprint`, or `bundle.windows.signCommand` for cloud HSM / Azure Trusted Signing. See [Windows signing](https://v2.tauri.app/distribute/sign/windows/).
- **Linux**: AppImage/deb signing is optional; distribute checksums at minimum.

Code-signing certificates are separate from the **updater** signing key below.

## Auto-Updater

### 1. Generate the update signing key (once)

```bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```

Keep the private key and its password in CI secrets (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). **Never commit it.** Losing it means existing installs can't verify future updates.

### 2. Configure

```json
// tauri.conf.json
{
  "bundle": {
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "pubkey": "<contents of myapp.key.pub>",
      "endpoints": [
        "https://releases.example.com/{{target}}/{{arch}}/{{current_version}}",
        "https://github.com/OWNER/REPO/releases/latest/download/latest.json"
      ]
    }
  }
}
```

Endpoints must be HTTPS in production. A dynamic endpoint returns `204 No Content` when there's no update; a static `latest.json` looks like:

```json
{
  "version": "1.2.0",
  "notes": "Bug fixes",
  "pub_date": "2026-10-01T12:00:00Z",
  "platforms": {
    "darwin-aarch64": { "signature": "<.sig file contents>", "url": "https://…/MyApp.app.tar.gz" },
    "windows-x86_64": { "signature": "<.sig file contents>", "url": "https://…/MyApp_1.2.0_x64-setup.exe" }
  }
}
```

### 3. Register (desktop only) and grant permissions

```rust
.setup(|app| {
    #[cfg(desktop)]
    app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
    Ok(())
})
.plugin(tauri_plugin_process::init())
```

```json
"updater:default",
"process:allow-restart"
```

### 4. Check from the frontend

```ts
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const update = await check();
if (update) {
  // ask the user first; don't restart mid-task
  await update.downloadAndInstall((event) => {
    if (event.event === 'Progress') { /* event.data.chunkLength */ }
  });
  await relaunch();
}
```

On Windows the installer exits the app during install; save state before calling `downloadAndInstall`.

## Versioning

`version` in `tauri.conf.json` is what the updater compares (semver). Keep it in sync with `Cargo.toml` and `package.json` — or point it at the package file: `"version": "../package.json"`.

## Mobile (Android / iOS)

```bash
npm run tauri android init     # needs Android Studio, SDK, NDK, JAVA_HOME, ANDROID_HOME, NDK_HOME
npm run tauri ios init         # macOS + Xcode only
npm run tauri android dev
npm run tauri ios dev
npm run tauri android build    # .apk / .aab
npm run tauri ios build        # .ipa
```

- `lib.rs` must keep `#[cfg_attr(mobile, tauri::mobile_entry_point)]` on `run()`, and `Cargo.toml` needs `crate-type = ["staticlib", "cdylib", "rlib"]`.
- Physical devices need the dev server reachable on the LAN — see the `TAURI_DEV_HOST` Vite config in project-setup.md.
- Guard desktop-only code and plugins with `#[cfg(desktop)]`; scope mobile capabilities with `"platforms": ["iOS", "android"]`.
- Not all plugins support mobile — check the plugin's page before relying on it.
- Store distribution follows normal Play Console / App Store Connect signing and review.
