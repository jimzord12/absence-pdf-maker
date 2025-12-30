import { z } from 'zod';

export const TaskStateSchema = z.enum([
  'not_started',
  'implemented',
  'unit_tested',
  'review_fail',
  'review_pass',
  'completed',
  'committed',
  'pending',
]);

export type TaskState = z.infer<typeof TaskStateSchema>;

export interface TaskInfo {
  identifier: string;
  description: string;
  constraints: string;
  acceptanceCriteria: string;
}

export interface TaskStateInfo {
  state: TaskState;
  lastUpdated: string;
}

export interface StateFile {
  $schema?: string;
  tasks: Record<string, TaskStateInfo>;
}

export interface NextTaskResult {
  success: true;
  nextTask: {
    identifier: string;
    description: string;
    constraints: string;
    acceptanceCriteria: string;
    currentState: TaskState;
    lastUpdated: string;
    nextSteps: string;
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
  };
}

export interface AllCompletedResult {
  success: true;
  nextTask: null;
  message: string;
  totalTasks: number;
  completedTasks: number;
}

export interface ErrorResult {
  success: false;
  error: string;
}

export type TaskResult = NextTaskResult | AllCompletedResult | ErrorResult;

export function extractTaskInfo(taskId: string, tasksContent: string): TaskInfo | null {
  const regex = new RegExp(
    '### ' +
      taskId +
      '\\n\\n\\*\\*Identifier:\\*\\* \\`' +
      taskId +
      '\\`\\n\\n\\*\\*Description:\\*\\*\\n([\\s\\S]*?)\\n\\n\\*\\*Constraints:\\*\\*\\n([\\s\\S]*?)\\n\\n\\*\\*Acceptance Criteria:\\*\\*\\n([\\s\\S]*?)(?=\\n\\n---|\\Z)',
    'm'
  );
  const match = tasksContent.match(regex);
  if (!match) return null;

  return {
    identifier: taskId,
    description: match[1].trim(),
    constraints: match[2].trim(),
    acceptanceCriteria: match[3].trim(),
  };
}

export function getNextSteps(state: TaskState): string {
  switch (state) {
    case 'not_started':
      return 'Implement the feature according to the description and constraints';
    case 'implemented':
      return 'Write unit tests for the implemented code';
    case 'unit_tested':
      return 'Request code review (may pass or fail)';
    case 'review_fail':
      return 'Fix issues identified in code review';
    case 'review_pass':
      return 'Mark task as completed';
    case 'completed':
      return 'Commit changes to version control';
    case 'committed':
      return 'Task is finished - move to next task';
    case 'pending':
      return 'Start working on this task (begin with implementation)';
    default:
      return 'Proceed with task workflow';
  }
}

export function sortTaskIds(taskIds: string[]): string[] {
  return taskIds.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    return numA - numB;
  });
}

export function findNextTask(
  sortedTaskIds: string[],
  stateFile: StateFile
): string | null {
  return sortedTaskIds.find(taskId => stateFile.tasks[taskId].state !== 'committed') ?? null;
}

export function calculateSummary(
  sortedTaskIds: string[],
  stateFile: StateFile
): { totalTasks: number; completedTasks: number; inProgressTasks: number } {
  return {
    totalTasks: sortedTaskIds.length,
    completedTasks: sortedTaskIds.filter(id => stateFile.tasks[id].state === 'committed').length,
    inProgressTasks: sortedTaskIds.filter(id => stateFile.tasks[id].state !== 'committed').length,
  };
}

export function getNextTaskResult(
  stateFile: StateFile,
  tasksContent: string
): TaskResult {
  const sortedTaskIds = sortTaskIds(Object.keys(stateFile.tasks));
  const nextTaskId = findNextTask(sortedTaskIds, stateFile);

  if (!nextTaskId) {
    return {
      success: true,
      nextTask: null,
      message: 'All tasks have been completed and committed!',
      totalTasks: sortedTaskIds.length,
      completedTasks: sortedTaskIds.length,
    };
  }

  const taskState = stateFile.tasks[nextTaskId];
  const taskInfo = extractTaskInfo(nextTaskId, tasksContent);

  if (!taskInfo) {
    return {
      success: false,
      error: `Could not extract information for task ${nextTaskId}`,
    };
  }

  return {
    success: true,
    nextTask: {
      identifier: taskInfo.identifier,
      description: taskInfo.description,
      constraints: taskInfo.constraints,
      acceptanceCriteria: taskInfo.acceptanceCriteria,
      currentState: taskState.state,
      lastUpdated: taskState.lastUpdated,
      nextSteps: getNextSteps(taskState.state),
    },
    summary: calculateSummary(sortedTaskIds, stateFile),
  };
}
