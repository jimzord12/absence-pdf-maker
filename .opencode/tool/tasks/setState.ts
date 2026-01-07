import { tool } from '@opencode-ai/plugin/tool';
import {
  findTaskFile,
  getDefaultPaths,
  moveTaskFile,
  readStateFile,
  writeStateFile,
} from '../lib/filesystem.js';
import {
  TaskStateSchema,
  getLocationForState,
  isValidStateTransition,
  type ErrorResult,
  type TaskLocation,
  type TaskState,
  type TaskStateChangeResult,
} from '../lib/tasks.js';

/**
 * tasks_setState - Update task state with validation and auto-archiving
 */
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
      stateFile.tasks[taskId] = undefined;
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
