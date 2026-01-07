import { tool } from '@opencode-ai/plugin/tool';
import { getDefaultPaths, listAllTasks, readStateFile } from '../lib/filesystem.js';
import {
  TaskLocationSchema,
  TaskStateSchema,
  type ErrorResult,
  type TaskListResult,
  type TaskState,
} from '../lib/tasks.js';

/**
 * tasks_list - List tasks with optional filters
 */
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
