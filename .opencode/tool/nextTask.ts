/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from '@opencode-ai/plugin/tool';
import {
  findTaskFile,
  getDefaultPaths,
  listAllTasks,
  readFileErrorResult,
  readStateFile,
  readTaskFile,
} from './lib/filesystem.js';
import {
  TaskStateSchema,
  calculateSummary,
  findNextTask,
  getNextSteps,
  parseTaskFile,
  sortTaskIds,
  type TaskLocation,
  type TaskResult,
} from './lib/tasks.js';

export default tool({
  description:
    'Get the next task that must be implemented based on task state in docs/tasks/state.json. Tasks are stored as individual files in docs/tasks/{active,backlog,archive}/',
  args: {},
  async execute() {
    const paths = getDefaultPaths();

    // Read state file
    const stateFile = readStateFile(paths.stateFilePath);
    if (!stateFile) {
      return JSON.stringify(
        readFileErrorResult(new Error('State file not found or invalid'), 'state')
      );
    }

    // Validate task states
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

    // Get all task IDs from state file (only non-archived tasks are in state.json)
    const sortedTaskIds = sortTaskIds(Object.keys(stateFile.tasks));
    const nextTaskId = findNextTask(sortedTaskIds, stateFile);

    if (!nextTaskId) {
      // Check if there are tasks in backlog that aren't in state.json
      const allTasks = listAllTasks(paths);
      const backlogTasks = allTasks.filter(t => t.location === 'backlog');

      if (backlogTasks.length > 0) {
        // Pick first backlog task not in state.json
        const newTask = backlogTasks.find(t => !stateFile.tasks[t.taskId]);
        if (newTask) {
          const found = findTaskFile(newTask.taskId, paths);
          if (found) {
            const content = readTaskFile(found.filePath);
            if (content) {
              const taskInfo = parseTaskFile(newTask.taskId, content);
              if (taskInfo) {
                return JSON.stringify({
                  success: true,
                  nextTask: {
                    identifier: newTask.taskId,
                    description: taskInfo.description,
                    constraints: taskInfo.constraints,
                    acceptanceCriteria: taskInfo.acceptanceCriteria,
                    currentState: 'not_started',
                    location: 'backlog' as TaskLocation,
                    lastUpdated: new Date().toISOString(),
                    nextSteps: getNextSteps('not_started'),
                    priority: taskInfo.priority,
                    blockedBy: taskInfo.blockedBy,
                  },
                  summary: {
                    totalTasks: allTasks.length,
                    completedTasks: allTasks.filter(t => t.location === 'archive').length,
                    inProgressTasks: allTasks.filter(t => t.location !== 'archive').length,
                  },
                });
              }
            }
          }
        }
      }

      return JSON.stringify({
        success: true,
        nextTask: null,
        message: 'All tasks have been completed and committed!',
        totalTasks: sortedTaskIds.length,
        completedTasks: sortedTaskIds.length,
      });
    }

    // Find and read the task file
    const taskState = stateFile.tasks[nextTaskId];
    const found = findTaskFile(nextTaskId, paths);

    if (!found) {
      return JSON.stringify({
        success: false,
        error: `Task file not found for ${nextTaskId}. Expected in docs/tasks/${taskState.location}/${nextTaskId}.md`,
      });
    }

    const taskContent = readTaskFile(found.filePath);
    if (!taskContent) {
      return JSON.stringify(
        readFileErrorResult(new Error(`Could not read task file: ${found.filePath}`), 'task')
      );
    }

    const taskInfo = parseTaskFile(nextTaskId, taskContent);
    if (!taskInfo) {
      return JSON.stringify({
        success: false,
        error: `Could not parse task file for ${nextTaskId}`,
      });
    }

    const result: TaskResult = {
      success: true,
      nextTask: {
        identifier: taskInfo.identifier,
        description: taskInfo.description,
        constraints: taskInfo.constraints,
        acceptanceCriteria: taskInfo.acceptanceCriteria,
        currentState: taskState.state,
        location: taskState.location,
        lastUpdated: taskState.lastUpdated,
        nextSteps: getNextSteps(taskState.state),
        priority: taskInfo.priority,
        blockedBy: taskInfo.blockedBy,
      },
      summary: calculateSummary(sortedTaskIds, stateFile),
    };

    return JSON.stringify(result);
  },
});

