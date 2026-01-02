# Task Implementation Cycle Workflow

This document describes the complete workflow for implementing tasks in this project. The workflow ensures tasks are tracked properly from identification through completion.

## Task States

Each task can be in one of 7 states:

| State         | Description                                      |
| ------------- | ------------------------------------------------ |
| `not_started` | Task has not been started yet                    |
| `implemented` | Code has been written but not yet tested         |
| `unit_tested` | Unit tests have been written and passing         |
| `review_fail` | Code review has been requested and failed        |
| `review_pass` | Code review has been requested and passed        |
| `completed`   | All work is done (implementation, tests, review) |
| `committed`   | Changes have been committed to version control   |

## Workflow Process

### Step 1: Identify Task

When you want to work on a task, the system will:

1. Read `tasks/state.json` to see current state of all tasks
2. Identify which task you want to work on based on your input
3. Display the task details (identifier, description, constraints, acceptance criteria)
4. Show the current state of the task

### Step 2: Confirm with User

**STOP and await User confirmation before proceeding.**

The system will display:

- Task identifier (e.g., `001-task-project-scaffolding`)
- Task description
- Current state
- Next steps based on current state

The User must confirm before any work begins.

### Step 3: Execute Work Based on State

Once confirmed, the system will work through the task based on its current state. State transitions happen automatically without pausing for confirmation.

#### State Transitions

```
not_started → implemented → unit_tested → review_pass → completed → committed
                                ↓
                            review_fail
```

**Note:** If `review_fail` occurs, the task goes back to `implemented` for fixes.

#### Detailed State Actions

**`not_started` → `implemented`**

- Read task details from `tasks/TASKS.md`
- Implement code according to constraints and acceptance criteria
- Update `tasks/state.json` to `implemented`

**`implemented` → `unit_tested`**

- Write unit tests for the implemented code
- Ensure all tests pass
- Update `tasks/state.json` to `unit_tested`

**`unit_tested` → `review_pass` or `review_fail`**

- Deploy the `reviewer` subagent to perform an automated code review
- The `reviewer` evaluates code quality, patterns, and adherence to standards
- If review passes → Update to `review_pass`
- If review fails → Update to `review_fail` and summarize feedback in the task's `notes` field

**`review_fail` → `implemented`**

- Fix issues identified in review
- Update `tasks/state.json` to `implemented` (cycle continues)

**`review_pass` → `completed`**

- Mark task as completed
- Update `tasks/state.json` to `completed`

**`completed` → `committed`**

- Commit all changes to version control (if requested by User)
- Update `tasks/state.json` to `committed`

### Step 4: Report Completion

Once the task reaches `completed` or `committed` state, the system will provide:

**Brief Summary:**

- What was accomplished
- Files created
- Files modified
- Files deleted (if any)

Example output:

```
Task completed: 001-task-project-scaffolding

Summary:
- Initialized Vite project with React + TypeScript
- Configured development and build scripts

Files created:
- package.json
- vite.config.ts
- tsconfig.json
- index.html
- src/main.tsx
- src/App.tsx

Files modified:
- (none)

Files deleted:
- (none)
```

## State Tracking

All task states are tracked in `tasks/state.json`:

```json
{
  "tasks": {
    "001-task-project-scaffolding": {
      "state": "committed",
      "lastUpdated": "2024-01-15T10:30:00Z"
    },
    "002-task-folder-structure": {
      "state": "completed",
      "lastUpdated": "2024-01-15T11:45:00Z"
    }
  }
}
```

### State File Structure

- `tasks`: Object containing all tasks by identifier
- Each task has:
  - `state`: Current state (one of the 7 valid states)
  - `lastUpdated`: ISO timestamp of last state change

## Important Rules

1. **Always update `tasks/state.json`** when moving from one state to another
2. **Stop and await User confirmation** before starting work on a task
3. **Do NOT pause between state transitions** within a task (work through all states until `completed` or `committed`)
4. **Report completion** to the User with summary of files created/modified/deleted
5. **Only commit when explicitly requested** by the User

## Example Workflow

1. User: "Work on task 001-task-project-scaffolding"
2. System: Displays task details and state (`not_started`), asks for confirmation
3. User: Confirms
4. System:
   - Implements code → Updates state to `implemented`
   - Writes tests → Updates state to `unit_tested`
   - Reviews code → Updates state to `review_pass`
   - Marks completed → Updates state to `completed`
5. System: Reports completion with file summary
6. User: "Commit the changes"
7. System: Commits → Updates state to `committed`

## Recovery

If the workflow is interrupted at any point, you can:

- Check `docs/tasks/state.json` to see current state
- Resume from that state
- State is preserved between sessions

