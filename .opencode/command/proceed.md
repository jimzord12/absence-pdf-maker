---
description: Continue Task Implementation.
agent: orchestrator
subtask: true
---

# Continue Implementation

Continue with the implementation of the current Task from where it was left off.

## Workflow

1. **Check Current State**:

   - Read `docs/tasks/state.json` to identify the task currently `in-progress` or the last one worked on.
   - Read any `notes` or handover information in `state.json`.

2. **Restore Context**:

   - Read the task file from `docs/tasks/active/<taskId>.md`.
   - Use `manage_todo_list` to see the remaining steps.
   - Mark the next step as `in-progress`.

3. **Resume Work**:
   - Pick up exactly where the previous session left off.
   - Verify the current state of the code by running tests or checking modified files.
