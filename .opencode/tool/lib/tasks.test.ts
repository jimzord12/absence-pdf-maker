import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  extractTaskInfo,
  getNextSteps,
  sortTaskIds,
  findNextTask,
  calculateSummary,
  getNextTaskResult,
  type TaskState,
  type StateFile,
} from './tasks.js';

describe('extractTaskInfo', () => {
  const mockTasksContent = `
### 001-task-test-task

**Identifier:** \`001-task-test-task\`

**Description:**
This is a test task description.

**Constraints:**
- Constraint 1
- Constraint 2

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

---

### 002-task-another-task

**Identifier:** \`002-task-another-task\`

**Description:**
Another task description.

**Constraints:**
- Another constraint

**Acceptance Criteria:**
- [ ] Another criterion

---

`;

  it('should extract task info correctly', () => {
    const result = extractTaskInfo('001-task-test-task', mockTasksContent);

    assert.ok(result);
    assert.strictEqual(result.identifier, '001-task-test-task');
    assert.strictEqual(result.description, 'This is a test task description.');
    assert.strictEqual(result.constraints, '- Constraint 1\n- Constraint 2');
    assert.strictEqual(result.acceptanceCriteria, '- [ ] Criterion 1\n- [ ] Criterion 2');
  });

  it('should return null for non-existent task', () => {
    const result = extractTaskInfo('999-task-nonexistent', mockTasksContent);
    assert.strictEqual(result, null);
  });
});

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
      pending: 'Start working on this task (begin with implementation)',
    };

    for (const [state, expectedStep] of Object.entries(steps)) {
      const result = getNextSteps(state as TaskState);
      assert.strictEqual(
        result,
        expectedStep,
        `Expected "${expectedStep}" for state "${state}", got "${result}"`
      );
    }
  });
});

describe('sortTaskIds', () => {
  it('should sort task IDs numerically', () => {
    const taskIds = [
      '002-task-b',
      '010-task-j',
      '001-task-a',
      '005-task-e',
    ];
    const result = sortTaskIds(taskIds);
    assert.deepStrictEqual(result, [
      '001-task-a',
      '002-task-b',
      '005-task-e',
      '010-task-j',
    ]);
  });

  it('should handle already sorted IDs', () => {
    const taskIds = ['001-task-a', '002-task-b', '003-task-c'];
    const result = sortTaskIds(taskIds);
    assert.deepStrictEqual(result, taskIds);
  });

  it('should handle empty array', () => {
    const result = sortTaskIds([]);
    assert.deepStrictEqual(result, []);
  });
});

describe('findNextTask', () => {
  const stateFile: StateFile = {
    tasks: {
      '001-task-a': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
      '002-task-b': { state: 'pending', lastUpdated: '2024-01-01T00:00:00Z' },
      '003-task-c': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
      '004-task-d': { state: 'completed', lastUpdated: '2024-01-01T00:00:00Z' },
    },
  };

  it('should find the first non-committed task', () => {
    const sortedIds = ['001-task-a', '002-task-b', '003-task-c', '004-task-d'];
    const result = findNextTask(sortedIds, stateFile);
    assert.strictEqual(result, '002-task-b');
  });

  it('should return null if all tasks are committed', () => {
    const allCommittedState: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
        '002-task-b': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
      },
    };
    const sortedIds = ['001-task-a', '002-task-b'];
    const result = findNextTask(sortedIds, allCommittedState);
    assert.strictEqual(result, null);
  });

  it('should handle empty state file', () => {
    const emptyState: StateFile = { tasks: {} };
    const sortedIds: string[] = [];
    const result = findNextTask(sortedIds, emptyState);
    assert.strictEqual(result, null);
  });
});

describe('calculateSummary', () => {
  const stateFile: StateFile = {
    tasks: {
      '001-task-a': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
      '002-task-b': { state: 'pending', lastUpdated: '2024-01-01T00:00:00Z' },
      '003-task-c': { state: 'completed', lastUpdated: '2024-01-01T00:00:00Z' },
      '004-task-d': { state: 'implemented', lastUpdated: '2024-01-01T00:00:00Z' },
    },
  };

  it('should calculate correct summary', () => {
    const sortedIds = ['001-task-a', '002-task-b', '003-task-c', '004-task-d'];
    const result = calculateSummary(sortedIds, stateFile);

    assert.strictEqual(result.totalTasks, 4);
    assert.strictEqual(result.completedTasks, 1);
    assert.strictEqual(result.inProgressTasks, 3);
  });

  it('should handle all committed', () => {
    const allCommittedState: StateFile = {
      tasks: {
        '001-task-a': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
        '002-task-b': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
      },
    };
    const result = calculateSummary(['001-task-a', '002-task-b'], allCommittedState);

    assert.strictEqual(result.totalTasks, 2);
    assert.strictEqual(result.completedTasks, 2);
    assert.strictEqual(result.inProgressTasks, 0);
  });
});

describe('getNextTaskResult', () => {
  const mockTasksContent = `
### 001-task-first

**Identifier:** \`001-task-first\`

**Description:**
First task description.

**Constraints:**
- First constraint

**Acceptance Criteria:**
- [ ] First criterion

---

### 002-task-second

**Identifier:** \`002-task-second\`

**Description:**
Second task description.

**Constraints:**
- Second constraint

**Acceptance Criteria:**
- [ ] Second criterion

---

`;

  it('should return next task result', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task-first': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
        '002-task-second': { state: 'pending', lastUpdated: '2024-01-01T00:00:00Z' },
      },
    };

    const result = getNextTaskResult(stateFile, mockTasksContent);

    assert.strictEqual(result.success, true);
    if (result.success && result.nextTask) {
      assert.strictEqual(result.nextTask.identifier, '002-task-second');
      assert.strictEqual(result.nextTask.description, 'Second task description.');
      assert.strictEqual(result.nextTask.currentState, 'pending');
      assert.strictEqual(result.nextTask.nextSteps, 'Start working on this task (begin with implementation)');
      assert.strictEqual(result.summary.totalTasks, 2);
      assert.strictEqual(result.summary.completedTasks, 1);
      assert.strictEqual(result.summary.inProgressTasks, 1);
    }
  });

  it('should return all completed result', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task-first': { state: 'committed', lastUpdated: '2024-01-01T00:00:00Z' },
      },
    };

    const result = getNextTaskResult(stateFile, mockTasksContent);

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.nextTask, null);
      assert.strictEqual(result.message, 'All tasks have been completed and committed!');
      assert.strictEqual(result.totalTasks, 1);
      assert.strictEqual(result.completedTasks, 1);
    }
  });

  it('should return error result for missing task info', () => {
    const stateFile: StateFile = {
      tasks: {
        '999-task-missing': { state: 'pending', lastUpdated: '2024-01-01T00:00:00Z' },
      },
    };

    const result = getNextTaskResult(stateFile, mockTasksContent);

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.includes('Could not extract information for task'));
    }
  });
});
