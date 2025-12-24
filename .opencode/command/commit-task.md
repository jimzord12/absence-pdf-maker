---
description: Commit the freshly implemented Task.
agent: finisher
subtask: false
---

# Commit Task Changes

You descriptive commit name for the Task, it must follow the pattern: `feat(<task-identifier>): <brief description>`

**CRITICAL**: Do NOT forget to update `docs/tasks/state.json` to mark the Task as `"state": "committed"` after the commit.

## Common issues

- Forgetting to update `docs/tasks/state.json` to mark the Task as `"state": "committed"`.
- Not committing the `docs/tasks/state.json` file along with the code changes.

