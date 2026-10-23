# AP Claude Marketplace

This repository is a Claude Code plugin marketplace named `hoangtruong-marketplace`. The catalog is `.claude-plugin/marketplace.json`; each plugin lives under `plugins/` and follows the standard plugin structure. New plugins start as a copy of `templates/plugin-template/`.

## Plugin Structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── agents/                   # Agent definitions
├── hooks/                    # Optional: hooks.json + scripts for tool/session events
├── evals/                    # Optional: `claude plugin eval` cases, one <case>/case.yaml each
├── rules/                    # Context-triggered rules
├── skills/                   # User-invocable skills
│   └── <skill-name>/
│       ├── SKILL.md          # Skill entry point
│       └── reference/        # Supporting docs
└── README.md
```

## Conventions

- Skills are invoked as `/<plugin-name>:<skill-name>`
- Each skill must have a `SKILL.md` with frontmatter (name, description)
- Reference files are loaded on-demand by skills, not eagerly
- Agents define subagent roles with specific tools and responsibilities
- Rules trigger based on file path patterns
- Every plugin under `plugins/` must have a matching entry in `.claude-plugin/marketplace.json`; keep `name`, `description` and `version` identical in both places
- Skill and agent `description` frontmatter states what it does and when to use it — Claude routes on it
- Plugins with evals: run `claude plugin eval ./plugins/<plugin-name> --tag routing` after changing a skill `description`
- Run `claude plugin validate .` and `claude plugin validate ./plugins/<plugin-name>` before committing