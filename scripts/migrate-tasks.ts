/**
 * Migration script: TASKS.md → Individual files
 *
 * This script migrates the monolithic task management system to a
 * file-per-task architecture.
 *
 * Steps:
 * 1. Parse existing TASKS.md
 * 2. Extract each task section
 * 3. Determine destination folder based on state.json
 * 4. Write individual .md files
 * 5. Update state.json to v2 format
 *
 * Usage: npx tsx scripts/migrate-tasks.ts [--dry-run]
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// === Types ===

interface LegacyTask {
  identifier: string;
  description: string;
  constraints: string;
  acceptanceCriteria: string;
  rawContent: string;
}

interface LegacyStateEntry {
  state: string;
  lastUpdated: string;
  description?: string;
  notes?: string;
  fromIssue?: string;
  blockedBy?: string[];
}

interface LegacyState {
  tasks: Record<string, LegacyStateEntry>;
}

interface V2StateEntry {
  state: string;
  lastUpdated: string;
  location: 'backlog' | 'active' | 'archive';
  notes?: string;
  fromIssue?: string;
  blockedBy?: string[];
}

interface V2State {
  version: '2.0';
  tasks: Record<string, V2StateEntry>;
}

interface MigrationResult {
  taskId: string;
  location: 'archive' | 'active' | 'backlog';
  success: boolean;
  error?: string;
}

// === Configuration ===

const TASKS_DIR = path.join(process.cwd(), 'docs/tasks');
const TASKS_MD_PATH = path.join(TASKS_DIR, 'TASKS.md');
const STATE_JSON_PATH = path.join(TASKS_DIR, 'state.json');
const TEMPLATE_PATH = path.join(process.cwd(), 'docs/templates/TASK-TEMPLATE.md');

const FOLDERS = {
  archive: path.join(TASKS_DIR, 'archive'),
  active: path.join(TASKS_DIR, 'active'),
  backlog: path.join(TASKS_DIR, 'backlog'),
};

// === Helper Functions ===

function determineLocation(state: string): 'archive' | 'active' | 'backlog' {
  if (state === 'committed' || state === 'cancelled') return 'archive';
  if (state === 'not_started') return 'backlog';
  return 'active';
}

function parseTasksFromMarkdown(content: string): LegacyTask[] {
  const tasks: LegacyTask[] = [];

  // Split by task headers (e.g., "### 051-fix-issue-012-personal-details-validation")
  // Format: ### <identifier>
  const sections = content.split(/^### /gm).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const headerLine = lines[0]?.trim();

    if (!headerLine) continue;

    // The identifier is the first line (e.g., "051-fix-issue-012-personal-details-validation")
    const identifier = headerLine;

    // Skip if it doesn't look like a task identifier (should start with digits or have dashes)
    if (!/^\d{3}/.test(identifier)) continue;

    const rawContent = '### ' + section;

    // Extract sections from task content
    const descMatch = rawContent.match(/\*\*Description:\*\*\s*([\s\S]*?)(?=\*\*Constraints:|$)/);
    const constMatch = rawContent.match(
      /\*\*Constraints:\*\*\s*([\s\S]*?)(?=\*\*Acceptance Criteria:|$)/
    );
    const acMatch = rawContent.match(
      /\*\*Acceptance Criteria:\*\*\s*([\s\S]*?)(?=^---\s*$|^### |\Z)/m
    );

    tasks.push({
      identifier,
      description: descMatch ? descMatch[1].trim() : '',
      constraints: constMatch ? constMatch[1].trim() : '',
      acceptanceCriteria: acMatch ? acMatch[1].trim() : '',
      rawContent,
    });
  }

  return tasks;
}

function formatTaskFile(task: LegacyTask, state: LegacyStateEntry | undefined): string {
  const priority = 'medium'; // Default, can be inferred from state if available
  const blocks = 'none';
  const blockedBy = state?.blockedBy?.join(', ') || 'none';
  const issue = state?.fromIssue
    ? `[#${state.fromIssue}](../issues/open/${state.fromIssue}.md)`
    : 'N/A';

  return `# ${task.identifier}

**Priority:** ${priority}
**Blocks:** ${blocks}
**Blocked By:** ${blockedBy}
**Issue:** ${issue}

---

## Description

${task.description || 'No description provided.'}

## Constraints

${task.constraints || '- No constraints specified.'}

## Acceptance Criteria

${task.acceptanceCriteria || '- [ ] No acceptance criteria specified.'}

## Notes

${state?.notes || 'No notes.'}
`;
}

// === Main Migration Logic ===

async function readLegacyState(): Promise<LegacyState> {
  const content = await fs.readFile(STATE_JSON_PATH, 'utf-8');
  return JSON.parse(content) as LegacyState;
}

async function readTasksMarkdown(): Promise<string> {
  return fs.readFile(TASKS_MD_PATH, 'utf-8');
}

async function writeTaskFile(
  task: LegacyTask,
  location: 'archive' | 'active' | 'backlog',
  state: LegacyStateEntry | undefined,
  dryRun: boolean
): Promise<MigrationResult> {
  const filePath = path.join(FOLDERS[location], `${task.identifier}.md`);
  const content = formatTaskFile(task, state);

  try {
    if (!dryRun) {
      await fs.writeFile(filePath, content, 'utf-8');
    }
    return { taskId: task.identifier, location, success: true };
  } catch (error) {
    return {
      taskId: task.identifier,
      location,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function updateStateJson(
  legacyState: LegacyState,
  results: MigrationResult[],
  dryRun: boolean
): Promise<void> {
  const v2State: V2State = {
    version: '2.0',
    tasks: {},
  };

  // Only include non-archived tasks in state.json
  for (const result of results) {
    if (result.success && result.location !== 'archive') {
      const legacyEntry = legacyState.tasks[result.taskId];
      if (legacyEntry) {
        v2State.tasks[result.taskId] = {
          state: legacyEntry.state,
          lastUpdated: legacyEntry.lastUpdated,
          location: result.location,
          notes: legacyEntry.notes,
          fromIssue: legacyEntry.fromIssue,
          blockedBy: legacyEntry.blockedBy,
        };
      }
    }
  }

  if (!dryRun) {
    await fs.writeFile(STATE_JSON_PATH, JSON.stringify(v2State, null, 2), 'utf-8');
  } else {
    console.log('\n[DRY RUN] New state.json would be:');
    console.log(JSON.stringify(v2State, null, 2).slice(0, 500) + '...');
  }
}

async function ensureFoldersExist(): Promise<void> {
  for (const folder of Object.values(FOLDERS)) {
    await fs.mkdir(folder, { recursive: true });
  }
}

function createMinimalTask(identifier: string, state: LegacyStateEntry): LegacyTask {
  return {
    identifier,
    description: state.description || 'Legacy task - details not available.',
    constraints: '',
    acceptanceCriteria: '',
    rawContent: '',
  };
}

async function migrate(dryRun: boolean): Promise<void> {
  console.log('=== Task Management Migration ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // 1. Ensure folders exist
  await ensureFoldersExist();
  console.log('✓ Folders verified');

  // 2. Read existing files
  const [tasksContent, legacyState] = await Promise.all([readTasksMarkdown(), readLegacyState()]);
  console.log('✓ Read TASKS.md and state.json');

  // 3. Parse all tasks from TASKS.md
  const tasksFromMarkdown = parseTasksFromMarkdown(tasksContent);
  console.log(`✓ Parsed ${tasksFromMarkdown.length} tasks from TASKS.md`);

  // 4. Build a map of existing task identifiers from TASKS.md
  const markdownTaskIds = new Set(tasksFromMarkdown.map(t => t.identifier));

  // 5. Find tasks in state.json that are NOT in TASKS.md (legacy archived tasks)
  const legacyOnlyTaskIds = Object.keys(legacyState.tasks).filter(id => !markdownTaskIds.has(id));
  console.log(
    `✓ Found ${legacyOnlyTaskIds.length} additional tasks in state.json (not in TASKS.md)`
  );

  // 6. Create minimal task objects for legacy tasks
  const legacyTasks: LegacyTask[] = legacyOnlyTaskIds.map(id =>
    createMinimalTask(id, legacyState.tasks[id])
  );

  // 7. Combine all tasks
  const allTasks = [...tasksFromMarkdown, ...legacyTasks];
  console.log(`✓ Total tasks to migrate: ${allTasks.length}`);

  // 8. Migrate each task
  const results: MigrationResult[] = [];
  for (const task of allTasks) {
    const stateEntry = legacyState.tasks[task.identifier];
    const state = stateEntry?.state || 'not_started';
    const location = determineLocation(state);

    const result = await writeTaskFile(task, location, stateEntry, dryRun);
    results.push(result);

    const icon = result.success ? '✓' : '✗';
    console.log(`  ${icon} Task ${result.taskId} → ${location}/`);
  }

  // 5. Update state.json
  await updateStateJson(legacyState, results, dryRun);
  console.log('✓ Updated state.json to v2 format');

  // 6. Report results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success);

  console.log('');
  console.log('=== Migration Summary ===');
  console.log(`Total tasks: ${allTasks.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed tasks:');
    for (const f of failed) {
      console.log(`  - ${f.taskId}: ${f.error}`);
    }
  }

  const archiveCount = results.filter(r => r.location === 'archive').length;
  const activeCount = results.filter(r => r.location === 'active').length;
  const backlogCount = results.filter(r => r.location === 'backlog').length;

  console.log('\nDistribution:');
  console.log(`  archive/: ${archiveCount} tasks`);
  console.log(`  active/:  ${activeCount} tasks`);
  console.log(`  backlog/: ${backlogCount} tasks`);

  if (dryRun) {
    console.log('\n[DRY RUN] No files were modified. Run without --dry-run to apply changes.');
  }
}

// === CLI Entry Point ===

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

migrate(dryRun).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
