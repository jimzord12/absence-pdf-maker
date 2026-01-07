import { tool } from '@opencode-ai/plugin/tool';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getDefaultPaths,
  getLocationDir,
  listAllTasks,
  readStateFile,
  readTaskFile,
  writeStateFile,
  writeTaskFile,
  type TaskPaths,
} from '../lib/filesystem.js';
import {
  generateTaskContent,
  type ErrorResult,
  type StateFile,
  type TaskLocation,
} from '../lib/tasks.js';

// ============================================================================
// Types
// ============================================================================

interface TaskInsertResult {
  success: true;
  taskId: string;
  insertedAfter: string;
  location: TaskLocation;
  renamedTasks: { oldId: string; newId: string }[];
  message: string;
}

interface ParsedTaskId {
  prefix: string;
  suffix: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a task ID into its numeric prefix and text suffix
 * e.g., "003-feature-name" → { prefix: "003", suffix: "feature-name" }
 */
function parseTaskId(taskId: string): ParsedTaskId | null {
  const match = taskId.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  return { prefix: match[1], suffix: match[2] };
}

/**
 * Get the numeric value from a task ID prefix
 */
function getTaskNumber(taskId: string): number | null {
  const parsed = parseTaskId(taskId);
  if (!parsed) return null;
  return parseInt(parsed.prefix, 10);
}

/**
 * Create a new task ID with incremented number
 */
function incrementTaskId(taskId: string): string | null {
  const parsed = parseTaskId(taskId);
  if (!parsed) return null;
  const num = parseInt(parsed.prefix, 10);
  const newPrefix = String(num + 1).padStart(parsed.prefix.length, '0');
  return `${newPrefix}-${parsed.suffix}`;
}

/**
 * Create a task ID with a specific number
 */
function createTaskIdWithNumber(num: number, suffix: string, padLength = 3): string {
  const prefix = String(num).padStart(padLength, '0');
  return `${prefix}-${suffix}`;
}

/**
 * Rename a task file and update its content
 */
function renameTaskFile(
  oldId: string,
  newId: string,
  location: TaskLocation,
  paths: TaskPaths
): boolean {
  try {
    const dir = getLocationDir(paths, location);
    const oldPath = path.join(dir, `${oldId}.md`);
    const newPath = path.join(dir, `${newId}.md`);

    // Read old content
    const content = readTaskFile(oldPath);
    if (!content) return false;

    // Update the task ID in the content (header line)
    const updatedContent = content.replace(
      new RegExp(`^# ${escapeRegex(oldId)}`, 'm'),
      `# ${newId}`
    );

    // Write to new path
    if (!writeTaskFile(newPath, updatedContent)) return false;

    // Delete old file
    fs.unlinkSync(oldPath);

    return true;
  } catch {
    return false;
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Update state.json to rename a task
 */
function renameTaskInState(stateFile: StateFile, oldId: string, newId: string): void {
  const taskInfo = stateFile.tasks[oldId];
  if (taskInfo) {
    stateFile.tasks[newId] = taskInfo;
    const { [oldId]: _removed, ...rest } = stateFile.tasks;
    void _removed; // Intentionally unused
    stateFile.tasks = rest;
  }
}

// ============================================================================
// Main Tool
// ============================================================================

/**
 * tasks_insert - Insert a new task after a specific task, renumbering subsequent tasks
 */
export const insert = tool({
  description:
    'Insert a new task after a specific task ID. Automatically renumbers all subsequent tasks (files, state.json, and in-file content). For example, inserting after 003 will create 004 and shift existing 004→005, 005→006, etc.',
  args: {
    insertAfter: tool.schema
      .string()
      .describe('The task ID to insert after (e.g., "003-some-feature")'),
    suffix: tool.schema
      .string()
      .describe('The suffix for the new task ID (e.g., "new-feature" for "004-new-feature")'),
    priority: tool.schema
      .string()
      .optional()
      .describe('Task priority (high, medium, low). Default: medium'),
    fromIssue: tool.schema.string().optional().describe('Link to related issue number'),
    description: tool.schema.string().optional().describe('Task description'),
    constraints: tool.schema.string().optional().describe('Task constraints'),
    acceptanceCriteria: tool.schema.string().optional().describe('Acceptance criteria'),
  },
  async execute(args): Promise<string> {
    const {
      insertAfter,
      suffix,
      priority,
      fromIssue,
      description,
      constraints,
      acceptanceCriteria,
    } = args;
    const paths = getDefaultPaths();

    // Validate insertAfter task ID format
    const parsedInsertAfter = parseTaskId(insertAfter);
    if (!parsedInsertAfter) {
      const result: ErrorResult = {
        success: false,
        error: `Invalid task ID format: ${insertAfter}. Expected format: "NNN-suffix" (e.g., "003-some-feature")`,
      };
      return JSON.stringify(result);
    }

    const insertAfterNumber = parseInt(parsedInsertAfter.prefix, 10);
    const padLength = parsedInsertAfter.prefix.length;

    // Get all tasks
    const allTasks = listAllTasks(paths);

    // Check if insertAfter task exists
    const insertAfterTask = allTasks.find(t => t.taskId === insertAfter);
    if (!insertAfterTask) {
      const result: ErrorResult = {
        success: false,
        error: `Task not found: ${insertAfter}`,
      };
      return JSON.stringify(result);
    }

    // Find all tasks that need to be renumbered (number > insertAfterNumber, in active or backlog)
    const tasksToRename = allTasks
      .filter(t => {
        if (t.location === 'archive') return false; // Don't rename archived tasks
        const num = getTaskNumber(t.taskId);
        return num !== null && num > insertAfterNumber;
      })
      .map(t => {
        const num = getTaskNumber(t.taskId);
        // num is guaranteed non-null by the filter above
        return {
          taskId: t.taskId,
          location: t.location,
          number: num as number,
        };
      })
      .sort((a, b) => b.number - a.number); // Sort descending to rename from highest first

    // Read state file
    let stateFile = readStateFile(paths.stateFilePath);
    if (!stateFile) {
      stateFile = { $schema: './state.schema.json', version: '2.0', tasks: {} };
    }

    const renamedTasks: { oldId: string; newId: string }[] = [];

    // Rename tasks in reverse order (highest first to avoid conflicts)
    for (const task of tasksToRename) {
      const newId = incrementTaskId(task.taskId);
      if (!newId) {
        const result: ErrorResult = {
          success: false,
          error: `Failed to generate new ID for task: ${task.taskId}`,
        };
        return JSON.stringify(result);
      }

      // Rename file and update content
      const renamed = renameTaskFile(task.taskId, newId, task.location, paths);
      if (!renamed) {
        const result: ErrorResult = {
          success: false,
          error: `Failed to rename task file: ${task.taskId} → ${newId}`,
        };
        return JSON.stringify(result);
      }

      // Update state.json
      renameTaskInState(stateFile, task.taskId, newId);

      renamedTasks.push({ oldId: task.taskId, newId });
    }

    // Create the new task ID
    const newTaskNumber = insertAfterNumber + 1;
    const newTaskId = createTaskIdWithNumber(newTaskNumber, suffix, padLength);

    // Generate task content
    const content = generateTaskContent(newTaskId, {
      priority: priority ?? 'medium',
      issue: fromIssue ? `[#${fromIssue}](../issues/open/${fromIssue}.md)` : 'N/A',
      description,
      constraints,
      acceptanceCriteria,
    });

    // Write new task file to backlog
    const taskFilePath = path.join(paths.backlogDir, `${newTaskId}.md`);
    const written = writeTaskFile(taskFilePath, content);
    if (!written) {
      const result: ErrorResult = {
        success: false,
        error: `Failed to create task file: ${taskFilePath}`,
      };
      return JSON.stringify(result);
    }

    // Add new task to state.json
    stateFile.tasks[newTaskId] = {
      state: 'not_started',
      lastUpdated: new Date().toISOString(),
      location: 'backlog',
      fromIssue,
      blockedBy: [],
    };

    // Write state file
    const stateWritten = writeStateFile(paths.stateFilePath, stateFile);
    if (!stateWritten) {
      const result: ErrorResult = {
        success: false,
        error: 'Failed to write state.json',
      };
      return JSON.stringify(result);
    }

    const result: TaskInsertResult = {
      success: true,
      taskId: newTaskId,
      insertedAfter: insertAfter,
      location: 'backlog',
      renamedTasks: renamedTasks.reverse(), // Return in ascending order for readability
      message: `Inserted task ${newTaskId} after ${insertAfter}. Renamed ${renamedTasks.length} subsequent task(s).`,
    };

    return JSON.stringify(result);
  },
});
