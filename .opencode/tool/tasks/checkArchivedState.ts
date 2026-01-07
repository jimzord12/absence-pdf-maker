import { tool } from '@opencode-ai/plugin/tool';
import { getDefaultPaths, readStateFile } from '../lib/filesystem.js';
import { type ErrorResult } from '../lib/tasks.js';

/**
 * tasks_checkArchivedState - Check for archived tasks in state.json
 */
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
      if (taskInfo && taskInfo.location === 'archive') {
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
      message: `Found ${
        archivedTasks.length
      } archived task(s) in state.json that should be removed: ${archivedTasks.join(', ')}`,
      totalTasksInState: Object.keys(stateFile.tasks).length,
    };
    return JSON.stringify(dirtyResult);
  },
});
