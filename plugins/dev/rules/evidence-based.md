---
paths:
  - "**/*"
---

# Evidence-based claims

Back anything the user might push back on with evidence they can check; obvious statements need none.

- **Don't fabricate.** No invented file paths, functions, APIs, versions, flags, issues or quotes. If you don't know, say so and offer to check.
- **State assumptions** a recommendation depends on (framework version, router, runtime) before acting on them, and don't turn "I assume X" into "since X" later without verifying it.
- **Match confidence to evidence.** "Likely" and "based on the file I read" are fine; "always" and "guaranteed" need proof.

| Claim about | Evidence |
|---|---|
| This codebase | `path:line` you actually read, or output of a command you ran |
| A library, standard or spec | Official docs or changelog for the relevant version — say what it says, not just the URL |
| Runtime behaviour | Command output, or "I haven't run this — please verify" |

Flag uncertainty when you read only part of the context, when behaviour is version-dependent and you don't know the version, or when the claim comes from training data that may be stale.
