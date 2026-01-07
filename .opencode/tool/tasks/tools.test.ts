import { describe, expect, it } from 'bun:test';
import {
  findTaskFile,
  getDefaultPaths,
  getLocationDir,
  listTaskFiles,
  readFileErrorResult,
  readStateFile,
  type TaskPaths,
} from '../lib/filesystem.js';
import {
  calculateSummary,
  findNextTask,
  generateTaskContent,
  getLocationForState,
  getNextSteps,
  isValidStateTransition,
  parseTaskFile,
  sortTaskIds,
  TaskLocationSchema,
  TaskStateSchema,
  type ErrorResult,
  type StateFile,
  type TaskLocation,
} from '../lib/tasks.js';

// ============================================================================
// next.ts Tests
// ============================================================================

describe('next tool', () => {
  describe('findNextTask logic', () => {
    it('should prioritize review_fail tasks', () => {
      const stateFile: StateFile = {
        tasks: {
          '001-task': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
          '002-task': { state: 'review_fail', lastUpdated: '2024-01-01', location: 'active' },
          '003-task': { state: 'implemented', lastUpdated: '2024-01-01', location: 'active' },
        },
      };
      const sortedIds = ['001-task', '002-task', '003-task'];

      const result = findNextTask(sortedIds, stateFile);
      expect(result).toBe('002-task');
    });

    it('should prioritize in-progress tasks over not_started', () => {
      const stateFile: StateFile = {
        tasks: {
          '001-task': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
          '002-task': { state: 'implemented', lastUpdated: '2024-01-01', location: 'active' },
        },
      };
      const sortedIds = ['001-task', '002-task'];

      const result = findNextTask(sortedIds, stateFile);
      expect(result).toBe('002-task');
    });

    it('should return not_started if no in-progress tasks exist', () => {
      const stateFile: StateFile = {
        tasks: {
          '001-task': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
          '002-task': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
        },
      };
      const sortedIds = ['001-task', '002-task'];

      const result = findNextTask(sortedIds, stateFile);
      expect(result).toBe('002-task');
    });

    it('should return null if all tasks are terminal', () => {
      const stateFile: StateFile = {
        tasks: {
          '001-task': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
          '002-task': { state: 'cancelled', lastUpdated: '2024-01-01', location: 'archive' },
        },
      };
      const sortedIds = ['001-task', '002-task'];

      const result = findNextTask(sortedIds, stateFile);
      expect(result).toBeNull();
    });

    it('should handle pending state as actionable', () => {
      const stateFile: StateFile = {
        tasks: {
          '001-task': { state: 'pending', lastUpdated: '2024-01-01', location: 'backlog' },
        },
      };
      const sortedIds = ['001-task'];

      const result = findNextTask(sortedIds, stateFile);
      expect(result).toBe('001-task');
    });
  });
});

// ============================================================================
// show.ts Tests
// ============================================================================

describe('show tool', () => {
  describe('task parsing', () => {
    it('should parse task file with all sections', () => {
      const content = `# 065-toastify-notifications

**Priority:** high
**Blocks:** 066-import-export
**Blocked By:** 064-form-validation
**Issue:** [#015](../issues/open/015.md)

---

## Description

Implement toast notifications using react-toastify for user feedback.

## Constraints

- Use react-toastify library
- Toast positioning: top-right
- Auto-dismiss after 5 seconds

## Acceptance Criteria

- [ ] Toast notifications appear for successful form save
- [ ] Toast notifications appear for import success/failure
- [ ] Toasts are styled to match the app theme

## Notes

Related to Issue #015. May need coordination with #064.
`;

      const result = parseTaskFile('065-toastify-notifications', content);

      expect(result).toBeTruthy();
      expect(result?.identifier).toBe('065-toastify-notifications');
      expect(result?.priority).toBe('high');
      expect(result?.blocks).toBe('066-import-export');
      expect(result?.blockedBy).toBe('064-form-validation');
      expect(result?.description).toContain('toast notifications');
      expect(result?.constraints).toContain('react-toastify');
      expect(result?.constraints).toContain('5 seconds');
      expect(result?.acceptanceCriteria).toContain('styled to match');
      expect(result?.notes).toContain('#064');
    });

    it('should handle missing optional sections gracefully', () => {
      const minimalContent = `# 001-minimal-task

**Priority:** low
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Minimal task.

## Constraints

## Acceptance Criteria

- [ ] Done
`;

      const result = parseTaskFile('001-minimal-task', minimalContent);

      expect(result).toBeTruthy();
      expect(result?.identifier).toBe('001-minimal-task');
      expect(result?.priority).toBe('low');
      expect(result?.description).toContain('Minimal task');
    });
  });
});

// ============================================================================
// list.ts Tests
// ============================================================================

describe('list tool', () => {
  describe('state validation', () => {
    it('should accept valid state filters', () => {
      const validStates = [
        'not_started',
        'implemented',
        'unit_tested',
        'review_fail',
        'review_pass',
        'completed',
        'committed',
        'cancelled',
        'pending',
      ];

      for (const state of validStates) {
        expect(() => TaskStateSchema.parse(state)).not.toThrow();
      }
    });

    it('should reject invalid state filters', () => {
      expect(() => TaskStateSchema.parse('invalid')).toThrow();
      expect(() => TaskStateSchema.parse('in_progress')).toThrow();
      expect(() => TaskStateSchema.parse('')).toThrow();
    });
  });

  describe('location validation', () => {
    it('should accept valid location filters', () => {
      expect(() => TaskLocationSchema.parse('active')).not.toThrow();
      expect(() => TaskLocationSchema.parse('backlog')).not.toThrow();
      expect(() => TaskLocationSchema.parse('archive')).not.toThrow();
    });

    it('should reject invalid location filters', () => {
      expect(() => TaskLocationSchema.parse('invalid')).toThrow();
      expect(() => TaskLocationSchema.parse('done')).toThrow();
    });
  });
});

// ============================================================================
// create.ts Tests
// ============================================================================

describe('create tool', () => {
  describe('task content generation', () => {
    it('should generate task with default values', () => {
      const content = generateTaskContent('069-new-feature');

      expect(content).toContain('# 069-new-feature');
      expect(content).toContain('**Priority:** medium');
      expect(content).toContain('**Blocks:** none');
      expect(content).toContain('**Blocked By:** none');
      expect(content).toContain('## Description');
      expect(content).toContain('## Constraints');
      expect(content).toContain('## Acceptance Criteria');
      expect(content).toContain('## Notes');
    });

    it('should generate task with custom priority', () => {
      const content = generateTaskContent('070-urgent-fix', { priority: 'high' });

      expect(content).toContain('**Priority:** high');
    });

    it('should generate task with issue link', () => {
      const content = generateTaskContent('071-from-issue', {
        issue: '[#020](../issues/open/020.md)',
      });

      expect(content).toContain('**Issue:** [#020]');
    });

    it('should generate task with custom description', () => {
      const content = generateTaskContent('072-custom', {
        description: 'Custom description for this task.',
      });

      expect(content).toContain('Custom description for this task.');
    });

    it('should generate task with custom constraints', () => {
      const content = generateTaskContent('073-constrained', {
        constraints: '- Must use TypeScript\n- No external deps',
      });

      expect(content).toContain('Must use TypeScript');
      expect(content).toContain('No external deps');
    });

    it('should generate task with custom acceptance criteria', () => {
      const content = generateTaskContent('074-criteria', {
        acceptanceCriteria: '- [ ] Tests pass\n- [ ] No lint errors',
      });

      expect(content).toContain('Tests pass');
      expect(content).toContain('No lint errors');
    });
  });
});

// ============================================================================
// setState.ts Tests
// ============================================================================

describe('setState tool', () => {
  describe('state transition validation', () => {
    it('should allow forward transitions', () => {
      // Standard workflow
      expect(isValidStateTransition('not_started', 'implemented')).toBe(true);
      expect(isValidStateTransition('implemented', 'unit_tested')).toBe(true);
      expect(isValidStateTransition('unit_tested', 'review_pass')).toBe(true);
      expect(isValidStateTransition('review_pass', 'completed')).toBe(true);
      expect(isValidStateTransition('completed', 'committed')).toBe(true);
    });

    it('should allow review_fail transitions', () => {
      expect(isValidStateTransition('unit_tested', 'review_fail')).toBe(true);
      expect(isValidStateTransition('review_fail', 'implemented')).toBe(true);
    });

    it('should allow cancellation from any non-terminal state', () => {
      expect(isValidStateTransition('not_started', 'cancelled')).toBe(true);
      expect(isValidStateTransition('implemented', 'cancelled')).toBe(true);
      expect(isValidStateTransition('unit_tested', 'cancelled')).toBe(true);
      expect(isValidStateTransition('review_fail', 'cancelled')).toBe(true);
      expect(isValidStateTransition('review_pass', 'cancelled')).toBe(true);
      expect(isValidStateTransition('completed', 'cancelled')).toBe(true);
    });

    it('should not allow backward transitions', () => {
      expect(isValidStateTransition('unit_tested', 'implemented')).toBe(false);
      expect(isValidStateTransition('completed', 'unit_tested')).toBe(false);
      expect(isValidStateTransition('review_pass', 'implemented')).toBe(false);
    });

    it('should not allow transitions from terminal states', () => {
      expect(isValidStateTransition('committed', 'not_started')).toBe(false);
      expect(isValidStateTransition('committed', 'implemented')).toBe(false);
      expect(isValidStateTransition('cancelled', 'not_started')).toBe(false);
      expect(isValidStateTransition('cancelled', 'implemented')).toBe(false);
    });

    it('should handle pending state transitions', () => {
      expect(isValidStateTransition('pending', 'implemented')).toBe(true);
      expect(isValidStateTransition('pending', 'not_started')).toBe(true);
      expect(isValidStateTransition('not_started', 'pending')).toBe(true);
    });
  });

  describe('location mapping', () => {
    it('should map states to correct locations', () => {
      // Backlog states
      expect(getLocationForState('not_started')).toBe('backlog');
      expect(getLocationForState('pending')).toBe('backlog');

      // Active states
      expect(getLocationForState('implemented')).toBe('active');
      expect(getLocationForState('unit_tested')).toBe('active');
      expect(getLocationForState('review_fail')).toBe('active');
      expect(getLocationForState('review_pass')).toBe('active');
      expect(getLocationForState('completed')).toBe('active');

      // Archive states
      expect(getLocationForState('committed')).toBe('archive');
      expect(getLocationForState('cancelled')).toBe('archive');
    });
  });
});

// ============================================================================
// checkArchivedState.ts Tests
// ============================================================================

describe('checkArchivedState tool', () => {
  it('should detect archived tasks in state.json', () => {
    const stateWithArchived = {
      $schema: './state.schema.json',
      version: '2.0',
      tasks: {
        '001-task': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
        '002-archived': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
      },
    };

    const archivedTasks: string[] = [];
    for (const [taskId, taskInfo] of Object.entries(stateWithArchived.tasks)) {
      if (taskInfo && taskInfo.location === 'archive') {
        archivedTasks.push(taskId);
      }
    }

    expect(archivedTasks).toEqual(['002-archived']);
  });

  it('should return empty array when no archived tasks', () => {
    const cleanState = {
      $schema: './state.schema.json',
      version: '2.0',
      tasks: {
        '001-task': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
        '002-task': { state: 'implemented', lastUpdated: '2024-01-01', location: 'active' },
      },
    };

    const archivedTasks: string[] = [];
    for (const [taskId, taskInfo] of Object.entries(cleanState.tasks)) {
      if (taskInfo && taskInfo.location === 'archive') {
        archivedTasks.push(taskId);
      }
    }

    expect(archivedTasks).toEqual([]);
  });
});

// ============================================================================
// insert.ts Tests
// ============================================================================

describe('insert tool', () => {
  describe('task ID parsing', () => {
    it('should parse valid task IDs', () => {
      const parseTaskId = (taskId: string): { prefix: string; suffix: string } | null => {
        const match = taskId.match(/^(\d+)-(.+)$/);
        if (!match) return null;
        return { prefix: match[1], suffix: match[2] };
      };

      expect(parseTaskId('001-test-task')).toEqual({ prefix: '001', suffix: 'test-task' });
      expect(parseTaskId('123-feature')).toEqual({ prefix: '123', suffix: 'feature' });
      expect(parseTaskId('0001-padded')).toEqual({ prefix: '0001', suffix: 'padded' });
    });

    it('should return null for invalid task IDs', () => {
      const parseTaskId = (taskId: string): { prefix: string; suffix: string } | null => {
        const match = taskId.match(/^(\d+)-(.+)$/);
        if (!match) return null;
        return { prefix: match[1], suffix: match[2] };
      };

      expect(parseTaskId('invalid')).toBeNull();
      expect(parseTaskId('no-number')).toBeNull();
      expect(parseTaskId('123')).toBeNull();
      expect(parseTaskId('')).toBeNull();
    });
  });

  describe('task ID incrementing', () => {
    it('should increment task IDs correctly', () => {
      const incrementTaskId = (taskId: string): string | null => {
        const match = taskId.match(/^(\d+)-(.+)$/);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        const newPrefix = String(num + 1).padStart(match[1].length, '0');
        return `${newPrefix}-${match[2]}`;
      };

      expect(incrementTaskId('001-test')).toBe('002-test');
      expect(incrementTaskId('009-feature')).toBe('010-feature');
      expect(incrementTaskId('099-task')).toBe('100-task');
      expect(incrementTaskId('0001-padded')).toBe('0002-padded');
    });

    it('should preserve suffix when incrementing', () => {
      const incrementTaskId = (taskId: string): string | null => {
        const match = taskId.match(/^(\d+)-(.+)$/);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        const newPrefix = String(num + 1).padStart(match[1].length, '0');
        return `${newPrefix}-${match[2]}`;
      };

      expect(incrementTaskId('005-complex-task-name')).toBe('006-complex-task-name');
    });
  });

  describe('task number creation', () => {
    it('should create task IDs with specific numbers', () => {
      const createTaskIdWithNumber = (num: number, suffix: string, padLength = 3): string => {
        const prefix = String(num).padStart(padLength, '0');
        return `${prefix}-${suffix}`;
      };

      expect(createTaskIdWithNumber(4, 'new-feature')).toBe('004-new-feature');
      expect(createTaskIdWithNumber(10, 'task')).toBe('010-task');
      expect(createTaskIdWithNumber(100, 'task')).toBe('100-task');
      expect(createTaskIdWithNumber(4, 'task', 4)).toBe('0004-task');
    });
  });
});

// ============================================================================
// Filesystem Helper Tests
// ============================================================================

describe('filesystem helpers', () => {
  describe('getDefaultPaths', () => {
    it('should construct correct paths from cwd', () => {
      const paths = getDefaultPaths('/project');

      expect(paths.stateFilePath).toBe('/project/docs/tasks/state.json');
      expect(paths.templateFilePath).toBe('/project/docs/templates/TASK-TEMPLATE.md');
      expect(paths.activeDir).toBe('/project/docs/tasks/active');
      expect(paths.backlogDir).toBe('/project/docs/tasks/backlog');
      expect(paths.archiveDir).toBe('/project/docs/tasks/archive');
    });
  });

  describe('getLocationDir', () => {
    it('should return correct directory for location', () => {
      const paths: TaskPaths = {
        stateFilePath: '/test/state.json',
        templateFilePath: '/test/template.md',
        activeDir: '/test/active',
        backlogDir: '/test/backlog',
        archiveDir: '/test/archive',
      };

      expect(getLocationDir(paths, 'active')).toBe('/test/active');
      expect(getLocationDir(paths, 'backlog')).toBe('/test/backlog');
      expect(getLocationDir(paths, 'archive')).toBe('/test/archive');
    });

    it('should throw for invalid location', () => {
      const paths: TaskPaths = {
        stateFilePath: '/test/state.json',
        templateFilePath: '/test/template.md',
        activeDir: '/test/active',
        backlogDir: '/test/backlog',
        archiveDir: '/test/archive',
      };

      expect(() => getLocationDir(paths, 'invalid' as TaskLocation)).toThrow();
    });
  });
});

// ============================================================================
// Integration-style Tests (with mocked FS)
// ============================================================================

describe('tool integration', () => {
  describe('state file operations', () => {
    it('should read and parse state file correctly', () => {
      const mockStateContent = JSON.stringify({
        $schema: './state.schema.json',
        version: '2.0',
        tasks: {
          '001-test': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
        },
      });

      const result = readStateFile('/fake/path', {
        readFileSync: (() => mockStateContent) as ReturnType<typeof Object>,
      });

      expect(result).not.toBeNull();
      expect(result?.tasks['001-test']?.state).toBe('not_started');
    });

    it('should handle malformed JSON gracefully', () => {
      const result = readStateFile('/fake/path', {
        readFileSync: (() => 'not valid json') as ReturnType<typeof Object>,
      });

      expect(result).toBeNull();
    });
  });

  describe('task file operations', () => {
    it('should list task files filtering by .md extension', () => {
      const result = listTaskFiles('/fake/dir', {
        existsSync: (() => true) as ReturnType<typeof Object>,
        readdirSync: (() => [
          '001-task.md',
          '002-task.md',
          'readme.txt',
          'config.json',
        ]) as ReturnType<typeof Object>,
      });

      expect(result).toEqual(['001-task', '002-task']);
    });

    it('should return empty array for non-existent directory', () => {
      const result = listTaskFiles('/fake/dir', {
        existsSync: (() => false) as ReturnType<typeof Object>,
      });

      expect(result).toEqual([]);
    });
  });

  describe('task file finding', () => {
    it('should search in correct order: active, backlog, archive', () => {
      const paths: TaskPaths = {
        stateFilePath: '/test/state.json',
        templateFilePath: '/test/template.md',
        activeDir: '/test/active',
        backlogDir: '/test/backlog',
        archiveDir: '/test/archive',
      };

      const searchOrder: string[] = [];

      findTaskFile('001-task', paths, {
        existsSync: ((p: string) => {
          searchOrder.push(p);
          return false;
        }) as ReturnType<typeof Object>,
      });

      expect(searchOrder[0]).toBe('/test/active/001-task.md');
      expect(searchOrder[1]).toBe('/test/backlog/001-task.md');
      expect(searchOrder[2]).toBe('/test/archive/001-task.md');
    });
  });
});

// ============================================================================
// Next Steps Helper Tests
// ============================================================================

describe('getNextSteps', () => {
  it('should return correct next step for each state', () => {
    expect(getNextSteps('not_started')).toBe(
      'Implement the feature according to the description and constraints'
    );
    expect(getNextSteps('implemented')).toBe('Write unit tests for the implemented code');
    expect(getNextSteps('unit_tested')).toBe('Request code review (may pass or fail)');
    expect(getNextSteps('review_fail')).toBe('Fix issues identified in code review');
    expect(getNextSteps('review_pass')).toBe('Mark task as completed');
    expect(getNextSteps('completed')).toBe('Commit changes to version control');
    expect(getNextSteps('committed')).toBe('Task is finished - move to next task');
    expect(getNextSteps('cancelled')).toBe('Task has been cancelled');
    expect(getNextSteps('pending')).toBe('Start working on this task (begin with implementation)');
  });
});

// ============================================================================
// Summary Calculation Tests
// ============================================================================

describe('calculateSummary', () => {
  it('should count tasks correctly', () => {
    const stateFile: StateFile = {
      tasks: {
        '001-task': { state: 'committed', lastUpdated: '2024-01-01', location: 'archive' },
        '002-task': { state: 'not_started', lastUpdated: '2024-01-01', location: 'backlog' },
        '003-task': { state: 'implemented', lastUpdated: '2024-01-01', location: 'active' },
        '004-task': { state: 'cancelled', lastUpdated: '2024-01-01', location: 'archive' },
      },
    };
    const sortedIds = ['001-task', '002-task', '003-task', '004-task'];

    const result = calculateSummary(sortedIds, stateFile);

    expect(result.totalTasks).toBe(4);
    expect(result.completedTasks).toBe(2); // committed + cancelled
    expect(result.inProgressTasks).toBe(2); // not_started + implemented
  });

  it('should handle empty task list', () => {
    const stateFile: StateFile = { tasks: {} };

    const result = calculateSummary([], stateFile);

    expect(result.totalTasks).toBe(0);
    expect(result.completedTasks).toBe(0);
    expect(result.inProgressTasks).toBe(0);
  });
});

// ============================================================================
// Sort Task IDs Tests
// ============================================================================

describe('sortTaskIds', () => {
  it('should sort by numeric prefix', () => {
    const unsorted = ['010-task', '002-task', '001-task', '100-task'];
    const result = sortTaskIds(unsorted);

    expect(result).toEqual(['001-task', '002-task', '010-task', '100-task']);
  });

  it('should handle single-element array', () => {
    const result = sortTaskIds(['001-only']);
    expect(result).toEqual(['001-only']);
  });

  it('should preserve order for same-numbered tasks', () => {
    const result = sortTaskIds(['001-first', '001-second']);
    // Same numbers should maintain relative order (stable sort)
    expect(result.length).toBe(2);
    expect(result).toContain('001-first');
    expect(result).toContain('001-second');
  });
});

// ============================================================================
// Error Result Tests
// ============================================================================

describe('readFileErrorResult', () => {
  it('should create proper error result for state file', () => {
    const result = readFileErrorResult(new Error('Not found'), 'state') as ErrorResult;

    expect(result.success).toBe(false);
    expect(result.error).toContain('state file');
    expect(result.error).toContain('Not found');
  });

  it('should create proper error result for task file', () => {
    const result = readFileErrorResult(new Error('Permission denied'), 'task') as ErrorResult;

    expect(result.success).toBe(false);
    expect(result.error).toContain('task file');
    expect(result.error).toContain('Permission denied');
  });

  it('should handle non-Error objects', () => {
    const result = readFileErrorResult('String error', 'state') as ErrorResult;

    expect(result.success).toBe(false);
    expect(result.error).toContain('String error');
  });
});
