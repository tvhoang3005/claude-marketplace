# nextjs

Next.js 14+ patterns for App Router, Server Components, Server Actions, data fetching, and performance.

## Install

```bash
/plugin install nextjs@hoangtruong
```

## Usage

The skill triggers automatically when Claude detects Next.js code (imports from `next`, `next/navigation`, `@next/`) or when you ask about Next.js patterns.

```bash
# Explicit invocation
/nextjs:nextjs-stack

# Auto-triggers on questions like:
# "create a new page"
# "add a server action"
# "optimize this component"
# "set up middleware"
```

## Reference Topics (5)

| Topic | What It Covers |
|---|---|
| **App Router** | Route structure, layouts, loading/error states, metadata |
| **Components** | Server vs Client Components, composition patterns |
| **Data Fetching** | Server-side fetching, caching, revalidation |
| **Server Actions** | Form handling, mutations, optimistic updates |
| **Performance** | Image optimization, code splitting, Core Web Vitals |

References are loaded on-demand — only the relevant topic is read when needed.

## Rules (1)

| Rule | Applies to | What It Enforces |
|---|---|---|
| **evidence-based** | all files (`**/*`) | Back non-obvious claims with verifiable evidence (file:line, docs links, command output); state assumptions such as App Router vs Pages Router or Next.js version; say "I don't know" rather than guess |