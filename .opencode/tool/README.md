# OpenCode Tools

Custom tools for the Leave Request Application project. These tools integrate with OpenCode AI to provide task management capabilities.

Visit here for more information about OpenCode tools: https://opencode.ai/docs/custom-tools/

---

## Available Tools

### nextTask

Get the next task that needs to be implemented based on priority and current state.

**Description:** Returns the highest priority task that is not yet committed. Prioritizes tasks with `review_fail` state first, then works through in-progress states, and finally `not_started` tasks.

**Args:** None

**Returns:**

- `nextTask`: Task details including description, constraints, acceptance criteria, current state, location, and suggested next steps
- `summary`: Overview of total, completed, and in-progress tasks

---

### tasks_show

Get full details of a specific task by ID.

**Description:** Reads from `docs/tasks/{active,backlog,archive}/<taskId>.md` and returns parsed task information.

**Args:**

- `taskId` (string, required): The task identifier (e.g., "065-toastify-notifications")

**Returns:**

- `task`: Full task details including description, constraints, acceptance criteria, priority, state, location

---

### tasks_list

List tasks with optional filtering by state or location.

**Description:** Returns a list of tasks with their IDs, states, and locations. Useful for getting an overview of the project status.

**Args:**

- `state` (string, optional): Filter by state (not_started, implemented, unit_tested, review_fail, review_pass, completed, committed, cancelled)
- `location` (string, optional): Filter by location (active, backlog, archive)
- `limit` (number, optional): Maximum number of results (default: 20)

**Returns:**

- `tasks`: Array of task summaries (identifier, state, location, lastUpdated)
- `total`: Total number of matching tasks

---

### tasks_setState

Update the state of a task with validation and automatic folder management.

**Description:** Changes task state and automatically moves the task file between folders based on the new state:

- `not_started` / `pending` → `backlog/`
- `implemented` / `unit_tested` / `review_*` / `completed` → `active/`
- `committed` / `cancelled` → `archive/`

**Args:**

- `taskId` (string, required): The task identifier
- `newState` (string, required): The new state
- `force` (boolean, optional): Force state change even if transition is invalid (default: false)

**Valid State Transitions:**

- `not_started` → `implemented`, `pending`, `cancelled`
- `implemented` → `unit_tested`, `review_fail`, `cancelled`
- `unit_tested` → `review_pass`, `review_fail`, `cancelled`
- `review_fail` → `implemented`, `cancelled`
- `review_pass` → `completed`, `cancelled`
- `completed` → `committed`, `cancelled`

**Returns:**

- `previousState`, `newState`: State change information
- `previousLocation`, `newLocation`: Folder move information (if applicable)

---

### tasks_create

Create a new task file from template.

**Description:** Creates a new task file in `docs/tasks/backlog/` with the specified details. Also adds an entry to `state.json`.

**Args:**

- `taskId` (string, required): The task identifier (e.g., "069-new-feature")
- `priority` (string, optional): Task priority (high, medium, low). Default: medium
- `fromIssue` (string, optional): Link to related issue number
- `description` (string, optional): Task description
- `constraints` (string, optional): Task constraints
- `acceptanceCriteria` (string, optional): Acceptance criteria

**Returns:**

- `taskId`: The created task ID
- `location`: Where the task was created (always "backlog")

---

## Task File Format

Task files are stored in `docs/tasks/{active,backlog,archive}/<taskId>.md`:

```markdown
# 065-toastify-notifications

**Priority:** high
**Blocks:** 066-import-export-sync
**Blocked By:** none
**Issue:** [#015](../issues/open/015.md)

---

## Description

Implement toast notifications using react-toastify.

## Constraints

- Use react-toastify library
- Toast positioning: top-right

## Acceptance Criteria

- [ ] Toast notifications appear for successful form save
- [ ] Toast notifications appear for import success/failure

## Notes

Related to Issue #015
```

---

## State File Format

Task states are tracked in `docs/tasks/state.json`:

```json
{
  "$schema": "./state.schema.json",
  "version": "2.0",
  "tasks": {
    "065-toastify-notifications": {
      "state": "implemented",
      "lastUpdated": "2026-01-04T10:00:00Z",
      "location": "active"
    }
  }
}
```

**Note:** Only non-archived tasks are stored in `state.json`. Archived tasks are inferred from their location in the `archive/` folder.

---

## Development

### Location

Tools can be defined:

- Locally by placing them in the `.opencode/tool/` directory of your project
- Or globally, by placing them in `~/.config/opencode/tool/`

### Running Tests

```bash
cd .opencode
bun test
```

### Tool Structure

```
.opencode/tool/
├── README.md          # This file
├── nextTask.ts        # Get next task tool
├── tasks.ts           # Task management tools (show, list, setState, create)
└── lib/
    ├── filesystem.ts  # File system operations
    ├── tasks.ts       # Task parsing and state management
    └── *.test.ts      # Unit tests
```
