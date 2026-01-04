import * as fs from 'node:fs';
import * as path from 'node:path';
import type { StateFile, TaskLocation, TaskResult } from './tasks.js';

export interface FileSystemOperations {
  readFileSync?: typeof fs.readFileSync;
  writeFileSync?: typeof fs.writeFileSync;
  readdirSync?: typeof fs.readdirSync;
  existsSync?: typeof fs.existsSync;
  renameSync?: typeof fs.renameSync;
}

export interface TaskPaths {
  stateFilePath: string;
  templateFilePath: string;
  activeDir: string;
  backlogDir: string;
  archiveDir: string;
}

/**
 * Get default paths for the task management system
 */
export function getDefaultPaths(cwd: string = process.cwd()): TaskPaths {
  const tasksDir = path.join(cwd, 'docs/tasks');
  return {
    stateFilePath: path.join(tasksDir, 'state.json'),
    templateFilePath: path.join(cwd, 'docs/templates/TASK-TEMPLATE.md'),
    activeDir: path.join(tasksDir, 'active'),
    backlogDir: path.join(tasksDir, 'backlog'),
    archiveDir: path.join(tasksDir, 'archive'),
  };
}

/**
 * Get the directory path for a task location
 */
export function getLocationDir(paths: TaskPaths, location: TaskLocation): string {
  switch (location) {
    case 'active':
      return paths.activeDir;
    case 'backlog':
      return paths.backlogDir;
    case 'archive':
      return paths.archiveDir;
    default:
      throw new Error(`Unknown location: ${location}`);
  }
}

/**
 * Read and parse the state.json file
 */
export function readStateFile(
  stateFilePath: string,
  ops: FileSystemOperations = {}
): StateFile | null {
  const readSync = ops.readFileSync ?? fs.readFileSync;

  try {
    const stateContent = readSync(stateFilePath, 'utf-8');
    return JSON.parse(stateContent) as StateFile;
  } catch {
    return null;
  }
}

/**
 * Write the state.json file
 */
export function writeStateFile(
  stateFilePath: string,
  stateFile: StateFile,
  ops: FileSystemOperations = {}
): boolean {
  const writeSync = ops.writeFileSync ?? fs.writeFileSync;

  try {
    const content = JSON.stringify(stateFile, null, 2) + '\n';
    writeSync(stateFilePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Read an individual task file
 */
export function readTaskFile(taskFilePath: string, ops: FileSystemOperations = {}): string | null {
  const readSync = ops.readFileSync ?? fs.readFileSync;

  try {
    return readSync(taskFilePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write an individual task file
 */
export function writeTaskFile(
  taskFilePath: string,
  content: string,
  ops: FileSystemOperations = {}
): boolean {
  const writeSync = ops.writeFileSync ?? fs.writeFileSync;

  try {
    writeSync(taskFilePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * List all task files in a directory
 */
export function listTaskFiles(dirPath: string, ops: FileSystemOperations = {}): string[] {
  const readdirSync = ops.readdirSync ?? fs.readdirSync;
  const existsSync = ops.existsSync ?? fs.existsSync;

  try {
    if (!existsSync(dirPath)) {
      return [];
    }
    const files = readdirSync(dirPath);
    return files
      .filter((file): file is string => typeof file === 'string' && file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

/**
 * List all tasks across all locations
 */
export function listAllTasks(
  paths: TaskPaths,
  ops: FileSystemOperations = {}
): { taskId: string; location: TaskLocation }[] {
  const locations: TaskLocation[] = ['active', 'backlog', 'archive'];
  const tasks: { taskId: string; location: TaskLocation }[] = [];

  for (const location of locations) {
    const dir = getLocationDir(paths, location);
    const taskIds = listTaskFiles(dir, ops);
    for (const taskId of taskIds) {
      tasks.push({ taskId, location });
    }
  }

  return tasks;
}

/**
 * Find task file path by ID (searches all locations)
 */
export function findTaskFile(
  taskId: string,
  paths: TaskPaths,
  ops: FileSystemOperations = {}
): { filePath: string; location: TaskLocation } | null {
  const existsSync = ops.existsSync ?? fs.existsSync;
  const locations: TaskLocation[] = ['active', 'backlog', 'archive'];

  for (const location of locations) {
    const dir = getLocationDir(paths, location);
    const filePath = path.join(dir, `${taskId}.md`);
    if (existsSync(filePath)) {
      return { filePath, location };
    }
  }

  return null;
}

/**
 * Move a task file between locations
 */
export function moveTaskFile(
  taskId: string,
  fromLocation: TaskLocation,
  toLocation: TaskLocation,
  paths: TaskPaths,
  ops: FileSystemOperations = {}
): boolean {
  const renameSync = ops.renameSync ?? fs.renameSync;
  const existsSync = ops.existsSync ?? fs.existsSync;

  try {
    const fromDir = getLocationDir(paths, fromLocation);
    const toDir = getLocationDir(paths, toLocation);
    const fromPath = path.join(fromDir, `${taskId}.md`);
    const toPath = path.join(toDir, `${taskId}.md`);

    if (!existsSync(fromPath)) {
      return false;
    }

    renameSync(fromPath, toPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the task template file
 */
export function readTemplateFile(
  templateFilePath: string,
  ops: FileSystemOperations = {}
): string | null {
  const readSync = ops.readFileSync ?? fs.readFileSync;

  try {
    return readSync(templateFilePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Create error result for file operations
 */
export function readFileErrorResult(error: unknown, fileType: 'state' | 'task'): TaskResult {
  return {
    success: false,
    error: `Failed to read or parse ${fileType} file: ${
      error instanceof Error ? error.message : String(error)
    }`,
  };
}

