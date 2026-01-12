import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';

  vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn((..._args) => []) as any,
    renameSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

const mockExit = vi.fn() as unknown as (code?: number) => never;
const mockConsoleError = vi.fn();
const mockConsoleLog = vi.fn();

const originalExit = process.exit;
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(mockExit as any);
  vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
  vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);

  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(fs.readFileSync).mockImplementation((filePath, _encoding) => {
    if (typeof filePath === 'string') {
      if (filePath.includes('state.json')) {
        return JSON.stringify({
          $schema: '../state.schema.json',
          version: '1.0',
          tasks: {},
        });
      }
      if (filePath.includes('TEMPLATE')) {
        return `# {{TASK_ID}}

**Priority:** {{high|medium|low}}

**Blocks:** {{comma-separated task IDs or "none"}}
**Blocked By:** {{comma-separated task IDs or "none"}}
**Issue:** {{link to issue or "N/A"}}

## Description

{{Detailed description of what this task accomplishes. Include context, goals, and scope.}}

## Constraints

- {{Technical constraint 1}}
- {{Technical constraint 2}}
- {{Pattern or convention to follow}}

## Acceptance Criteria

- [ ] {{Measurable criterion 1}}
- [ ] {{Measurable criterion 2}}
- [ ] {{Test requirement}}
- [ ] {{Documentation requirement}}
- [ ] {{Optional: Performance requirement}}

## Notes

{{Optional: Any implementation notes or context}}`;
      }
    }
    return '';
  });
  vi.mocked(fs.readdirSync).mockImplementation(() => [] as any);
  vi.mocked(fs.renameSync).mockImplementation(() => undefined);
});

afterEach(() => {
  process.exit = originalExit;
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

async function importTaskCli() {
  const module = await import('./task-cli');
  return module;
}

describe('Utility Functions', () => {
  describe('loadState', () => {
    it('should load and parse state.json successfully', async () => {
      const testData = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started',
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog',
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(testData));

      const cli = await importTaskCli();
      const state = cli.loadState();

      expect(state).toEqual(testData);
      expect(vi.mocked(fs.readFileSync)).toHaveBeenCalledWith(
        expect.stringContaining('state.json'),
        'utf-8'
      );
    });
  });

  describe('saveState', () => {
    it('should save state with proper formatting', async () => {
      const cli = await importTaskCli();
      const testState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      cli.saveState(testState);

      expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalledWith(
        expect.stringContaining('state.json'),
        expect.stringContaining('\n')
      );
    });
  });

  describe('getTaskFilePath', () => {
    it('should return correct path for task in backlog', async () => {
      const cli = await importTaskCli();
      const result = cli.getTaskFilePath('001-task', 'backlog');
      expect(result).toMatch(/docs\/tasks\/backlog\/001-task\.md$/);
    });

    it('should return correct path for task in active', async () => {
      const cli = await importTaskCli();
      const result = cli.getTaskFilePath('001-task', 'active');
      expect(result).toMatch(/docs\/tasks\/active\/001-task\.md$/);
    });

    it('should return correct path for task in archive', async () => {
      const cli = await importTaskCli();
      const result = cli.getTaskFilePath('001-task', 'archive');
      expect(result).toMatch(/docs\/tasks\/archive\/001-task\.md$/);
    });
  });

  describe('findTaskFile', () => {
    it('should find task file in backlog', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePathOrBuffer) => {
        const strPath = String(filePathOrBuffer);
        return strPath.includes('backlog/001-task.md');
      });

      const cli = await importTaskCli();
      const result = cli.findTaskFile('001-task');

      expect(result).toEqual({
        path: expect.stringContaining('backlog/001-task.md'),
        location: 'backlog',
      });
    });

    it('should find task file in active', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePathOrBuffer) => {
        const strPath = String(filePathOrBuffer);
        return strPath.includes('active/001-task.md');
      });

      const cli = await importTaskCli();
      const result = cli.findTaskFile('001-task');

      expect(result).toEqual({
        path: expect.stringContaining('active/001-task.md'),
        location: 'active',
      });
    });

    it('should find task file in archive', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePathOrBuffer) => {
        const strPath = String(filePathOrBuffer);
        return strPath.includes('archive/001-task.md');
      });

      const cli = await importTaskCli();
      const result = cli.findTaskFile('001-task');

      expect(result).toEqual({
        path: expect.stringContaining('archive/001-task.md'),
        location: 'archive',
      });
    });

    it('should return null if task file not found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const cli = await importTaskCli();
      const result = cli.findTaskFile('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('parseTaskFile', () => {
    it('should parse complete task file', async () => {
      const taskContent = `# 001-test-task

**Priority:** high

**Blocks:** 002, 003
**Blocked By:** 001
**Issue:** https://github.com/user/repo/issues/1

## Description

This is a test task description.
It has multiple lines.

## Constraints

- Use TypeScript strict mode
- Follow existing patterns
- Add unit tests

## Acceptance Criteria

- [x] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Notes

Some additional notes here.`;

      const cli = await importTaskCli();
      const result = cli.parseTaskFile(taskContent);

      expect(result).toEqual({
        id: '001-test-task',
        priority: 'high',
        blocks: ['002', '003'],
        blockedBy: ['001'],
        issue: 'https://github.com/user/repo/issues/1',
        description: 'This is a test task description.\nIt has multiple lines.',
        constraints: ['Use TypeScript strict mode', 'Follow existing patterns', 'Add unit tests'],
        acceptanceCriteria: ['Criterion 1', 'Criterion 2', 'Criterion 3'],
        notes: 'Some additional notes here.',
        rawContent: taskContent,
      });
    });

    it('should parse task file with minimal content', async () => {
      const taskContent = `# 001-minimal

**Priority:** medium

## Description

Minimal task.`;

      const cli = await importTaskCli();
      const result = cli.parseTaskFile(taskContent);

      expect(result).toEqual({
        id: '001-minimal',
        priority: 'medium',
        blocks: [],
        blockedBy: [],
        issue: 'N/A',
        description: 'Minimal task.',
        constraints: [],
        acceptanceCriteria: [],
        notes: '',
        rawContent: taskContent,
      });
    });

    it('should handle "none" for blocks and blockedBy', async () => {
      const taskContent = `# 001-task

**Priority:** medium

**Blocks:** none
**Blocked By:** none

## Description

Test task.`;

      const cli = await importTaskCli();
      const result = cli.parseTaskFile(taskContent);

      expect(result.blocks).toEqual([]);
      expect(result.blockedBy).toEqual([]);
    });

    it('should handle mixed case for priority', async () => {
      const taskContent = `# 001-task

**Priority:** HIGH

## Description

Test task.`;

      const cli = await importTaskCli();
      const result = cli.parseTaskFile(taskContent);

      expect(result.priority).toBe('high');
    });

    it('should strip checkboxes from acceptance criteria', async () => {
      const taskContent = `# 001-task

**Priority:** medium

## Acceptance Criteria

- [x] Completed criterion
- [ ] Incomplete criterion
- [ ] Another criterion`;

      const cli = await importTaskCli();
      const result = cli.parseTaskFile(taskContent);

      expect(result.acceptanceCriteria).toEqual([
        'Completed criterion',
        'Incomplete criterion',
        'Another criterion',
      ]);
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string correctly', async () => {
      const cli = await importTaskCli();
      const result = cli.formatDate('2025-01-12T14:30:00.000Z');

      expect(result).toMatch(/Jan 12, 2025/);
      expect(result).toMatch(/14:30|04:30/);
    });
  });

  describe('parseArgs', () => {
    it('should parse positional arguments', async () => {
      const cli = await importTaskCli();
      const result = cli.parseArgs(['show', '001-task']);

      expect(result).toEqual({
        positional: ['show', '001-task'],
        options: {},
      });
    });

    it('should parse --key=value format options', async () => {
      const cli = await importTaskCli();
      const result = cli.parseArgs(['--state=not_started', '--limit=10']);

      expect(result).toEqual({
        positional: [],
        options: {
          state: 'not_started',
          limit: '10',
        },
      });
    });

    it('should parse -k value format options', async () => {
      const cli = await importTaskCli();
      const result = cli.parseArgs(['-s', 'not_started', '-l', '10']);

      expect(result).toEqual({
        positional: [],
        options: {
          s: 'not_started',
          l: '10',
        },
      });
    });

    it('should handle flags without values', async () => {
      const cli = await importTaskCli();
      const result = cli.parseArgs(['--verbose', '--debug']);

      expect(result).toEqual({
        positional: [],
        options: {
          verbose: 'true',
          debug: 'true',
        },
      });
    });

    it('should mix positional and options', async () => {
      const cli = await importTaskCli();
      const result = cli.parseArgs(['show', '001-task', '--format=json']);

      expect(result).toEqual({
        positional: ['show', '001-task'],
        options: {
          format: 'json',
        },
      });
    });
  });
});

describe('Command Handlers', () => {
  describe('handleState', () => {
    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
      },
    };

    beforeEach(async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
      vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    it('should update task state with valid transition', async () => {
      const cli = await importTaskCli();
      cli.handleState('001-task', 'implemented');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Updated 001-task: not_started → implemented')
      );
      expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalled();
    });

    it('should move file when location changes', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePathOrBuffer) => {
        const strPath = String(filePathOrBuffer);
        return (
          strPath.includes('backlog/001-task.md') ||
          strPath.includes('active/001-task.md') ||
          strPath.includes('state.json')
        );
      });

      const cli = await importTaskCli();
      cli.handleState('001-task', 'implemented');

      expect(vi.mocked(fs.renameSync)).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Moved 001-task.md: backlog/ → active/')
      );
    });

    it('should exit with error for invalid transition', async () => {
      const cli = await importTaskCli();
      cli.handleState('001-task', 'committed');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Invalid transition')
      );
    });
  });

  describe('handleShow', () => {
    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'implemented' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'active' as const,
          description: 'Test description',
          blockedBy: ['000-setup'],
        },
      },
    };

    const mockTaskFile = `# 001-task

**Priority:** high

## Description

Test task description.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2`;

    beforeEach(async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(mockState);
        }
        if (strPath.includes('active/001-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    it('should display task details', async () => {
      const cli = await importTaskCli();
      cli.handleShow('001-task');

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Task: 001-task'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('State:        implemented'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Location:     active'));
    });

    it('should infer state from location if not in state.json', async () => {
      const stateWithoutTask = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {},
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(stateWithoutTask);
        }
        if (strPath.includes('backlog/001-task.md')) {
          return mockTaskFile;
        }
        return '';
      });

      const cli = await importTaskCli();
      cli.handleShow('001-task');

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('State:        not_started'));
    });
  });

  describe('handleList', () => {
    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
        '002-task': {
          state: 'implemented' as const,
          lastUpdated: '2025-01-13T11:00:00.000Z',
          location: 'active' as const,
        },
      },
    };

    beforeEach(async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
      vi.mocked(fs.readdirSync).mockImplementation(() => [] as any);
    });

    it('should list all tasks without filters', async () => {
      const cli = await importTaskCli();
      cli.handleList({});

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Tasks (2):'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('001-task'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('002-task'));
    });

    it('should filter tasks by state', async () => {
      const cli = await importTaskCli();
      cli.handleList({ state: 'not_started' });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('001-task'));
      expect(mockConsoleLog).not.toHaveBeenCalledWith(expect.stringContaining('002-task'));
    });

    it('should filter tasks by location', async () => {
      const cli = await importTaskCli();
      cli.handleList({ location: 'backlog' });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('001-task'));
      expect(mockConsoleLog).not.toHaveBeenCalledWith(expect.stringContaining('002-task'));
    });

    it('should limit results', async () => {
      const cli = await importTaskCli();
      cli.handleList({ limit: '1' });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Tasks (1 of 2):'));
    });

    it('should scan backlog and active folders for tasks not in state.json', async () => {
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['001-backlog-task.md'] as any)
        .mockReturnValueOnce([] as any);

      const cli = await importTaskCli();
      cli.handleList({});

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('001-backlog-task'));
    });
  });

  describe('handleCreate', () => {
    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {},
    };

    beforeEach(async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(mockState);
        }
        if (strPath.includes('TEMPLATE')) {
          return `# {{TASK_ID}}

**Priority:** {{high|medium|low}}

**Blocks:** {{comma-separated task IDs or "none"}}
**Blocked By:** {{comma-separated task IDs or "none"}}
**Issue:** {{link to issue or "N/A"}}

## Description

{{Detailed description of what this task accomplishes. Include context, goals, and scope.}}

## Constraints

- {{Technical constraint 1}}
- {{Technical constraint 2}}
- {{Pattern or convention to follow}}

## Acceptance Criteria

- [ ] {{Measurable criterion 1}}
- [ ] {{Measurable criterion 2}}
- [ ] {{Test requirement}}
- [ ] {{Documentation requirement}}
- [ ] {{Optional: Performance requirement}}

## Notes

{{Optional: Any implementation notes or context}}`;
        }
        return '';
      });
    });

    it('should create task with default values', async () => {
      const cli = await importTaskCli();
      cli.handleCreate('003-new-task', {});

      expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalledWith(
        expect.stringContaining('backlog/003-new-task.md'),
        expect.stringContaining('# 003-new-task')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('✓ Created task: 003-new-task');
    });

    it('should create task with custom priority', async () => {
      const cli = await importTaskCli();
      cli.handleCreate('003-new-task', { priority: 'high' });

      const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const contentCall = writeCalls.find(call => {
        const arg = call[0] as string;
        return typeof arg === 'string' && arg.includes('003-new-task.md');
      });
      expect(contentCall).toBeDefined();

      const content = (contentCall?.[1] as string) ?? '';
      expect(content).toContain('**Priority:** high');
    });

    it('should create task with custom description', async () => {
      const cli = await importTaskCli();
      cli.handleCreate('003-new-task', { description: 'Custom description' });

      const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const contentCall = writeCalls.find(call => {
        const arg = call[0] as string;
        return typeof arg === 'string' && arg.includes('003-new-task.md');
      });

      const content = (contentCall?.[1] as string) ?? '';
      expect(content).toContain('Custom description');
    });

    it('should add task to state.json', async () => {
      const cli = await importTaskCli();
      cli.handleCreate('003-new-task', {});

      const saveCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const stateCall = saveCalls.find(call => {
        const arg = call[0] as string;
        return typeof arg === 'string' && arg.includes('state.json');
      });

      expect(stateCall).toBeDefined();
      const savedState = JSON.parse((stateCall?.[1] as string) ?? '{}');
      expect(savedState.tasks['003-new-task']).toBeDefined();
    });

    it('should exit with error if task already exists in state.json', async () => {
      const stateWithTask = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '003-new-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(stateWithTask));

      const cli = await importTaskCli();
      cli.handleCreate('003-new-task', {});

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Task already exists in state.json: 003-new-task'
      );
    });

    it('should exit with error if task file already exists', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePathOrBuffer) => {
        const strPath = String(filePathOrBuffer);
        return strPath.includes('backlog/003-new-task.md');
      });

      const cli = await importTaskCli();
      cli.handleCreate('003-new-task', {});

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Task file already exists')
      );
    });
  });

  describe('handleMove', () => {
    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
      },
    };

    beforeEach(async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
      vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    it('should move task between folders', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePathOrBuffer) => {
        const strPath = String(filePathOrBuffer);
        return strPath.includes('backlog/001-task.md');
      });

      const cli = await importTaskCli();
      cli.handleMove('001-task', 'active');

      expect(vi.mocked(fs.renameSync)).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Moved 001-task: backlog/ → active/')
      );
    });

    it('should update task location in state.json', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const cli = await importTaskCli();
      cli.handleMove('001-task', 'active');

      const saveCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const stateCall = saveCalls.find(call => {
        const arg = call[0] as string;
        return typeof arg === 'string' && arg.includes('state.json');
      });

      const savedState = JSON.parse((stateCall?.[1] as string) ?? '{}');
      expect(savedState.tasks['001-task'].location).toBe('active');
    });

    it('should do nothing if task already in target location', async () => {
      const cli = await importTaskCli();
      cli.handleMove('001-task', 'backlog');

      expect(vi.mocked(fs.renameSync)).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Task is already in backlog/');
    });

    it('should exit with error for invalid location', async () => {
      const cli = await importTaskCli();
      cli.handleMove('001-task', 'invalid');

      expect(mockConsoleError).toHaveBeenCalledWith('Invalid location: invalid');
    });
  });

  describe('handleArchive', () => {
    it('should move task to archive', async () => {
      const mockState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'completed' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'active' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const cli = await importTaskCli();
      cli.handleArchive('001-task');

      expect(vi.mocked(fs.renameSync)).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('→ archive/')
      );
    });
  });

  describe('handleNext', () => {
    const mockTaskFile = `# 001-task

**Priority:** high

## Description

Test task description.

## Acceptance Criteria

- [ ] Criterion 1`;

    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    it('should show no actionable tasks message when all completed', async () => {
      const completedState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'committed' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'archive' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(completedState));
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n🎉 No actionable tasks! All tasks are completed or archived.\n'
      );
    });

    it('should show next unblocked task', async () => {
      const activeState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(activeState);
        }
        if (strPath.includes('backlog/001-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('NEXT TASK: 001-task'));
    });

    it('should filter out blocked tasks', async () => {
      const blockedState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
            blockedBy: ['000-setup'],
          },
          '002-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(blockedState);
        }
        if (strPath.includes('backlog/002-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('NEXT TASK: 002-task'));
      expect(mockConsoleLog).not.toHaveBeenCalledWith(expect.stringContaining('NEXT TASK: 001-task'));
    });

    it('should show message when all tasks are blocked', async () => {
      const allBlockedState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      const blockedTaskFile = `# 001-task

**Priority:** high

**Blocked By:** 000-setup

## Description

Test task.`;

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(allBlockedState);
        }
        if (strPath.includes('backlog/001-task.md')) {
          return blockedTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n⏳ All remaining tasks are blocked. Resolve dependencies first.\n'
      );
    });

    it('should auto-activate backlog task by moving to active', async () => {
      const backlogState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(backlogState);
        }
        if (strPath.includes('backlog/001-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(vi.mocked(fs.renameSync)).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📦 Moved 001-task.md: backlog/ → active/')
      );
    });

    it('should sort tasks by priority', async () => {
      const mixedPriorityState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
          '002-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      const highPriorityFile = `# 002-task

**Priority:** high

## Description

High priority task.`;

      const lowPriorityFile = `# 001-task

**Priority:** low

## Description

Low priority task.`;

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(mixedPriorityState);
        }
        if (strPath.includes('backlog/002-task.md')) {
          return highPriorityFile;
        }
        if (strPath.includes('backlog/001-task.md')) {
          return lowPriorityFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('NEXT TASK: 002-task'));
    });

    it('should suggest next action based on task state', async () => {
      const implementedState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'implemented' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'active' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(implementedState);
        }
        if (strPath.includes('active/001-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Write/run unit tests')
      );
    });

    it('should scan backlog folder if no tasks in state.json', async () => {
      const emptyState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {},
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(emptyState);
        }
        if (strPath.includes('backlog/001-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue(['001-task.md'] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('NEXT TASK: 001-task'));
    });

    it('should show queue of remaining tasks', async () => {
      const multipleTasksState = {
        $schema: '../state.schema.json',
        version: '1.0',
        tasks: {
          '001-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
          '002-task': {
            state: 'not_started' as const,
            lastUpdated: '2025-01-12T10:00:00.000Z',
            location: 'backlog' as const,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
        const strPath = String(filePathOrBuffer);
        if (strPath.includes('state.json')) {
          return JSON.stringify(multipleTasksState);
        }
        if (strPath.includes('backlog/001-task.md')) {
          return mockTaskFile;
        }
        if (strPath.includes('backlog/002-task.md')) {
          return mockTaskFile;
        }
        return '';
      });
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const cli = await importTaskCli();
      cli.handleNext();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Queue (1 more):'));
    });
  });
});

describe('Main Entry Point', () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should show help when no arguments provided', async () => {
    process.argv = ['node', 'task-cli'];

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalled();
    expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
  });

  it('should handle legacy usage with task ID and state', async () => {
    process.argv = ['node', 'task-cli', '001-task', 'implemented'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
      },
    };

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Updated 001-task'));
  });

  it('should handle state command', async () => {
    process.argv = ['node', 'task-cli', 'state', '001-task', 'implemented'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
      },
    };

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Updated 001-task'));
  });

  it('should handle show command', async () => {
    process.argv = ['node', 'task-cli', 'show', '001-task'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
      },
    };

    vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
      const strPath = String(filePathOrBuffer);
      if (strPath.includes('state.json')) {
        return JSON.stringify(mockState);
      }
      return '';
    });
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Task: 001-task'));
  });

  it('should handle list command', async () => {
    process.argv = ['node', 'task-cli', 'list'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {},
    };

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Tasks (0):'));
  });

  it('should handle create command', async () => {
    process.argv = ['node', 'task-cli', 'create', '001-task'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {},
    };

    vi.mocked(fs.readFileSync).mockImplementation((filePathOrBuffer, _encoding) => {
      const strPath = String(filePathOrBuffer);
      if (strPath.includes('state.json')) {
        return JSON.stringify(mockState);
      }
      if (strPath.includes('TEMPLATE')) {
        return `# {{TASK_ID}}

**Priority:** {{high|medium|low}}

**Blocks:** {{comma-separated task IDs or "none"}}
**Blocked By:** {{comma-separated task IDs or "none"}}
**Issue:** {{link to issue or "N/A"}}

## Description

{{Detailed description of what this task accomplishes. Include context, goals, and scope.}}

## Constraints

- {{Technical constraint 1}}
- {{Technical constraint 2}}
- {{Pattern or convention to follow}}

## Acceptance Criteria

- [ ] {{Measurable criterion 1}}
- [ ] {{Measurable criterion 2}}
- [ ] {{Test requirement}}
- [ ] {{Documentation requirement}}
- [ ] {{Optional: Performance requirement}}

## Notes

{{Optional: Any implementation notes or context}}`;
      }
      return '';
    });

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith('✓ Created task: 001-task');
  });

  it('should handle move command', async () => {
    process.argv = ['node', 'task-cli', 'move', '001-task', 'active'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'not_started' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'backlog' as const,
        },
      },
    };

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Moved 001-task'));
  });

  it('should handle archive command', async () => {
    process.argv = ['node', 'task-cli', 'archive', '001-task'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {
        '001-task': {
          state: 'completed' as const,
          lastUpdated: '2025-01-12T10:00:00.000Z',
          location: 'active' as const,
        },
      },
    };

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('→ archive/'));
  });

  it('should handle next command', async () => {
    process.argv = ['node', 'task-cli', 'next'];

    const mockState = {
      $schema: '../state.schema.json',
      version: '1.0',
      tasks: {},
    };

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockState));
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '\n🎉 No actionable tasks! All tasks are completed or archived.\n'
    );
  });

  it('should exit with error for unknown command', async () => {
    process.argv = ['node', 'task-cli', 'unknown'];

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleError).toHaveBeenCalledWith('Unknown command: unknown');
  });

  it('should exit with error for insufficient arguments to create command', async () => {
    process.argv = ['node', 'task-cli', 'create'];

    const cli = await importTaskCli();
    cli.main();

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Usage: npm run task -- create <task-id>')
    );
  });
});
