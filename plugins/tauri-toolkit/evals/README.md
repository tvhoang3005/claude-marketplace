# tauri-toolkit evals

Routing tests for the `tauri-desktop` skill, run with `claude plugin eval`. Each case is one `case.yaml`; prompts are self-contained (no fixture project).

| Case | Checks |
|---|---|
| `route-command-to-tauri-desktop` | Adding a `#[tauri::command]` starts `tauri-desktop` |
| `route-permission-error-to-tauri-desktop` | A capability "not allowed" error starts `tauri-desktop` |
| `no-trigger-on-electron` | An Electron question does not start `tauri-desktop` |

## Run

From the repo root:

```bash
claude plugin eval ./plugins/tauri-toolkit --tag routing
claude plugin eval ./plugins/tauri-toolkit --case no-trigger-on-electron --runs 1
```

Each run starts a full Claude session on your account and cases run 3 times by default; use `--max-cost-usd` to cap cost.
