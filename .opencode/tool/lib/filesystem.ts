import * as fs from 'node:fs';
import * as path from 'node:path';
import type { StateFile, TaskResult } from './tasks.js';

export interface FileReaders {
  readFileSync?: typeof fs.readFileSync;
}

export function readStateFile(stateFilePath: string, readers: FileReaders = {}): StateFile | null {
  const readSync = readers.readFileSync ?? fs.readFileSync;

  try {
    const stateContent = readSync(stateFilePath, 'utf-8');
    return JSON.parse(stateContent) as StateFile;
  } catch {
    return null;
  }
}

export function readTasksFile(tasksFilePath: string, readers: FileReaders = {}): string | null {
  const readSync = readers.readFileSync ?? fs.readFileSync;

  try {
    return readSync(tasksFilePath, 'utf-8');
  } catch {
    return null;
  }
}

export function getDefaultPaths(cwd: string = process.cwd()): {
  stateFilePath: string;
  tasksFilePath: string;
} {
  return {
    stateFilePath: path.join(cwd, 'docs/tasks/state.json'),
    tasksFilePath: path.join(cwd, 'docs/tasks/TASKS.md'),
  };
}

export function readFileErrorResult(error: unknown, fileType: 'state' | 'tasks'): TaskResult {
  return {
    success: false,
    error: `Failed to read or parse ${fileType} file: ${
      error instanceof Error ? error.message : String(error)
    }`,
  };
}

