import { tool } from '@opencode-ai/plugin/tool';
import * as path from 'node:path';
import {
  findTaskFile,
  getDefaultPaths,
  readStateFile,
  writeStateFile,
  writeTaskFile,
} from '../lib/filesystem.js';
import { generateTaskContent, type ErrorResult, type TaskCreateResult } from '../lib/tasks.js';

/**
 * tasks_create - Create new task from template
 */
export const create = tool({
  description: 'Create a new task file from template. Creates the file in backlog/ directory.',
  args: {
    taskId: tool.schema.string().describe('The task identifier (e.g., "069-new-feature")'),
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
    const { taskId, priority, fromIssue, description, constraints, acceptanceCriteria } = args;
    const paths = getDefaultPaths();

    // Check if task already exists
    const existing = findTaskFile(taskId, paths);
    if (existing) {
      const result: ErrorResult = {
        success: false,
        error: `Task already exists: ${taskId} in ${existing.location}/`,
      };
      return JSON.stringify(result);
    }

    // Generate task content
    const content = generateTaskContent(taskId, {
      priority: priority ?? 'medium',
      issue: fromIssue ? `[#${fromIssue}](../issues/open/${fromIssue}.md)` : 'N/A',
      description,
      constraints,
      acceptanceCriteria,
    });

    // Write task file to backlog
    const taskFilePath = path.join(paths.backlogDir, `${taskId}.md`);
    const written = writeTaskFile(taskFilePath, content);
    if (!written) {
      const result: ErrorResult = {
        success: false,
        error: `Failed to create task file: ${taskFilePath}`,
      };
      return JSON.stringify(result);
    }

    // Add to state.json
    let stateFile = readStateFile(paths.stateFilePath);
    if (!stateFile) {
      stateFile = { $schema: './state.schema.json', version: '2.0', tasks: {} };
    }

    stateFile.tasks[taskId] = {
      state: 'not_started',
      lastUpdated: new Date().toISOString(),
      location: 'backlog',
      fromIssue,
      blockedBy: [],
    };

    writeStateFile(paths.stateFilePath, stateFile);

    const result: TaskCreateResult = {
      success: true,
      taskId,
      location: 'backlog',
      message: `Created task: docs/tasks/backlog/${taskId}.md`,
    };

    return JSON.stringify(result);
  },
});
