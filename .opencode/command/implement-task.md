---
description: Start the implementation of the next Task.
agent: orchestrator
subtask: true
---

# Implement Task

Implement the next not completed task.

## Workflow

1. **Identify Task**:

   - Read `docs/tasks/state.json` to find the first task with state `not_started` or `implemented` (if continuing).
   - If a specific task ID is provided in `$ARGUMENTS`, use that.

2. **Read Task Details**:

   - Read the task definition from `docs/tasks/TASKS.md`.
   - Extract Description, Constraints, and Acceptance Criteria.

3. **Initialize Planning**:

   - Use the `manage_todo_list` tool to create a structured plan.
   - Break down the task into small, actionable steps.
   - Mark the first step as `in-progress`.

4. **Execute Implementation**:

   - Follow the "Context Layering" rules (check for `CONTEXT.md` in relevant directories).
   - Adhere to the project's code style (AGENTS.md).
   - Run tests frequently using `npm run test`.

5. **Update State**:

   - Once implementation is complete, update `docs/tasks/state.json` to `implemented`.
   - If tests are also done, update to `unit_tested`.

6. **Handover**:
   - If the task is not finished in one go, provide a clear handover note in `docs/tasks/state.json`.
