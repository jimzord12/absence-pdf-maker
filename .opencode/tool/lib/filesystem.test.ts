import { describe, expect, it } from 'bun:test';
import {
  findTaskFile,
  getDefaultPaths,
  getLocationDir,
  listAllTasks,
  listTaskFiles,
  moveTaskFile,
  readFileErrorResult,
  readStateFile,
  readTaskFile,
  writeStateFile,
  writeTaskFile,
  type TaskPaths,
} from './filesystem.js';

describe('readStateFile', () => {
  it('should read and parse valid state file', () => {
    const mockContent = JSON.stringify({
      $schema: './state.schema.json',
      version: '2.0',
      tasks: {
        '001-task-a': {
          state: 'committed',
          lastUpdated: '2024-01-01T00:00:00Z',
          location: 'archive',
        },
      },
    });

    const result = readStateFile('/fake/path/state.json', {
      readFileSync: (() => mockContent) as any,
    });

    expect(result).toBeTruthy();
    expect(result?.tasks['001-task-a']?.state).toBe('committed');
    expect(result?.version).toBe('2.0');
  });

  it('should return null on read error', () => {
    const result = readStateFile('/fake/path/state.json', {
      readFileSync: (() => {
        throw new Error('File not found');
      }) as any,
    });

    expect(result).toBeNull();
  });

  it('should return null on parse error', () => {
    const result = readStateFile('/fake/path/state.json', {
      readFileSync: (() => 'invalid json') as any,
    });

    expect(result).toBeNull();
  });
});

describe('writeStateFile', () => {
  it('should write state file successfully', () => {
    let writtenContent = '';
    const result = writeStateFile(
      '/fake/path/state.json',
      { $schema: './state.schema.json', version: '2.0', tasks: {} },
      {
        writeFileSync: ((_path: string, content: string) => {
          writtenContent = content;
        }) as any,
      }
    );

    expect(result).toBe(true);
    expect(writtenContent).toContain('"version": "2.0"');
  });

  it('should return false on write error', () => {
    const result = writeStateFile(
      '/fake/path/state.json',
      { tasks: {} },
      {
        writeFileSync: (() => {
          throw new Error('Write error');
        }) as any,
      }
    );

    expect(result).toBe(false);
  });
});

describe('readTaskFile', () => {
  it('should read valid task file', () => {
    const mockContent = '# 001-task-test\n\n**Description:** Test';

    const result = readTaskFile('/fake/path/task.md', {
      readFileSync: (() => mockContent) as any,
    });

    expect(result).toBe(mockContent);
  });

  it('should return null on read error', () => {
    const result = readTaskFile('/fake/path/task.md', {
      readFileSync: (() => {
        throw new Error('File not found');
      }) as any,
    });

    expect(result).toBeNull();
  });
});

describe('writeTaskFile', () => {
  it('should write task file successfully', () => {
    let writtenContent = '';
    const result = writeTaskFile('/fake/path/task.md', '# Test Task', {
      writeFileSync: ((_path: string, content: string) => {
        writtenContent = content;
      }) as any,
    });

    expect(result).toBe(true);
    expect(writtenContent).toBe('# Test Task');
  });
});

describe('listTaskFiles', () => {
  it('should list task files in directory', () => {
    const result = listTaskFiles('/fake/dir', {
      existsSync: (() => true) as any,
      readdirSync: (() => ['001-task-a.md', '002-task-b.md', 'file.txt']) as any,
    });

    expect(result).toEqual(['001-task-a', '002-task-b']);
  });

  it('should return empty array if directory does not exist', () => {
    const result = listTaskFiles('/fake/dir', {
      existsSync: (() => false) as any,
    });

    expect(result).toEqual([]);
  });

  it('should filter out non-.md files', () => {
    const result = listTaskFiles('/fake/dir', {
      existsSync: (() => true) as any,
      readdirSync: (() => ['task.md', 'file.txt', 'other.json']) as any,
    });

    expect(result).toEqual(['task']);
  });
});

describe('getDefaultPaths', () => {
  it('should return correct default paths', () => {
    const mockCwd = '/test/directory';

    const result = getDefaultPaths(mockCwd);

    expect(result.stateFilePath).toBe('/test/directory/docs/tasks/state.json');
    expect(result.activeDir).toBe('/test/directory/docs/tasks/active');
    expect(result.backlogDir).toBe('/test/directory/docs/tasks/backlog');
    expect(result.archiveDir).toBe('/test/directory/docs/tasks/archive');
  });

  it('should include template file path', () => {
    const result = getDefaultPaths('/custom/dir');
    expect(result.templateFilePath).toBe('/custom/dir/docs/templates/TASK-TEMPLATE.md');
  });
});

describe('getLocationDir', () => {
  const paths: TaskPaths = {
    stateFilePath: '/test/state.json',
    templateFilePath: '/test/template.md',
    activeDir: '/test/active',
    backlogDir: '/test/backlog',
    archiveDir: '/test/archive',
  };

  it('should return correct directory for each location', () => {
    expect(getLocationDir(paths, 'active')).toBe('/test/active');
    expect(getLocationDir(paths, 'backlog')).toBe('/test/backlog');
    expect(getLocationDir(paths, 'archive')).toBe('/test/archive');
  });

  it('should throw for unknown location', () => {
    expect(() => getLocationDir(paths, 'unknown' as any)).toThrow();
  });
});

describe('findTaskFile', () => {
  const paths: TaskPaths = {
    stateFilePath: '/test/state.json',
    templateFilePath: '/test/template.md',
    activeDir: '/test/active',
    backlogDir: '/test/backlog',
    archiveDir: '/test/archive',
  };

  it('should find task in active directory', () => {
    const result = findTaskFile('001-task', paths, {
      existsSync: ((p: string) => p === '/test/active/001-task.md') as any,
    });

    expect(result).toEqual({ filePath: '/test/active/001-task.md', location: 'active' });
  });

  it('should find task in backlog directory', () => {
    const result = findTaskFile('001-task', paths, {
      existsSync: ((p: string) => p === '/test/backlog/001-task.md') as any,
    });

    expect(result).toEqual({ filePath: '/test/backlog/001-task.md', location: 'backlog' });
  });

  it('should find task in archive directory', () => {
    const result = findTaskFile('001-task', paths, {
      existsSync: ((p: string) => p === '/test/archive/001-task.md') as any,
    });

    expect(result).toEqual({ filePath: '/test/archive/001-task.md', location: 'archive' });
  });

  it('should return null if task not found', () => {
    const result = findTaskFile('999-task', paths, {
      existsSync: (() => false) as any,
    });

    expect(result).toBeNull();
  });
});

describe('listAllTasks', () => {
  const paths: TaskPaths = {
    stateFilePath: '/test/state.json',
    templateFilePath: '/test/template.md',
    activeDir: '/test/active',
    backlogDir: '/test/backlog',
    archiveDir: '/test/archive',
  };

  it('should list tasks from all directories', () => {
    const result = listAllTasks(paths, {
      existsSync: (() => true) as any,
      readdirSync: ((p: string) => {
        if (p === '/test/active') return ['001-active.md'];
        if (p === '/test/backlog') return ['002-backlog.md'];
        if (p === '/test/archive') return ['003-archive.md'];
        return [];
      }) as any,
    });

    expect(result).toEqual([
      { taskId: '001-active', location: 'active' },
      { taskId: '002-backlog', location: 'backlog' },
      { taskId: '003-archive', location: 'archive' },
    ]);
  });
});

describe('moveTaskFile', () => {
  const paths: TaskPaths = {
    stateFilePath: '/test/state.json',
    templateFilePath: '/test/template.md',
    activeDir: '/test/active',
    backlogDir: '/test/backlog',
    archiveDir: '/test/archive',
  };

  it('should move task between directories', () => {
    let renamedFrom = '';
    let renamedTo = '';
    const result = moveTaskFile('001-task', 'active', 'archive', paths, {
      existsSync: (() => true) as any,
      renameSync: ((from: string, to: string) => {
        renamedFrom = from;
        renamedTo = to;
      }) as any,
    });

    expect(result).toBe(true);
    expect(renamedFrom).toBe('/test/active/001-task.md');
    expect(renamedTo).toBe('/test/archive/001-task.md');
  });

  it('should return false if source file does not exist', () => {
    const result = moveTaskFile('001-task', 'active', 'archive', paths, {
      existsSync: (() => false) as any,
    });

    expect(result).toBe(false);
  });
});

describe('readFileErrorResult', () => {
  it('should create error result for state file', () => {
    const error = new Error('File not found');
    const result = readFileErrorResult(error, 'state');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to read or parse state file: File not found');
    }
  });

  it('should create error result for task file', () => {
    const error = new Error('Read error');
    const result = readFileErrorResult(error, 'task');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to read or parse task file: Read error');
    }
  });

  it('should handle non-Error objects', () => {
    const error = 'String error';
    const result = readFileErrorResult(error, 'state');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to read or parse state file: String error');
    }
  });
});

