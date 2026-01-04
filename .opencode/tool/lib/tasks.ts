import { z } from 'zod';

// ============================================================================
// Schemas and Types
// ============================================================================

export const TaskStateSchema = z.enum([
  'not_started',
  'implemented',
  'unit_tested',
  'review_fail',
  'review_pass',
  'completed',
  'committed',
  'cancelled',
  'pending',
]);

export type TaskState = z.infer<typeof TaskStateSchema>;

export const TaskLocationSchema = z.enum(['active', 'backlog', 'archive']);
export type TaskLocation = z.infer<typeof TaskLocationSchema>;

export interface TaskStateInfo {
  state: TaskState;
  lastUpdated: string;
  location: TaskLocation;
  fromIssue?: string;
  blockedBy?: string[];
}

export interface StateFile {
  $schema?: string;
  version?: string;
  tasks: Record<string, TaskStateInfo>;
}

export interface TaskInfo {
  identifier: string;
  priority?: string;
  blocks?: string;
  blockedBy?: string;
  issue?: string;
  description: string;
  constraints: string;
  acceptanceCriteria: string;
  notes?: string;
}

// ============================================================================
// Result Types
// ============================================================================

export interface NextTaskResult {
  success: true;
  nextTask: {
    identifier: string;
    description: string;
    constraints: string;
    acceptanceCriteria: string;
    currentState: TaskState;
    location: TaskLocation;
    lastUpdated: string;
    nextSteps: string;
    priority?: string;
    blockedBy?: string;
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

export interface TaskShowResult {
  success: true;
  task: TaskInfo & {
    state: TaskState;
    location: TaskLocation;
    lastUpdated: string;
  };
}

export interface TaskListResult {
  success: true;
  tasks: {
    identifier: string;
    state: TaskState;
    location: TaskLocation;
    lastUpdated: string;
    priority?: string;
  }[];
  total: number;
}

export interface TaskCreateResult {
  success: true;
  taskId: string;
  location: TaskLocation;
  message: string;
}

export interface TaskStateChangeResult {
  success: true;
  taskId: string;
  previousState: TaskState;
  newState: TaskState;
  previousLocation: TaskLocation;
  newLocation: TaskLocation;
  message: string;
}

export interface ErrorResult {
  success: false;
  error: string;
}

export type TaskResult =
  | NextTaskResult
  | AllCompletedResult
  | TaskShowResult
  | TaskListResult
  | TaskCreateResult
  | TaskStateChangeResult
  | ErrorResult;

// ============================================================================
// Task File Parsing (Individual .md files)
// ============================================================================

/**
 * Parse a task file content to extract task information
 */
export function parseTaskFile(taskId: string, content: string): TaskInfo | null {
  try {
    const lines = content.split('\n');

    // Extract metadata from header
    let priority = 'medium';
    let blocks = 'none';
    let blockedBy = 'none';
    let issue = 'N/A';

    for (const line of lines) {
      if (line.startsWith('**Priority:**')) {
        priority = line.replace('**Priority:**', '').trim();
      } else if (line.startsWith('**Blocks:**')) {
        blocks = line.replace('**Blocks:**', '').trim();
      } else if (line.startsWith('**Blocked By:**')) {
        blockedBy = line.replace('**Blocked By:**', '').trim();
      } else if (line.startsWith('**Issue:**')) {
        issue = line.replace('**Issue:**', '').trim();
      }
    }

    // Extract sections using regex
    const descriptionMatch = content.match(
      /## Description\n\n([\s\S]*?)(?=\n## Constraints|\n## Acceptance Criteria|$)/
    );
    const constraintsMatch = content.match(
      /## Constraints\n\n([\s\S]*?)(?=\n## Acceptance Criteria|\n## Notes|$)/
    );
    const acceptanceMatch = content.match(/## Acceptance Criteria\n\n([\s\S]*?)(?=\n## Notes|$)/);
    const notesMatch = content.match(/## Notes\n\n([\s\S]*?)$/);

    return {
      identifier: taskId,
      priority,
      blocks,
      blockedBy,
      issue,
      description: descriptionMatch?.[1]?.trim() ?? 'No description available.',
      constraints: constraintsMatch?.[1]?.trim() ?? 'No constraints specified.',
      acceptanceCriteria: acceptanceMatch?.[1]?.trim() ?? 'No acceptance criteria specified.',
      notes: notesMatch?.[1]?.trim(),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Task State Management
// ============================================================================

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
    case 'cancelled':
      return 'Task has been cancelled';
    case 'pending':
      return 'Start working on this task (begin with implementation)';
    default:
      return 'Proceed with task workflow';
  }
}

/**
 * Determine the appropriate location for a given task state
 */
export function getLocationForState(state: TaskState): TaskLocation {
  switch (state) {
    case 'not_started':
    case 'pending':
      return 'backlog';
    case 'committed':
    case 'cancelled':
      return 'archive';
    default:
      return 'active';
  }
}

/**
 * Check if a state transition is valid
 */
export function isValidStateTransition(from: TaskState, to: TaskState): boolean {
  const validTransitions: Record<TaskState, TaskState[]> = {
    not_started: ['implemented', 'pending', 'cancelled'],
    pending: ['implemented', 'not_started', 'cancelled'],
    implemented: ['unit_tested', 'review_fail', 'cancelled'],
    unit_tested: ['review_pass', 'review_fail', 'cancelled'],
    review_fail: ['implemented', 'cancelled'],
    review_pass: ['completed', 'cancelled'],
    completed: ['committed', 'cancelled'],
    committed: [], // Terminal state
    cancelled: [], // Terminal state
  };

  return validTransitions[from]?.includes(to) ?? false;
}

// ============================================================================
// Task Sorting and Finding
// ============================================================================

export function sortTaskIds(taskIds: string[]): string[] {
  return taskIds.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    return numA - numB;
  });
}

export function findNextTask(sortedTaskIds: string[], stateFile: StateFile): string | null {
  // Priority order: in-progress states first, then not_started
  const priorityStates: TaskState[] = [
    'review_fail', // Needs immediate attention
    'review_pass', // Almost done
    'unit_tested', // In review
    'implemented', // Needs testing
    'not_started', // Ready to start
    'pending', // Ready to start
  ];

  for (const priorityState of priorityStates) {
    const task = sortedTaskIds.find(taskId => stateFile.tasks[taskId]?.state === priorityState);
    if (task) return task;
  }

  return null;
}

export function calculateSummary(
  sortedTaskIds: string[],
  stateFile: StateFile
): { totalTasks: number; completedTasks: number; inProgressTasks: number } {
  return {
    totalTasks: sortedTaskIds.length,
    completedTasks: sortedTaskIds.filter(
      id => stateFile.tasks[id]?.state === 'committed' || stateFile.tasks[id]?.state === 'cancelled'
    ).length,
    inProgressTasks: sortedTaskIds.filter(
      id => stateFile.tasks[id]?.state !== 'committed' && stateFile.tasks[id]?.state !== 'cancelled'
    ).length,
  };
}

// ============================================================================
// Template Generation
// ============================================================================

/**
 * Generate task file content from template
 */
export function generateTaskContent(
  taskId: string,
  options: {
    priority?: string;
    blocks?: string;
    blockedBy?: string;
    issue?: string;
    description?: string;
    constraints?: string;
    acceptanceCriteria?: string;
  } = {}
): string {
  const {
    priority = 'medium',
    blocks = 'none',
    blockedBy = 'none',
    issue = 'N/A',
    description = 'TODO: Add description',
    constraints = '- TODO: Add constraints',
    acceptanceCriteria = '- [ ] TODO: Add acceptance criteria',
  } = options;

  return `# ${taskId}

**Priority:** ${priority}
**Blocks:** ${blocks}
**Blocked By:** ${blockedBy}
**Issue:** ${issue}

---

## Description

${description}

## Constraints

${constraints}

## Acceptance Criteria

${acceptanceCriteria}

## Notes

No notes.
`;
}

