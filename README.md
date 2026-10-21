# Marketplace

A collection of Claude Code plugins for software engineering workflows.

## Disclaimer

This is a **personal project** by [Hoang Truong](https://github.com/tvhoang3005), created and maintained on personal time and equipment. All content in this repository represents **original work based on publicly available engineering knowledge** — including widely-adopted patterns such as Domain-Driven Design, Test-Driven Development, Hexagonal Architecture, and CQRS.

This repository contains no proprietary code, trade secrets, or confidential information belonging to any employer or third party.

Licensed under the [MIT License](LICENSE).

## Plugins

| Plugin | Description |
|---|---|
| **basic-engineering** | Composable skills and agents for everyday software engineering workflows |
| **engineering-toolkit** | AI-DLC workflow — adaptive Plan → Build → Ship pipeline with checkpoints, review agents and git-safety hook |

## Install

```bash
# 1. Add the marketplace
/plugin marketplace add tvhoang3005/claude-marketplace

# 2. Install the plugin
/plugin install basic-engineering@hoangtruong-marketplace
```

## Repository layout

```
.claude-plugin/marketplace.json   # Marketplace catalog — lists every published plugin
plugins/<plugin-name>/            # One directory per plugin
templates/plugin-template/        # Copy this to start a new plugin
```

## Adding a plugin

1. Copy `templates/plugin-template/` to `plugins/<plugin-name>/` and replace `PLUGIN_NAME` / `PLUGIN_DESCRIPTION`.
2. Add an entry to `plugins` in `.claude-plugin/marketplace.json` with `"source": "./plugins/<plugin-name>"`.
3. Validate: `claude plugin validate .` and `claude plugin validate ./plugins/<plugin-name>`.
4. Test locally: `/plugin marketplace add ./` then `/plugin install <plugin-name>@hoangtruong-marketplace`.
5. Bump `version` in both `plugin.json` and the marketplace entry when releasing changes.