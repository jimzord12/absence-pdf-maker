import { describe, expect, it } from 'bun:test';
import {
  calculateSummary,
  findNextTask,
  generateTaskContent,
  getLocationForState,
  getNextSteps,
  isValidStateTransition,
  parseTaskFile,
  sortTaskIds,
  type StateFile,
  type TaskState,
} from './tasks.js';

// ============================================================================
// parseTaskFile Tests (New individual file format)
// ============================================================================

describe('parseTaskFile', () => {
  const mockTaskContent = `# 065-toastify-notifications

**Priority:** high
**Blocks:** 066-import-export
**Blocked By:** none
**Issue:** [#015](../issues/open/015.md)

---

## Description

Implement toast notifications using react-toastify for user feedback.

## Constraints

- Use react-toastify library
- Toast positioning: top-right

## Acceptance Criteria

- [ ] Toast notifications appear for successful form save
- [ ] Toast notifications appear for import success/failure

## Notes

Related to Issue #015
`;

  it('should parse task file correctly', () => {
    const result = parseTaskFile('065-toastify-notifications', mockTaskContent);

    expect(result).toBeTruthy();
    expect(result?.identifier).toBe('065-toastify-notifications');
    expect(result?.priority).toBe('high');
    expect(result?.blocks).toBe('066-import-export');
    expect(result?.blockedBy).toBe('none');
    expect(result?.description).toContain('toast notifications');
    expect(result?.constraints).toContain('react-toastify');
    expect(result?.acceptanceCriteria).toContain('Toast notifications appear');
    expect(result?.notes).toContain('Issue #015');
  });

  it('should handle minimal task file', () => {
    const minimalContent = `# 001-minimal

**Priority:** low
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Minimal description.

## Constraints

No constraints.

## Acceptance Criteria

- [ ] Done

## Notes

No notes.
`;
    const result = parseTaskFile('001-minimal', minimalContent);

    expect(result).toBeTruthy();
    expect(result?.identifier).toBe('001-minimal');
    expect(result?.priority).toBe('low');
  });
});

// ============================================================================
// getLocationForState Tests
// ============================================================================

describe('getLocationForState', () => {
  it('should return backlog for not_started', () => {
    expect(getLocationForState('not_started')).toBe('backlog');
  });

  it('should return backlog for pending', () => {
    expect(getLocationForState('pending')).toBe('backlog');
  });

  it('should return active for in-progress states', () => {
    expect(getLocationForState('implemented')).toBe('active');
    expect(getLocationForState('unit_tested')).toBe('active');
    expect(getLocationForState('review_fail')).toBe('active');
    expect(getLocationForState('review_pass')).toBe('active');
    expect(getLocationForState('completed')).toBe('active');
  });

  it('should return archive for terminal states', () => {
    expect(getLocationForState('committed')).toBe('archive');
    expect(getLocationForState('cancelled')).toBe('archive');
  });
});

// ============================================================================
// isValidStateTransition Tests
// ============================================================================

describe('isValidStateTransition', () => {
  it('should allow not_started → implemented', () => {
    expect(isValidStateTransition('not_started', 'implemented')).toBe(true);
  });

  it('should allow implemented → unit_tested', () => {
    expect(isValidStateTransition('implemented', 'unit_tested')).toBe(true);
  });

  it('should allow any state → cancelled', () => {
    expect(isValidStateTransition('not_started', 'cancelled')).toBe(true);
    expect(isValidStateTransition('implemented', 'cancelled')).toBe(true);
    expect(isValidStateTransition('completed', 'cancelled')).toBe(true);
  });

  it('should not allow backwards transitions', () => {
    expect(isValidStateTransition('unit_tested', 'implemented')).toBe(false);
    expect(isValidStateTransition('completed', 'not_started')).toBe(false);
  });

  it('should not allow transitions from terminal states', () => {
    expect(isValidStateTransition('committed', 'not_started')).toBe(false);
    expect(isValidStateTransition('cancelled', 'not_started')).toBe(false);
  });
});

// ============================================================================
// generateTaskContent Tests
// ============================================================================

describe('generateTaskContent', () => {
  it('should generate task content with defaults', () => {
    const content = generateTaskContent('069-new-task');

    expect(content).toContain('# 069-new-task');
    expect(content).toContain('**Priority:** medium');
    expect(content).toContain('## Description');
    expect(content).toContain('## Constraints');
    expect(content).toContain('## Acceptance Criteria');
  });

  it('should generate task content with custom options', () => {
    const content = generateTaskContent('070-custom', {
      priority: 'high',
      issue: '[#020](../issues/open/020.md)',
      description: 'Custom description',
    });

    expect(content).toContain('**Priority:** high');
    expect(content).toContain('Custom description');
  });
});

// ============================================================================
// getNextSteps Tests
// ============================================================================

describe('getNextSteps', () => {
  it('should return correct step for each state', () => {
    const steps: Record<TaskState, string> = {
      not_started: 'Implement the feature according to the description and constraints',
      implemented: 'Write unit tests for the implemented code',
      unit_tested: 'Request code review (may pass or fail)',
      review_fail: 'Fix issues identified in code review',
      review_pass: 'Mark task as completed',
      completed: 'Commit changes to version control',
      committed: 'Task is finished - move to next task',
      cancelled: 'Task has been cancelled',
      pending: 'Start working on this task (begin with implementation)',
    };

    for (const [state, expectedStep] of Object.entries(steps)) {
      const result = getNextSteps(state as TaskState);
      expect(result).toBe(expectedStep);
    }
  });
});

// ============================================================================
// sortTaskIds Tests
// ============================================================================

describe('sortTaskIds', () => {
  it('should sort task IDs numerically', () => {
    const taskIds = ['002-task-b', '010-task-j', '001-task-a', '005-task-e'];
    const result = sortTaskIds(taskIds);
    expect(result).toEqual(['001-task-a', '002-task-b', '005-task-e', '010-task-j']);
  });

  it('should handle already sorted IDs', () => {
    const taskIds = ['001-task-a', '002-task-b', '003-task-c'];
    const result = sortTaskIds(taskIds);
    expect(result).toEqual(taskIds);
  });

  it('should handle empty array', () => {
    const result = sortTaskIds([]);
    expect(result).toEqual([]);
  });
});

// ============================================================================
// findNextTask Tests
// ============================================================================

describe('findNextTask', () => {
  it('should find task with review_fail first (highest priority)', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
        '002-task-b': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
        '003-task-c': { state: 'review_fail', lastUpdated: '2024-01-01', location: 'active' },
      },
    };
    const sortedIds = ['001-task-a', '002-task-b', '003-task-c'];
    const result = findNextTask(sortedIds, stateFile);
    expect(result).toBe('003-task-c');
  });

  it('should find not_started task if no in-progress tasks', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
        '002-task-b': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
      },
    };
    const sortedIds = ['001-task-a', '002-task-b'];
    const result = findNextTask(sortedIds, stateFile);
    expect(result).toBe('002-task-b');
  });

  it('should return null if all tasks are committed or cancelled', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
        '002-task-b': { state: 'cancelled', lastUpdated: '2024-01-01', location: 'archive' },
      },
    };
    const sortedIds = ['001-task-a', '002-task-b'];
    const result = findNextTask(sortedIds, stateFile);
    expect(result).toBeNull();
  });

  it('should handle empty state file', () => {
    const emptyState: StateFile = { tasks: {} };
    const sortedIds: string[] = [];
    const result = findNextTask(sortedIds, emptyState);
    expect(result).toBeNull();
  });
});

// ============================================================================
// calculateSummary Tests
// ============================================================================

describe('calculateSummary', () => {
  it('should calculate correct summary', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
        '002-task-b': { state: 'pending', lastUpdated: '2024-01-01', location: 'backlog' },
        '003-task-c': { state: 'cancelled', lastUpdated: '2024-01-01', location: 'archive' },
        '004-task-d': { state: 'implemented', lastUpdated: '2024-01-01', location: 'active' },
      },
    };
    const sortedIds = ['001-task-a', '002-task-b', '003-task-c', '004-task-d'];
    const result = calculateSummary(sortedIds, stateFile);

    expect(result.totalTasks).toBe(4);
    expect(result.completedTasks).toBe(2); // committed + cancelled
    expect(result.inProgressTasks).toBe(2);
  });

  it('should handle all committed', () => {
    const allCommittedState: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
        '002-task-b': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
      },
    };
    const result = calculateSummary(['001-task-a', '002-task-b'], allCommittedState);

    expect(result.totalTasks).toBe(2);
    expect(result.completedTasks).toBe(2);
    expect(result.inProgressTasks).toBe(0);
  });
});

