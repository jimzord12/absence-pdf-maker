# Task Management Context

This document describes the task management system for this project. Tasks are organized as individual files to enable scalability, clear git history, and efficient agent navigation.

## Directory Structure

```
docs/tasks/
├── state.json              # Minimal state tracking (~100 lines, non-archived tasks only)
├── state.schema.json       # JSON schema for validation
├── CONTEXT.md              # This file
├── backlog/                # Tasks not yet started
│   └── *.md
├── active/                 # Tasks in progress (implemented → completed)
│   └── *.md
└── archive/                # Completed/committed/cancelled tasks (read-only)
    └── *.md
```

## Task States

Each task can be in one of 8 states:

| State         | Description                                      | Location  |
| ------------- | ------------------------------------------------ | --------- |
| `not_started` | Task has not been started yet                    | `backlog` |
| `implemented` | Code has been written but not yet tested         | `active`  |
| `unit_tested` | Unit tests have been written and passing         | `active`  |
| `review_fail` | Code review has been requested and failed        | `active`  |
| `review_pass` | Code review has been requested and passed        | `active`  |
| `completed`   | All work is done (implementation, tests, review) | `active`  |
| `committed`   | Changes have been committed to version control   | `archive` |
| `cancelled`   | Task was cancelled                               | `archive` |

## State Transitions

```
backlog/                          active/                              archive/
┌───────────┐    ┌───────────┐    ┌─────────────┐    ┌───────────┐    ┌───────────┐
│not_started│ ──>│implemented│ ──>│ unit_tested │ ──>│review_pass│ ──>│ completed │ ──> committed
└───────────┘    └───────────┘    └─────────────┘    └───────────┘    └───────────┘
                      ^                  │
                      │                  v
                      └──────────── review_fail

Any state ──> cancelled ──> archive/
```

### State Transition Actions

| Transition                    | Action         | Folder Move            |
| ----------------------------- | -------------- | ---------------------- |
| `not_started` → `implemented` | Code written   | `backlog/` → `active/` |
| `implemented` → `unit_tested` | Tests pass     | Stays in `active/`     |
| `unit_tested` → `review_pass` | Review passes  | Stays in `active/`     |
| `unit_tested` → `review_fail` | Review fails   | Stays in `active/`     |
| `review_fail` → `implemented` | Fixes applied  | Stays in `active/`     |
| `review_pass` → `completed`   | Task done      | Stays in `active/`     |
| `completed` → `committed`     | Git commit     | `active/` → `archive/` |
| Any → `cancelled`             | Task cancelled | Current → `archive/`   |

## Task File Format

Each task is stored as a markdown file: `docs/tasks/{location}/{taskId}.md`

```markdown
# {taskId}

**Priority:** high | medium | low
**Blocks:** comma-separated task IDs or "none"
**Blocked By:** comma-separated task IDs or "none"
**Issue:** link to issue or "N/A"

---

## Description

Detailed description of what needs to be done.

## Constraints

- Technical constraint 1
- Technical constraint 2

## Acceptance Criteria

- [ ] Measurable criterion 1
- [ ] Measurable criterion 2
- [ ] Test requirement

## Notes

Optional: Related links, context, handover notes.
```

## State File Format

Only non-archived tasks are tracked in `state.json`:

```json
{
  "$schema": "./state.schema.json",
  "version": "2.0",
  "tasks": {
    "065-toastify-notifications": {
      "state": "implemented",
      "lastUpdated": "2026-01-04T10:00:00Z",
      "location": "active"
    },
    "067-date-range-clear": {
      "state": "not_started",
      "lastUpdated": "2026-01-03T15:00:00Z",
      "location": "backlog"
    }
  }
}
```

**Note:** Archived tasks are NOT in `state.json`. Their state is inferred from their location.

## CLI Commands

| Command                                 | Description               |
| --------------------------------------- | ------------------------- |
| `npm run task next`                     | Get next actionable task  |
| `npm run task show <id>`                | Display task details      |
| `npm run task list`                     | List all active tasks     |
| `npm run task list --state=not_started` | Filter by state           |
| `npm run task state <id> <state>`       | Update task state         |
| `npm run task create <id>`              | Create task from template |
| `npm run task archive <id>`             | Move task to archive      |

## Creating New Tasks

### Task Template

All new tasks should follow the standard template located at: [`docs/templates/TASK-TEMPLATE.md`](../templates/TASK-TEMPLATE.md)

### Task ID Convention

Task IDs follow a sequential numbering pattern with a descriptive suffix:

- Format: `{number}-{kebab-case-description}`
- Examples: `065-toastify-notifications`, `067-date-range-clear`

To determine the next task number:

1. Check the highest existing task ID in `backlog/`, `active/`, and `archive/`
2. Increment by 1 for the new task

### Creating a Task via CLI

```bash
npm run task create <task-id>
```

This command:

1. Creates a new task file in `docs/tasks/backlog/{task-id}.md` from the template
2. Adds an entry to `docs/tasks/state.json` with state `not_started`

### Creating a Task Manually

1. Copy the template from `docs/templates/TASK-TEMPLATE.md`
2. Create a new file: `docs/tasks/backlog/{task-id}.md`
3. Fill in all required fields:
   - **Priority:** `high`, `medium`, or `low`
   - **Blocks/Blocked By:** Task dependencies or `none`
   - **Issue:** Link to related issue or `N/A`
   - **Description:** Clear explanation of what needs to be done
   - **Constraints:** Technical limitations or patterns to follow
   - **Acceptance Criteria:** Measurable checklist items
4. Add an entry to `docs/tasks/state.json`:

```json
"{task-id}": {
  "state": "not_started",
  "lastUpdated": "{ISO-8601-timestamp}",
  "location": "backlog"
}
```

### Tips for Writing Good Tasks

1. **Be specific:** Avoid vague descriptions. Include file paths, function names, and expected behavior.
2. **Keep tasks atomic:** One task = one logical unit of work. If a task feels too large, split it.
3. **Define clear acceptance criteria:** Each criterion should be testable/verifiable.
4. **Document dependencies:** Use `Blocks` and `Blocked By` to track task relationships.
5. **Link to issues:** Connect tasks to GitHub issues when applicable for traceability.
6. **Add context in Notes:** Include research links, design decisions, or handover information.

## OpenCode Tools

The following tools are available for AI agents:

| Tool             | Description                                |
| ---------------- | ------------------------------------------ |
| `tasks_next`     | Get next actionable task with full details |
| `tasks_show`     | Get specific task by ID                    |
| `tasks_list`     | List tasks with optional filters           |
| `tasks_setState` | Update task state with validation          |
| `tasks_create`   | Create new task from template              |

## Workflow for Agents

### Step 1: Identify Task

1. Call `tasks_next` or `npm run task next` to get the next actionable task
2. Review task details (description, constraints, acceptance criteria)
3. Check for blockers (tasks in `Blocked By` must be completed)

### Step 2: Confirm with User

**STOP and await User confirmation before proceeding.**

Display:

- Task identifier
- Task description
- Current state
- Next steps based on current state

### Step 3: Execute Work

Once confirmed, work through the task based on its current state. State transitions happen automatically.

### Step 4: Update State

After completing work:

1. Call `tasks_setState` or `npm run task state <id> <state>` to update progress
2. Task files auto-move between folders based on state transitions

### Step 5: Report Completion

Once the task reaches `completed` or `committed` state, provide:

```
Task completed: {taskId}

Summary:
- What was accomplished

Files created:
- (list files)

Files modified:
- (list files)
```

## Important Rules

1. **Always update task state** when moving from one state to another
2. **Stop and await User confirmation** before starting work on a task
3. **Do NOT pause between state transitions** within a task
4. **Report completion** to the User with summary of files created/modified
5. **Only commit when explicitly requested** by the User
6. **Update task Notes** section for handovers or important context

## Recovery

If the workflow is interrupted:

1. Check task location (backlog, active, archive folder)
2. Check `docs/tasks/state.json` for current state
3. Resume from that state
4. State is preserved between sessions

