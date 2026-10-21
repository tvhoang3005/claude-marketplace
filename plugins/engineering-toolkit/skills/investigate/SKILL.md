---
name: investigate
description: Hypothesis-driven root-cause investigation of a bug or failure, without fixing it. Use when the user says "investigate", "debug this", "why is this failing", "find the root cause", or when ai-dlc Plan classifies a bug with an unclear cause.
argument-hint: "<symptom or ticket-id>"
---

# Investigate

Find the root cause; do not fix it. Fixing happens afterwards (in ai-dlc Construct or when the user asks).

1. Collect the symptom: error message, failing command or test, when it started, and how to reproduce. Ask the user only for what you can't find yourself.
2. Delegate to the **`debugger`** agent with the symptom, reproduction steps and any suspect area. It runs at most 3 rounds of hypothesis → minimal check → conclusion.
3. Write the agent's report to `.claude/artifacts/<work-id>/investigation.md` (work id = ticket id or a kebab-case slug of the symptom).
4. Show the user: root cause (with confidence), evidence, and the recommended fix. Ask whether to fix it now, either directly or through `/engineering-toolkit:ai-dlc`.

If the debugger couldn't confirm a root cause after 3 rounds, say so plainly, list the hypotheses that were ruled out, and suggest what data would settle it (logs, a reproduction, access).
