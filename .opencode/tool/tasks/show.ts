import { tool } from '@opencode-ai/plugin/tool';
import {
  findTaskFile,
  getDefaultPaths,
  readFileErrorResult,
  readStateFile,
  readTaskFile,
} from '../lib/filesystem.js';
import { parseTaskFile, type ErrorResult, type TaskShowResult } from '../lib/tasks.js';

/**
 * tasks_show - Get task by ID
 */
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
