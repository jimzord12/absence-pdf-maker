/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from '@opencode-ai/plugin/tool';
import {
  getDefaultPaths,
  readFileErrorResult,
  readStateFile,
  readTasksFile,
} from './lib/filesystem.js';
import { getNextTaskResult, TaskStateSchema, type TaskResult } from './lib/tasks.js';

export default tool({
  description:
    'Get the next task that must be implemented based on task state in docs/tasks/state.json',
  args: {},
  async execute() {
    const { stateFilePath, tasksFilePath } = getDefaultPaths();

    const stateFile = readStateFile(stateFilePath);
    if (!stateFile) {
      return JSON.stringify(
        readFileErrorResult(new Error('State file not found or invalid'), 'state')
      );
    }

    const tasksContent = readTasksFile(tasksFilePath);
    if (!tasksContent) {
      return JSON.stringify(readFileErrorResult(new Error('Tasks file not found'), 'tasks'));
    }

    try {
      for (const info of Object.values(stateFile.tasks)) {
        TaskStateSchema.parse((info as any).state);
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Invalid task state found: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }

    const result: TaskResult = getNextTaskResult(stateFile, tasksContent);
    return JSON.stringify(result);
  },
});

