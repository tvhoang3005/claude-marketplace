# tauri evals

Routing tests for the `tauri-stack` skill, run with `claude plugin eval`. Each case is one `case.yaml`; prompts are self-contained (no fixture project).

| Case | Checks |
|---|---|
| `route-command-to-tauri-stack` | Adding a `#[tauri::command]` starts `tauri-stack` |
| `route-permission-error-to-tauri-stack` | A capability "not allowed" error starts `tauri-stack` |
| `no-trigger-on-electron` | An Electron question does not start `tauri-stack` |

## Run

From the repo root:

```bash
claude plugin eval ./plugins/tauri --tag routing
claude plugin eval ./plugins/tauri --case no-trigger-on-electron --runs 1
```

Each run starts a full Claude session on your account and cases run 3 times by default; use `--max-cost-usd` to cap cost.
