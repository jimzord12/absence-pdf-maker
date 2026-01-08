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
- If `$ARGUMENTS` contains a task ID, implement that specific task
- **Stop after completing ONE task** - do NOT automatically continue to the next

## Task State Transitions

Reference the valid state transitions (see `docs/tasks/CONTEXT.md`):

```
not_started → implemented → unit_tested → review_pass → completed → committed
                                ↓              ↑
                           review_fail ────────┘
```

## Workflow

### Step 1: Identify Task

**Run in terminal:** `npm run task next`

- If `$ARGUMENTS` contains a task ID:
  - Run: `npm run task show <taskId>` instead
- The command outputs: identifier, description, constraints, acceptanceCriteria, currentState, location, nextSteps
- **Only pick ONE task** - never process multiple tasks in one execution
- If `currentState` is `review_fail`, the task needs fixes based on previous review feedback

### Step 2: Confirm with User

**STOP and display task summary for User confirmation:**

```
Task: {identifier}
Priority: {priority}
Current State: {currentState}
Location: {location}

Description:
{description}

Acceptance Criteria:
{acceptanceCriteria}

Next Steps:
{nextSteps}

Proceed with implementation? (y/n)
```

### Step 3: Initialize Planning

- Use the `manage_todo_list` tool to create a structured plan
- Break down the task into small, actionable steps based on acceptance criteria
- Include steps for: research, implementation, testing, linting, type-checking
- Mark the first step as `in-progress`

### Step 4: Execute Implementation

1. **Context Layering**: Check for `CONTEXT.md` files in relevant directories (feature-specific rules override global)
2. **Code Style**: Follow `AGENTS.md` conventions (imports, naming, typing, etc.)
3. **Implementation**:
   - Write code that satisfies the acceptance criteria
   - Mark each todo step as `completed` as you finish it
4. **Verification**:
   - Run `npm run test` to verify unit tests pass
   - Run `npm run lint` to check for linting errors
   - Run `npm run typecheck` to verify TypeScript types
5. **Update State**:
   - Run: `npm run task state <taskId> implemented`
   - Task file automatically moves from `backlog/` to `active/`

### Step 5: Unit Testing

1. **Run Tests**: Execute `npm run test` to run all tests
2. **Fix Failures**: If tests fail, fix issues and re-run
3. **Update State**:
   - Run: `npm run task state <taskId> unit_tested`

### Step 6: Automated Code Review

**Spawn reviewer agent** to review the implementation against:

- Task acceptance criteria
- Code style conventions from `AGENTS.md`
- Feature-specific `CONTEXT.md` rules

**If reviewer PASSES:**

1. Run: `npm run task state <taskId> review_pass`
2. Run: `npm run task state <taskId> completed`
3. **NOTIFY USER** with completion report (see Step 7)
4. **STOP** - wait for user instruction

**If reviewer FAILS:**

1. Run: `npm run task state <taskId> review_fail`
2. Capture all reviewer feedback/notes
3. **Spawn developer subagent** with:
   - Task ID and context
   - Full reviewer feedback (what's wrong, what needs fixing)
   - Instruction to fix all issues and re-test
4. After fixes complete, transition back: `review_fail → implemented`
5. **Loop back to Step 5** (re-test and re-review)
6. Repeat until reviewer passes

### Step 7: Report Completion

**NOTIFY USER** when task reaches `completed` state:

```
✅ Task Completed: {taskId}

Summary:
- {brief description of what was accomplished}

Files Created:
- {list of new files}

Files Modified:
- {list of modified files}

Tests:
- {test file(s) and pass status}

Ready for: git commit (use /commit-tasks command)
```

**STOP HERE** - do NOT proceed to the next task automatically.

### Step 8: Handover (ONLY if task cannot be completed)

If after multiple attempts the task still cannot be completed:

1. Document what was tried and what's blocking in the task file's `Notes` section
2. Run: `npm run task state <taskId> <current-state>` to update state
3. Inform the user with detailed handover note explaining:
   - What was attempted
   - What's blocking completion
   - Suggested next steps or external dependencies needed

## CLI Command Reference

| Command                               | When to Use                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `npm run task next`                   | Step 1 - Get next actionable task (if no $ARGUMENTS) |
| `npm run task show <taskId>`          | Step 1 - Get specific task by ID (if $ARGUMENTS)     |
| `npm run task state <taskId> <state>` | Steps 4-6 - Update task state after each phase       |
| `npm run task list`                   | Recovery - Check all tasks if state unclear          |
| `npm run task list --state=<state>`   | Filter tasks by state                                |

## Recovery

If the workflow is interrupted:

1. Run `npm run task list` to see all tasks and their states
2. Run `npm run task show <taskId>` to get full details
3. Check the task's `Notes` section for handover information
4. Resume from the current state

