# Task Management System Migration Plan

> **Created:** 2026-01-04
> **Status:** ✅ Complete (Phase 6 Finalized)
> **Goal:** Migrate from monolithic `TASKS.md` to a scalable file-per-task architecture with enhanced CLI and OpenCode tool integration.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Target Architecture](#target-architecture)
3. [Migration Phases](#migration-phases)
   - [Phase 1: Foundation](#phase-1-foundation)
   - [Phase 2: Enhanced CLI](#phase-2-enhanced-cli)
   - [Phase 3: Task Migration](#phase-3-task-migration)
   - [Phase 4: OpenCode Tools](#phase-4-opencode-tools)
   - [Phase 5: Agent Documentation Updates](#phase-5-agent-documentation-updates)
   - [Phase 6: Cleanup & Finalization](#phase-6-cleanup--finalization)
4. [Detailed Implementation](#detailed-implementation)
5. [Risk Assessment](#risk-assessment)
6. [Success Criteria](#success-criteria)

---

## Current State Analysis

### Existing Files

| File                         | Lines | Purpose             | Issues                       |
| ---------------------------- | ----- | ------------------- | ---------------------------- |
| `docs/tasks/state.json`      | ~327  | Task state tracking | Grows with every task        |
| `docs/tasks/TASKS.md`        | ~544  | Task descriptions   | Monolithic, hard to navigate |
| `scripts/task-cli.ts`        | ~90   | State transitions   | Limited functionality        |
| `.opencode/tool/nextTask.ts` | ~45   | Get next task       | Regex parsing of large file  |

### Current Task Count

- **Total tasks:** ~68
- **Committed:** ~60
- **Active:** ~5-8
- **Backlog:** ~5

### Pain Points

1. **Scalability:** Both `state.json` and `TASKS.md` grow linearly with task count
2. **Navigation:** Finding a specific task in 500+ lines is cumbersome
3. **Git History:** Changes to one task pollute the entire file's history
4. **Parsing:** Regex-based extraction is fragile and slow on large files
5. **CLI Limitations:** Can only update state, no read/create/list operations

---

## Target Architecture

### Directory Structure

```
docs/tasks/
├── state.json                    # Minimal state pointer (~100 lines max)
├── state.schema.json             # JSON schema for validation
├── CONTEXT.md                    # Task system documentation
├── archive/                      # Completed/committed tasks (read-only)
│   ├── 001-project-scaffolding.md
│   ├── 002-folder-structure.md
│   └── ... (~60 files)
├── active/                       # In-progress tasks
│   ├── 065-toastify-notifications.md
│   └── 068-pdf-offline-failure.md
└── backlog/                      # Not started tasks
    ├── 067-date-range-clear.md
    └── ...
```

### Simplified `state.json`

```json
{
  "$schema": "./state.schema.json",
  "version": "2.0",
  "tasks": {
    "065-toastify-notifications": {
      "state": "in_progress",
      "lastUpdated": "2026-01-04T10:00:00Z",
      "location": "active"
    },
    "068-pdf-offline-failure": {
      "state": "not_started",
      "lastUpdated": "2026-01-03T15:00:00Z",
      "location": "backlog"
    }
  }
}
```

**Key Changes:**

- Archived tasks removed from `state.json` (they're in `archive/` folder)
- `location` field replaces full file paths
- `version` field for migration tracking

### Individual Task File Format

```markdown
# 065-toastify-notifications

**Priority:** High
**Blocks:** 066-import-export-sync
**Blocked By:** none
**Issue:** [#015](../issues/open/015-leave-details-holidays-business-days-clear-button.md)

---

## Description

Implement toast notifications using react-toastify for user feedback on form actions (save, import, export, clear).

## Constraints

- Use react-toastify library (already in dependencies)
- Toast positioning: top-right
- Auto-dismiss after 3 seconds
- Support success, error, warning, info types
- Must work with existing error handling patterns

## Acceptance Criteria

- [ ] Toast notifications appear for successful form save
- [ ] Toast notifications appear for import success/failure
- [ ] Toast notifications appear for export success
- [ ] Toast notifications appear for clear confirmation
- [ ] Toasts are dismissible by clicking
- [ ] Toast styling matches application theme
- [ ] No console errors
- [ ] Unit tests for toast service

## Notes

- Related to Issue #015
- Prerequisite for Task 066
```

---

## Migration Phases

### Phase 1: Foundation ✅

**Duration:** 1-2 hours
**Dependencies:** None
**Status:** Completed (2026-01-04)

| Step | Task                         | Output                                 | Status |
| ---- | ---------------------------- | -------------------------------------- | ------ |
| 1.1  | Create folder structure      | `docs/tasks/{archive,active,backlog}/` | ✅     |
| 1.2  | Create task template         | `docs/templates/TASK-TEMPLATE.md`      | ✅     |
| 1.3  | Update state schema          | Add `location`, `version` fields       | ✅     |
| 1.4  | Create migration script stub | `scripts/migrate-tasks.ts`             | ✅     |

### Phase 2: Enhanced CLI ✅

**Duration:** 2-3 hours
**Dependencies:** Phase 1
**Status:** Completed (2026-01-04)

| Step | Task                                  | Output                    | Status |
| ---- | ------------------------------------- | ------------------------- | ------ |
| 2.1  | Refactor to subcommand architecture   | `task <command> [args]`   | ✅     |
| 2.2  | Implement `task show <id>`            | Display task details      | ✅     |
| 2.3  | Implement `task list [--state]`       | List tasks with filtering | ✅     |
| 2.4  | Implement `task create <id>`          | Create from template      | ✅     |
| 2.5  | Implement `task move <id> <location>` | Move between folders      | ✅     |
| 2.6  | Implement `task archive <id>`         | Archive completed tasks   | ✅     |
| 2.7  | Update `task state <id> <state>`      | Enhanced state command    | ✅     |
| 2.8  | Add `task next`                       | Get next actionable task  | ✅     |

### Phase 3: Task Migration ✅

**Duration:** 1-2 hours
**Dependencies:** Phase 2
**Status:** Completed (2026-01-04)

| Step | Task                          | Output                     | Status |
| ---- | ----------------------------- | -------------------------- | ------ |
| 3.1  | Create migration script       | `scripts/migrate-tasks.ts` | ✅     |
| 3.2  | Extract tasks from `TASKS.md` | Individual `.md` files     | ✅     |
| 3.3  | Sort into correct folders     | Based on current state     | ✅     |
| 3.4  | Update `state.json` format    | New v2 format              | ✅     |
| 3.5  | Validate migration            | All tasks accessible       | ✅     |

**Migration Summary:**

- 68 total tasks migrated
- 65 tasks → `archive/` (committed/cancelled)
- 2 tasks → `active/` (completed)
- 1 task → `backlog/` (not_started)
- `state.json` reduced from 327 lines to ~25 lines (only non-archived tasks)

### Phase 4: OpenCode Tools ✅

**Duration:** 2-3 hours
**Dependencies:** Phase 3
**Status:** Completed (2026-01-04)

| Step | Task                       | Output                     | Status |
| ---- | -------------------------- | -------------------------- | ------ |
| 4.1  | Update `lib/filesystem.ts` | New file structure support | ✅     |
| 4.2  | Update `lib/tasks.ts`      | Individual file parsing    | ✅     |
| 4.3  | Update `nextTask.ts`       | Use new structure          | ✅     |
| 4.4  | Add `tasks_show` tool      | Get task by ID             | ✅     |
| 4.5  | Add `tasks_list` tool      | List with filters          | ✅     |
| 4.6  | Add `tasks_setState` tool  | Update state               | ✅     |
| 4.7  | Add `tasks_create` tool    | Create new task            | ✅     |
| 4.8  | Write tests for all tools  | `*.test.ts` files          | ✅     |

**Implementation Summary:**

- `lib/filesystem.ts`: Added support for TaskPaths, individual file operations, listAllTasks, findTaskFile, moveTaskFile
- `lib/tasks.ts`: Added parseTaskFile for individual .md files, getLocationForState, isValidStateTransition, generateTaskContent
- `nextTask.ts`: Refactored to use individual task files instead of TASKS.md
- `tasks.ts`: New file with show, list, setState, and create tools
- All 53 unit tests passing

### Phase 5: Agent Documentation Updates ✅

**Duration:** 2-3 hours
**Dependencies:** Phase 4
**Critical:** This phase ensures AI agents understand the new task system.
**Status:** Completed (2026-01-04)

| Step | Task                                         | Output                                      | Status |
| ---- | -------------------------------------------- | ------------------------------------------- | ------ |
| 5.1  | Update `AGENTS.md`                           | New task workflow, commands, file locations | ✅     |
| 5.2  | Update `.github/copilot-instructions.md`     | New task file references                    | ✅     |
| 5.3  | Update `docs/tasks/CONTEXT.md`               | Complete rewrite for new structure          | ✅     |
| 5.4  | Update `.opencode/tool/README.md`            | Document new tools                          | ✅     |
| 5.5  | Update `.opencode/agent/` files              | Agent-specific instructions                 | ✅     |
| 5.6  | Update `docs/templates/HANDOVER-TEMPLATE.md` | Reference new task locations                | ✅     |

**Implementation Summary:**

- `AGENTS.md`: Added full "Task Management System" section with locations, CLI commands, OpenCode tools, workflow, and state transitions
- `.github/copilot-instructions.md`: Updated Key Files section and Handover workflow
- `docs/tasks/CONTEXT.md`: Complete rewrite with file-per-task structure, state transitions with folder moves, CLI commands, and agent workflow
- `.opencode/tool/README.md`: Already updated in Phase 4 with all new tools documented
- `.opencode/agent/orchestrator.md`: Updated task references, state flow diagram, and state file structure
- `.opencode/agent/finisher.md`: Updated to read task files instead of TASKS.md, updated issue handling
- `docs/templates/HANDOVER-TEMPLATE.md`: Added task file path and next steps section

### Phase 6: Cleanup & Finalization ✅

**Duration:** 1 hour
**Dependencies:** Phase 5
**Status:** Completed (2026-01-04)

| Step | Task                                         | Output                                        | Status |
| ---- | -------------------------------------------- | --------------------------------------------- | ------ |
| 6.1  | Archive `TASKS.md`                           | Move to `docs/tasks/legacy/`                  | ✅     |
| 6.2  | Update `package.json` scripts                | CLI command already present                   | ✅     |
| 6.3  | Remove deprecated code                       | Clean up old parsers in `.opencode/tool/lib/` | ✅     |
| 6.4  | Validate all agents can use new system       | CLI & tests pass (48 tests)                   | ✅     |
| 6.5  | Update `docs/templates/HANDOVER-TEMPLATE.md` | Already updated in Phase 5                    | ✅     |

**Implementation Summary:**

- `TASKS.md` moved to `docs/tasks/legacy/TASKS.md`
- Removed deprecated functions: `extractTaskInfo`, `getNextTaskResult`, `readTasksFile`
- Removed legacy tests for deprecated functions (reduced from 53 to 48 tests)
- Updated `.opencode/tool/lib/README.md` to document current API
- All 48 tests passing
- CLI commands `next`, `list`, `show`, `state`, `create`, `archive` all validated

---

## Detailed Implementation

### Agent Documentation Updates (Phase 5)

This is a **critical phase** for AI-agent-driven development. The following files must be updated to ensure agents understand the new task system.

#### Files Requiring Updates

| File                                  | Current References                                           | Required Changes                           |
| ------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `AGENTS.md`                           | Handover Protocol mentions `state.json`                      | Update task workflow, add new CLI commands |
| `.github/copilot-instructions.md`     | References `docs/tasks/state.json` and `docs/tasks/TASKS.md` | Update to new file structure               |
| `docs/tasks/CONTEXT.md`               | Full workflow based on monolithic `TASKS.md`                 | Complete rewrite for file-per-task         |
| `.opencode/tool/README.md`            | Documents `nextTask.ts`                                      | Document all new tools                     |
| `.opencode/tool/lib/tasks.ts`         | Regex parsing of `TASKS.md`                                  | Rewrite for individual file parsing        |
| `.opencode/tool/lib/filesystem.ts`    | Paths to old structure                                       | Update paths and add folder scanning       |
| `docs/templates/HANDOVER-TEMPLATE.md` | May reference old structure                                  | Update task location references            |

#### 5.1: Update `AGENTS.md`

**Section to Add/Replace:** "Task Management System"

```markdown
## Task Management System

### Task Locations

Tasks are organized by status in separate folders:

| Folder                | Contents | Description                 |
| --------------------- | -------- | --------------------------- |
| `docs/tasks/backlog/` | `*.md`   | Tasks not yet started       |
| `docs/tasks/active/`  | `*.md`   | Tasks currently in progress |
| `docs/tasks/archive/` | `*.md`   | Completed/committed tasks   |

### Task State Tracking

- **State file:** `docs/tasks/state.json` (minimal, ~100 lines)
- **Task details:** Individual `.md` files in respective folders

### CLI Commands

| Command                                 | Description               |
| --------------------------------------- | ------------------------- |
| `npm run task next`                     | Get next actionable task  |
| `npm run task show <id>`                | Display task details      |
| `npm run task list`                     | List all active tasks     |
| `npm run task list --state=not_started` | Filter by state           |
| `npm run task state <id> <state>`       | Update task state         |
| `npm run task create <id>`              | Create task from template |
| `npm run task archive <id>`             | Move task to archive      |

### OpenCode Tools

The following tools are available for AI agents:

| Tool             | Description                                |
| ---------------- | ------------------------------------------ |
| `tasks_next`     | Get next actionable task with full details |
| `tasks_show`     | Get specific task by ID                    |
| `tasks_list`     | List tasks with optional filters           |
| `tasks_setState` | Update task state with validation          |
| `tasks_create`   | Create new task from template              |

### Workflow for Agents

1. Call `tasks_next` to get the next task to work on
2. Read task details (description, constraints, acceptance criteria)
3. Implement the task
4. Call `tasks_setState` to update progress
5. Task auto-moves between folders based on state
```

#### 5.2: Update `.github/copilot-instructions.md`

**Section to Update:** "Project Context > Key Files"

```markdown
- **Key Files**:
  - `AGENTS.md`: Global rules, stack info, and tool heuristics.
  - `docs/tasks/state.json`: Minimal task state tracking (state + timestamps).
  - `docs/tasks/active/`: Tasks currently in progress.
  - `docs/tasks/backlog/`: Tasks not yet started.
  - `docs/tasks/archive/`: Completed tasks (read-only reference).
```

**Section to Update:** "Workflow > Handover"

```markdown
- **Handover**: If a task is not finished, update `docs/tasks/state.json` with a handover note. The task file in `docs/tasks/active/` should also be updated with progress notes in the "Notes" section.
```

#### 5.3: Rewrite `docs/tasks/CONTEXT.md`

Complete rewrite required. Key changes:

1. **Remove** references to parsing `TASKS.md`
2. **Add** file-per-task structure explanation
3. **Update** state transition actions to include folder moves
4. **Add** CLI command examples for each transition
5. **Update** "Example Workflow" section

**New State Transition with Folder Moves:**

```markdown
## State Transitions with Auto-Archiving

| Transition                    | Action         | Folder Move            |
| ----------------------------- | -------------- | ---------------------- |
| `not_started` → `implemented` | Code written   | `backlog/` → `active/` |
| `implemented` → `unit_tested` | Tests pass     | Stays in `active/`     |
| `unit_tested` → `review_pass` | Review passes  | Stays in `active/`     |
| `review_pass` → `completed`   | Task done      | Stays in `active/`     |
| `completed` → `committed`     | Git commit     | `active/` → `archive/` |
| Any → `cancelled`             | Task cancelled | Current → `archive/`   |
```

#### 5.4: Update `.opencode/tool/README.md`

Add documentation for new tools:

```markdown
## Available Tools

### tasks_next

Get the next task to work on based on priority and dependencies.

**Returns:** Task details including description, constraints, acceptance criteria, and suggested next steps.

### tasks_show

Get full details of a specific task.

**Args:**

- `taskId` (string): Task identifier (e.g., "065-toastify-notifications")

### tasks_list

List tasks with optional filtering.

**Args:**

- `state` (string, optional): Filter by state
- `location` (string, optional): Filter by folder (backlog, active, archive)
- `limit` (number, optional): Max results (default: 20)

### tasks_setState

Update task state with validation and auto-archiving.

**Args:**

- `taskId` (string): Task identifier
- `newState` (string): Target state

**Behavior:** Automatically moves task files between folders when state changes.

### tasks_create

Create a new task from template.

**Args:**

- `taskId` (string): New task identifier
- `description` (string): Brief description
- `priority` (string, optional): high/medium/low
```

---

## Detailed Implementation

### Phase 1.2: Task Template

**File:** `docs/templates/TASK-TEMPLATE.md`

```markdown
# {{TASK_ID}}

**Priority:** {{high|medium|low}}
**Blocks:** {{comma-separated task IDs or "none"}}
**Blocked By:** {{comma-separated task IDs or "none"}}
**Issue:** {{link to issue or "N/A"}}

---

## Description

{{Detailed description of what needs to be done. Include context and motivation.}}

## Constraints

- {{Technical constraint 1}}
- {{Technical constraint 2}}
- {{Pattern or convention to follow}}

## Acceptance Criteria

- [ ] {{Measurable criterion 1}}
- [ ] {{Measurable criterion 2}}
- [ ] {{Test requirement}}
- [ ] {{Documentation requirement}}

## Notes

{{Optional: Related links, context, handover notes, etc.}}
```

### Phase 2.1: CLI Subcommand Architecture

**Refactored `scripts/task-cli.ts`:**

```typescript
import { Command } from 'commander';

const program = new Command();

program.name('task').description('Task management CLI').version('2.0.0');

program.command('state <taskId> <newState>').description('Update task state').action(handleState);

program.command('show <taskId>').description('Show task details').action(handleShow);

program
  .command('list')
  .description('List tasks')
  .option('-s, --state <state>', 'Filter by state')
  .option('-l, --location <location>', 'Filter by location')
  .action(handleList);

program
  .command('create <taskId>')
  .description('Create new task from template')
  .option('-p, --priority <priority>', 'Task priority', 'medium')
  .action(handleCreate);

program.command('archive <taskId>').description('Archive a completed task').action(handleArchive);

program.command('next').description('Show next actionable task').action(handleNext);

program.parse();
```

### Phase 3.1: Migration Script

**File:** `scripts/migrate-tasks.ts`

```typescript
/**
 * Migration script: TASKS.md → Individual files
 *
 * Steps:
 * 1. Parse existing TASKS.md
 * 2. Extract each task section
 * 3. Determine destination folder based on state.json
 * 4. Write individual .md files
 * 5. Update state.json to v2 format
 */

interface LegacyTask {
  identifier: string;
  description: string;
  constraints: string;
  acceptanceCriteria: string;
}

interface MigrationResult {
  taskId: string;
  location: 'archive' | 'active' | 'backlog';
  success: boolean;
  error?: string;
}

async function migrate(): Promise<void> {
  // 1. Read existing files
  const tasksContent = await readFile('docs/tasks/TASKS.md');
  const stateJson = await readJson('docs/tasks/state.json');

  // 2. Parse all tasks
  const tasks = parseAllTasks(tasksContent);

  // 3. Migrate each task
  const results: MigrationResult[] = [];
  for (const task of tasks) {
    const state = stateJson.tasks[task.identifier]?.state;
    const location = determineLocation(state);
    const result = await writeTaskFile(task, location);
    results.push(result);
  }

  // 4. Update state.json
  await updateStateJson(stateJson, results);

  // 5. Report results
  console.log(`Migrated ${results.filter(r => r.success).length}/${tasks.length} tasks`);
}

function determineLocation(state: string): 'archive' | 'active' | 'backlog' {
  if (state === 'committed' || state === 'cancelled') return 'archive';
  if (state === 'not_started') return 'backlog';
  return 'active';
}
```

### Phase 4: OpenCode Tools Structure

**File:** `.opencode/tool/tasks.ts`

```typescript
import { tool } from '@opencode-ai/plugin/tool';

// Tool: tasks_next
export const next = tool({
  description: 'Get the next task to work on based on priority and dependencies',
  args: {},
  async execute() {
    // Implementation using new file structure
  },
});

// Tool: tasks_show
export const show = tool({
  description: 'Get full details of a specific task by ID',
  args: {
    taskId: tool.schema.string().describe('The task identifier (e.g., 065-toastify-notifications)'),
  },
  async execute({ taskId }) {
    // Read from docs/tasks/{location}/{taskId}.md
  },
});

// Tool: tasks_list
export const list = tool({
  description: 'List all tasks with optional filtering',
  args: {
    state: tool.schema.string().optional().describe('Filter by state'),
    location: tool.schema.enum(['archive', 'active', 'backlog']).optional(),
    limit: tool.schema.number().optional().default(20),
  },
  async execute({ state, location, limit }) {
    // Aggregate from state.json and task files
  },
});

// Tool: tasks_setState
export const setState = tool({
  description: 'Update task state with validation',
  args: {
    taskId: tool.schema.string(),
    newState: tool.schema.enum([
      'not_started',
      'implemented',
      'unit_tested',
      'review_fail',
      'review_pass',
      'completed',
      'committed',
    ]),
  },
  async execute({ taskId, newState }) {
    // Validate transition and update state.json
    // Auto-move between folders if needed
  },
});

// Tool: tasks_create
export const create = tool({
  description: 'Create a new task from template',
  args: {
    taskId: tool.schema.string().describe('Task ID (e.g., 069-new-feature)'),
    description: tool.schema.string().describe('Brief task description'),
    priority: tool.schema.enum(['high', 'medium', 'low']).default('medium'),
  },
  async execute({ taskId, description, priority }) {
    // Create from template in backlog/
  },
});
```

---

## Risk Assessment

| Risk                                          | Likelihood | Impact     | Mitigation                                                        |
| --------------------------------------------- | ---------- | ---------- | ----------------------------------------------------------------- |
| Migration script bugs                         | Medium     | High       | Run on backup, validate each file                                 |
| Breaking existing OpenCode tools              | Medium     | Medium     | Keep old tools during transition                                  |
| Git history loss for tasks                    | Low        | Low        | Archive original TASKS.md                                         |
| State.json corruption                         | Low        | High       | Backup before migration, validate schema                          |
| CLI breaking changes                          | Medium     | Low        | Maintain backward compatibility                                   |
| **AI agents confused by partial migration**   | **High**   | **High**   | **Complete all doc updates in Phase 5 before agents resume work** |
| **Copilot/OpenCode using stale instructions** | **Medium** | **Medium** | **Update all agent-facing docs atomically**                       |
| **OpenCode tools fail after migration**       | **Medium** | **High**   | **Test all tools manually before agent use**                      |

---

## Success Criteria

### Functional Requirements

- [ ] All existing tasks accessible via CLI and OpenCode tools
- [ ] Task state transitions work correctly
- [ ] New tasks can be created from template
- [ ] Tasks auto-archive when committed
- [ ] `state.json` stays under 150 lines

### Performance Requirements

- [ ] `task list` completes in < 500ms
- [ ] `task show <id>` completes in < 100ms
- [ ] OpenCode `tasks_next` tool returns in < 1s

### Quality Requirements

- [ ] All CLI commands have `--help` documentation
- [ ] All OpenCode tools have descriptions
- [ ] Migration script is idempotent (can re-run safely)
- [ ] Tests cover all CLI commands
- [ ] Tests cover all OpenCode tools

### Agent Compatibility Requirements

- [ ] `AGENTS.md` documents new task system completely
- [ ] `.github/copilot-instructions.md` references correct file paths
- [ ] `docs/tasks/CONTEXT.md` workflow matches new structure
- [ ] All OpenCode tools return valid JSON with clear error messages
- [ ] Agents can complete a full task lifecycle without manual intervention
- [ ] Handover notes work correctly with new file structure
- [ ] Agent can use `tasks_next` → implement → `tasks_setState` → `tasks_next` loop

---

## Appendix: Command Reference (Post-Migration)

### CLI Commands

```bash
# State management
npm run task state 065-toastify-notifications implemented

# View tasks
npm run task show 065-toastify-notifications
npm run task list
npm run task list --state=not_started
npm run task list --location=active
npm run task next

# Task lifecycle
npm run task create 069-new-feature
npm run task archive 065-toastify-notifications

# Help
npm run task --help
npm run task show --help
```

### OpenCode Tools

| Tool             | Description              |
| ---------------- | ------------------------ |
| `tasks_next`     | Get next actionable task |
| `tasks_show`     | Get task details by ID   |
| `tasks_list`     | List tasks with filters  |
| `tasks_setState` | Update task state        |
| `tasks_create`   | Create new task          |

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Decide on Phase 1 start date**
3. **Consider:** Should archived tasks stay in `state.json` or be removed entirely?
4. **Consider:** Add `cancelled` as a location, or treat as archive subfolder?
