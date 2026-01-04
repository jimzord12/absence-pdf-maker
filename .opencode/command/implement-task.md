---
description: Start the implementation of the next Task.
# agent: orchestrator
subtask: true
---

# Implement Task

Implement **ONE** task completely from `not_started` to `completed`.

## IMPORTANT - AUTOMATED WORKFLOW

- **Complete the ENTIRE lifecycle** without intermediate reporting
- If reviewer fails implementation, automatically spawn developer subagent to fix issues
- **Only notify user when task is `completed`** (implemented + tested + review passed)
- If `$ARGUMENTS` contains a task ID, only implement that specific task
- **Stop after completing ONE task** - do NOT automatically continue to the next

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

6. **Automated Code Review**:

   - **Spawn reviewer agent** to review the implementation
   - If reviewer **PASSES**:
     - Update task state to `review_pass`
     - Update task state to `completed`
     - **NOTIFY USER**: Task completed successfully
     - **STOP** - wait for user instruction before any further action
   - If reviewer **FAILS**:
     - Capture all reviewer feedback/notes
     - **Spawn developer subagent** with:
       - Task ID and context
       - Full reviewer feedback (what's wrong, what needs fixing)
       - Instruction to fix all issues and re-test
     - Wait for developer subagent to complete fixes
     - After fixes complete, **go back to step 4** (re-test and re-review)
     - Loop until reviewer passes

7. **STOP AFTER COMPLETION**:

   - Only notify user when task reaches `completed` state
   - **STOP here** - do NOT proceed to the next task automatically
   - Wait for explicit user instruction before taking any further action

8. **Handover** (ONLY if task cannot be completed):

   - If after multiple attempts the task still cannot be completed (e.g., blocker, external dependency issue)
   - Provide detailed handover note in the task file explaining what was tried and what's blocking
   - Update task state to reflect current situation
