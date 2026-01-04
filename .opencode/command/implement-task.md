---
description: Start the implementation of the next Task.
# agent: orchestrator
subtask: true
---

# Implement Task

Implement **ONE** task only.

## IMPORTANT - CONTROL

- **Stop after completing ONE task** - do NOT automatically continue to the next
- If `$ARGUMENTS` contains a task ID, only implement that specific task
- Report completion and wait for user confirmation before doing anything else

## Workflow

1. **Identify Task**:

   - If `$ARGUMENTS` contains a task ID, use that specific task
   - Otherwise, read `docs/tasks/state.json` to find the first task with state `not_started` or `implemented` (if continuing)
   - **Only pick ONE task** - never process multiple tasks in one execution

2. **Read Task Details**:

   - Read the task file from `docs/tasks/{backlog,active}/<taskId>.md`
   - Extract Description, Constraints, and Acceptance Criteria

3. **Initialize Planning**:

   - Use the `todowrite` tool to create a structured plan
   - Break down the task into small, actionable steps
   - Mark the first step as `in-progress`

4. **Execute Implementation**:

   - Follow the "Context Layering" rules (check for `CONTEXT.md` in relevant directories)
   - Adhere to the project's code style (AGENTS.md)
   - Run tests frequently using `npm run test`
   - Mark each todo step as `completed` as you finish it

5. **Update State**:

   - Once implementation is complete, update task state to `implemented`
   - If tests also pass, update to `unit_tested`
   - If review passes, update to `review_pass`

6. **STOP - DO NOT CONTINUE**:

   - Report the completed task to the user
   - **STOP here** - do NOT proceed to the next task automatically
   - Wait for explicit user instruction before taking any further action

7. **Handover** (ONLY if task not finished in one go):

   - If the task is not finished in one go, provide a clear handover note in the task file
   - Do NOT proceed to other tasks
