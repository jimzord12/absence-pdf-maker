import { assert, describe, it } from 'vitest';
import {
  getDefaultPaths,
  readFileErrorResult,
  readStateFile,
  readTasksFile,
} from './filesystem.js';

describe('readStateFile', () => {
  it('should read and parse valid state file', () => {
    const mockContent = JSON.stringify({
      $schema: './state.schema.json',
      tasks: {
        '001-task-a': {
          state: 'committed',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      },
    });

    const result = readStateFile('/fake/path/state.json', {
      readFileSync: (() => mockContent) as any,
    });

    assert.ok(result);
    assert.strictEqual(result?.tasks['001-task-a'].state, 'committed');
  });

  it('should return null on read error', () => {
    const result = readStateFile('/fake/path/state.json', {
      readFileSync: (() => {
        throw new Error('File not found');
      }) as any,
    });

    assert.strictEqual(result, null);
  });

  it('should return null on parse error', () => {
    const result = readStateFile('/fake/path/state.json', {
      readFileSync: (() => 'invalid json') as any,
    });

    assert.strictEqual(result, null);
  });
});

describe('readTasksFile', () => {
  it('should read valid tasks file', () => {
    const mockContent = '### 001-task-test\n\n**Description:** Test';

    const result = readTasksFile('/fake/path/TASKS.md', {
      readFileSync: (() => mockContent) as any,
    });

    assert.strictEqual(result, mockContent);
  });

  it('should return null on read error', () => {
    const result = readTasksFile('/fake/path/TASKS.md', {
      readFileSync: (() => {
        throw new Error('File not found');
      }) as any,
    });

    assert.strictEqual(result, null);
  });
});

describe('getDefaultPaths', () => {
  it('should return correct default paths', () => {
    const mockCwd = '/test/directory';

    const result = getDefaultPaths(mockCwd);

    assert.strictEqual(result.stateFilePath, '/test/directory/docs/tasks/state.json');
    assert.strictEqual(result.tasksFilePath, '/test/directory/docs/tasks/TASKS.md');
  });

  it('should use provided cwd if given', () => {
    const customCwd = '/custom/directory';
    const result = getDefaultPaths(customCwd);

    assert.strictEqual(result.stateFilePath, '/custom/directory/docs/tasks/state.json');
    assert.strictEqual(result.tasksFilePath, '/custom/directory/docs/tasks/TASKS.md');
  });
});

describe('readFileErrorResult', () => {
  it('should create error result for state file', () => {
    const error = new Error('File not found');
    const result = readFileErrorResult(error, 'state');

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error, 'Failed to read or parse state file: File not found');
    }
  });

  it('should create error result for tasks file', () => {
    const error = new Error('Read error');
    const result = readFileErrorResult(error, 'tasks');

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error, 'Failed to read or parse tasks file: Read error');
    }
  });

  it('should handle non-Error objects', () => {
    const error = 'String error';
    const result = readFileErrorResult(error, 'state');

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error, 'Failed to read or parse state file: String error');
    }
  });
});

