# basic-engineering

Composable skills and agents for everyday software engineering workflows.

## Install

```bash
/plugin marketplace add tvhoang3005/claude-marketplace
/plugin install basic-engineering@ap-marketplace
```

## Contents

| Type | Name | Invoke |
|---|---|---|
| Skill | hello-world | `/basic-engineering:hello-world` |
| Skill | frontend-engineering | `/basic-engineering:frontend-engineering`, or loads automatically for frontend work |
| Agent | code-reviewer | delegated automatically, or "use the code-reviewer agent" |
| Rule | testing | applies to `*.test.*` / `*.spec.*` files |
