---
name: agent-discipline
description: "Keep Copilot work bounded, preserve the agreed architecture, and stop repetitive or unproductive agentic loops. Use when scope is expanding, retries are repeating, or a proposed change affects unrelated areas."
---

# Bounded development workflow

## Before editing
1. Restate the requested outcome internally and identify observable acceptance criteria.
2. Inspect relevant files, tests, and established patterns.
3. Make the smallest useful file scope estimate; expand it only when code or tests show that expansion is necessary.
4. Ask the user when requirements conflict or a consequential design decision cannot be inferred safely.

## While working
- Implement one coherent change at a time and validate it with the narrowest relevant check.
- Do not regenerate whole files to make a local change.
- Do not add unrelated features, dependencies, or architecture migrations.
- Preserve existing user changes; do not revert unrelated work.
- If a test fails, inspect the failure and identify a new root-cause-based next step before editing again.

## Stop conditions
- After three unsuccessful attempts at the same underlying fix, stop, summarize evidence, and request guidance rather than repeating.
- Stop before a broad restructuring or a change that contradicts the established architecture; explain the specific conflict and ask whether to proceed.
- A file-count estimate is not by itself a reason to block a necessary fix. Explain why additional files are required and keep them tied to the acceptance criteria.

## Completion report
- Summarize the implemented result, files/surfaces affected, tests/checks run, and any known limitation.
- Never report a test, build, or behavior as verified unless it was actually checked.
