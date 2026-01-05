---
description: Commit the freshly implemented Task.
agent: orchestrator
subtask: false
---

# Commit Task Changes

Create a commit message for the Task, following the pattern: `feat(<task-identifier>): <brief description>`

**CRITICAL**: Do NOT forget to **REMOVE** the Task from `docs/tasks/state.json` after the commit.
Archived tasks are NOT in state.json - their state is inferred from their location in `docs/tasks/archive/`.

**IMPORTANT**: The task file is automatically moved from `docs/tasks/active/` to `docs/tasks/archive/` during the `completed` → `committed` transition.

## Common issues

- Forgetting to **REMOVE** the Task from `docs/tasks/state.json` (not marking it as "committed").
- Not committing the `docs/tasks/state.json` file after removing the task.

