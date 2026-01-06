import { tool } from '@opencode-ai/plugin/tool';
import * as path from 'node:path';
import {
  findTaskFile,
  getDefaultPaths,
  listAllTasks,
  moveTaskFile,
  readFileErrorResult,
  readStateFile,
  readTaskFile,
  writeStateFile,
  writeTaskFile,
} from './lib/filesystem.js';
import {
  TaskLocationSchema,
  TaskStateSchema,
  generateTaskContent,
  getLocationForState,
  isValidStateTransition,
  parseTaskFile,
  type ErrorResult,
  type TaskCreateResult,
  type TaskListResult,
  type TaskLocation,
  type TaskShowResult,
  type TaskState,
  type TaskStateChangeResult,
} from './lib/tasks.js';

// ============================================================================
// tasks_show - Get task by ID
// ============================================================================

export const show = tool({
  description:
    'Get full details of a specific task by ID. Reads from docs/tasks/{active,backlog,archive}/<taskId>.md',
  args: {
    taskId: tool.schema
      .string()
      .describe('The task identifier (e.g., "065-toastify-notifications")'),
  },
  async execute(args): Promise<string> {
    const { taskId } = args;
    const paths = getDefaultPaths();

    // Find the task file
    const found = findTaskFile(taskId, paths);
    if (!found) {
      const result: ErrorResult = {
        success: false,
        error: `Task not found: ${taskId}. Searched in active/, backlog/, and archive/ directories.`,
      };
      return JSON.stringify(result);
    }

    // Read and parse the task file
    const content = readTaskFile(found.filePath);
    if (!content) {
      return JSON.stringify(
        readFileErrorResult(new Error(`Could not read: ${found.filePath}`), 'task')
      );
    }

    const taskInfo = parseTaskFile(taskId, content);
    if (!taskInfo) {
      const result: ErrorResult = {
        success: false,
        error: `Could not parse task file: ${taskId}`,
      };
      return JSON.stringify(result);
    }

    // Get state info from state.json if available
    const stateFile = readStateFile(paths.stateFilePath);
    const stateInfo = stateFile?.tasks[taskId];

    const result: TaskShowResult = {
      success: true,
      task: {
        ...taskInfo,
        state: stateInfo?.state ?? (found.location === 'archive' ? 'committed' : 'not_started'),
        location: found.location,
        lastUpdated: stateInfo?.lastUpdated ?? new Date().toISOString(),
      },
    };

    return JSON.stringify(result);
  },
});

// ============================================================================
// tasks_list - List tasks with optional filters
// ============================================================================

export const list = tool({
  description:
    'List tasks with optional filtering by state or location. Returns task IDs, states, and locations.',
  args: {
    state: tool.schema
      .string()
      .optional()
      .describe(
        'Filter by state (not_started, implemented, unit_tested, review_fail, review_pass, completed, committed, cancelled)'
      ),
    location: tool.schema
      .string()
      .optional()
      .describe('Filter by location (active, backlog, archive)'),
    limit: tool.schema.number().optional().describe('Maximum number of results (default: 20)'),
  },
  async execute(args): Promise<string> {
    const { state, location, limit = 20 } = args;
    const paths = getDefaultPaths();

    // Validate filters if provided
    if (state) {
      try {
        TaskStateSchema.parse(state);
      } catch {
        const result: ErrorResult = {
          success: false,
          error: `Invalid state filter: ${state}. Valid states: not_started, implemented, unit_tested, review_fail, review_pass, completed, committed, cancelled`,
        };
        return JSON.stringify(result);
      }
    }

    if (location) {
      try {
        TaskLocationSchema.parse(location);
      } catch {
        const result: ErrorResult = {
          success: false,
          error: `Invalid location filter: ${location}. Valid locations: active, backlog, archive`,
        };
        return JSON.stringify(result);
      }
    }

    // Get all tasks from filesystem
    const allTasks = listAllTasks(paths);
    const stateFile = readStateFile(paths.stateFilePath);

    // Build task list with state info
    let tasks = allTasks.map(({ taskId, location: loc }) => {
      const stateInfo = stateFile?.tasks[taskId];
      return {
        identifier: taskId,
        state:
          stateInfo?.state ??
          (loc === 'archive' ? ('committed' as TaskState) : ('not_started' as TaskState)),
        location: loc,
        lastUpdated: stateInfo?.lastUpdated ?? '',
        priority: undefined as string | undefined,
      };
    });

    // Apply filters
    if (state) {
      tasks = tasks.filter(t => t.state === state);
    }
    if (location) {
      tasks = tasks.filter(t => t.location === location);
    }

    // Sort by task ID (numeric order)
    tasks.sort((a, b) => {
      const numA = parseInt(a.identifier.replace(/\D/g, ''), 10);
      const numB = parseInt(b.identifier.replace(/\D/g, ''), 10);
      return numA - numB;
    });

    // Apply limit
    const limitedTasks = tasks.slice(0, limit);

    const result: TaskListResult = {
      success: true,
      tasks: limitedTasks,
      total: tasks.length,
    };

    return JSON.stringify(result);
  },
});

// ============================================================================
// tasks_setState - Update task state with validation and auto-archiving
// ============================================================================

export const setState = tool({
  description:
    'Update the state of a task. Automatically moves task between folders based on state (e.g., committed → archive/)',
  args: {
    taskId: tool.schema.string().describe('The task identifier'),
    newState: tool.schema
      .string()
      .describe(
        'The new state (not_started, implemented, unit_tested, review_fail, review_pass, completed, committed, cancelled)'
      ),
    force: tool.schema
      .boolean()
      .optional()
      .describe('Force state change even if transition is invalid (default: false)'),
  },

  async execute(args): Promise<string> {
    const { taskId, newState: newStateStr, force = false } = args;
    const paths = getDefaultPaths();

    // Validate new state
    let newState: TaskState;
    try {
      newState = TaskStateSchema.parse(newStateStr);
    } catch {
      const result: ErrorResult = {
        success: false,
        error: `Invalid state: ${newStateStr}. Valid states: not_started, implemented, unit_tested, review_fail, review_pass, completed, committed, cancelled`,
      };
      return JSON.stringify(result);
    }

    // Find the task file
    const found = findTaskFile(taskId, paths);
    if (!found) {
      const result: ErrorResult = {
        success: false,
        error: `Task not found: ${taskId}`,
      };
      return JSON.stringify(result);
    }

    // Read state file
    let stateFile = readStateFile(paths.stateFilePath);
    if (!stateFile) {
      stateFile = { $schema: './state.schema.json', version: '2.0', tasks: {} };
    }

    // Get current state
    const currentStateInfo = stateFile.tasks[taskId];
    const previousState: TaskState = currentStateInfo?.state ?? 'not_started';
    const previousLocation: TaskLocation = found.location;

    // Validate state transition
    if (!force && !isValidStateTransition(previousState, newState)) {
      const result: ErrorResult = {
        success: false,
        error: `Invalid state transition: ${previousState} → ${newState}. Use force=true to override.`,
      };
      return JSON.stringify(result);
    }

    // Determine new location based on state
    const newLocation = getLocationForState(newState);

    // Move file if location changed
    if (previousLocation !== newLocation) {
      const moved = moveTaskFile(taskId, previousLocation, newLocation, paths);
      if (!moved) {
        const result: ErrorResult = {
          success: false,
          error: `Failed to move task file from ${previousLocation}/ to ${newLocation}/`,
        };
        return JSON.stringify(result);
      }
    }

    // Update state.json
    if (newLocation === 'archive') {
      // Remove from state.json when archived (state.json only tracks active tasks)
      if (stateFile.tasks[taskId]) delete stateFile.tasks[taskId];
    } else {
      stateFile.tasks[taskId] = {
        state: newState,
        lastUpdated: new Date().toISOString(),
        location: newLocation,
        fromIssue: currentStateInfo?.fromIssue,
        blockedBy: currentStateInfo?.blockedBy,
      };
    }

    // Write state file
    const written = writeStateFile(paths.stateFilePath, stateFile);
    if (!written) {
      const result: ErrorResult = {
        success: false,
        error: 'Failed to write state.json',
      };
      return JSON.stringify(result);
    }

    const result: TaskStateChangeResult = {
      success: true,
      taskId,
      previousState,
      newState,
      previousLocation,
      newLocation,
      message:
        previousLocation !== newLocation
          ? `State changed: ${previousState} → ${newState}. Task moved: ${previousLocation}/ → ${newLocation}/`
          : `State changed: ${previousState} → ${newState}`,
    };

    return JSON.stringify(result);
  },
});

// ============================================================================
// tasks_create - Create new task from template
// ============================================================================

export const create = tool({
  description: 'Create a new task file from template. Creates the file in backlog/ directory.',
  args: {
    taskId: tool.schema.string().describe('The task identifier (e.g., "069-new-feature")'),
    priority: tool.schema
      .string()
      .optional()
      .describe('Task priority (high, medium, low). Default: medium'),
    fromIssue: tool.schema.string().optional().describe('Link to related issue number'),
    description: tool.schema.string().optional().describe('Task description'),
    constraints: tool.schema.string().optional().describe('Task constraints'),
    acceptanceCriteria: tool.schema.string().optional().describe('Acceptance criteria'),
  },
  async execute(args): Promise<string> {
    const { taskId, priority, fromIssue, description, constraints, acceptanceCriteria } = args;
    const paths = getDefaultPaths();

    // Check if task already exists
    const existing = findTaskFile(taskId, paths);
    if (existing) {
      const result: ErrorResult = {
        success: false,
        error: `Task already exists: ${taskId} in ${existing.location}/`,
      };
      return JSON.stringify(result);
    }

    // Generate task content
    const content = generateTaskContent(taskId, {
      priority: priority ?? 'medium',
      issue: fromIssue ? `[#${fromIssue}](../issues/open/${fromIssue}.md)` : 'N/A',
      description,
      constraints,
      acceptanceCriteria,
    });

    // Write task file to backlog
    const taskFilePath = path.join(paths.backlogDir, `${taskId}.md`);
    const written = writeTaskFile(taskFilePath, content);
    if (!written) {
      const result: ErrorResult = {
        success: false,
        error: `Failed to create task file: ${taskFilePath}`,
      };
      return JSON.stringify(result);
    }

    // Add to state.json
    let stateFile = readStateFile(paths.stateFilePath);
    if (!stateFile) {
      stateFile = { $schema: './state.schema.json', version: '2.0', tasks: {} };
    }

    stateFile.tasks[taskId] = {
      state: 'not_started',
      lastUpdated: new Date().toISOString(),
      location: 'backlog',
      fromIssue,
      blockedBy: [],
    };

    writeStateFile(paths.stateFilePath, stateFile);

    const result: TaskCreateResult = {
      success: true,
      taskId,
      location: 'backlog',
      message: `Created task: docs/tasks/backlog/${taskId}.md`,
    };

    return JSON.stringify(result);
  },
});

// ============================================================================
// tasks_checkArchivedState - Check for archived tasks in state.json
// ============================================================================

export const checkArchivedState = tool({
  description:
    'Check if there are any tasks with "location": "archive" in state.json. Should be called before committing to ensure state.json is clean (only tracks non-archived tasks).',
  args: {},
  async execute(): Promise<string> {
    const paths = getDefaultPaths();

    const stateFile = readStateFile(paths.stateFilePath);
    if (!stateFile) {
      const result: ErrorResult = {
        success: false,
        error: 'Could not read state.json',
      };
      return JSON.stringify(result);
    }

    const archivedTasks: string[] = [];
    for (const [taskId, taskInfo] of Object.entries(stateFile.tasks)) {
      if (taskInfo.location === 'archive') {
        archivedTasks.push(taskId);
      }
    }

    interface CheckArchivedResult {
      success: true;
      hasArchivedTasks: boolean;
      archivedTasks: string[];
      message: string;
      totalTasksInState: number;
    }

    if (archivedTasks.length === 0) {
      const cleanResult: CheckArchivedResult = {
        success: true,
        hasArchivedTasks: false,
        archivedTasks: [],
        message: 'No archived tasks found in state.json. State is clean.',
        totalTasksInState: Object.keys(stateFile.tasks).length,
      };
      return JSON.stringify(cleanResult);
    }

    const dirtyResult: CheckArchivedResult = {
      success: true,
      hasArchivedTasks: true,
      archivedTasks,
      message: `Found ${archivedTasks.length} archived task(s) in state.json that should be removed: ${archivedTasks.join(', ')}`,
      totalTasksInState: Object.keys(stateFile.tasks).length,
    };
    return JSON.stringify(dirtyResult);
  },
});
