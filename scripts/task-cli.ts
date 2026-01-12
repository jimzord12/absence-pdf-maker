#!/usr/bin/env node
/**
 * Task Management CLI v2.0
 *
 * Commands:
 *   state <id> <state>       Update task state
 *   show <id>                Display task details
 *   list [--state] [--location]  List tasks with filtering
 *   create <id>              Create new task from template
 *   move <id> <location>     Move task between folders
 *   archive <id>             Move task to archive
 *   next                     Get next actionable task
 *   help                     Show help
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// Constants & Types
// ============================================================================

const TASKS_DIR = path.resolve(process.cwd(), 'docs/tasks');
const STATE_FILE = path.join(TASKS_DIR, 'state.json');
const TEMPLATE_FILE = path.resolve(process.cwd(), 'docs/templates/TASK-TEMPLATE.md');

const LOCATIONS = ['backlog', 'active', 'archive'] as const;
type Location = (typeof LOCATIONS)[number];

type TaskState =
  | 'not_started'
  | 'implemented'
  | 'unit_tested'
  | 'review_fail'
  | 'review_pass'
  | 'completed'
  | 'cancelled'
  | 'committed';

interface TaskEntry {
  state: TaskState;
  lastUpdated: string;
  location?: Location;
  description?: string;
  notes?: string;
  fromIssue?: string;
  blockedBy?: string[];
}

interface StateJson {
  $schema: string;
  version?: string;
  tasks: Record<string, TaskEntry>;
}

interface ParsedTaskFile {
  id: string;
  priority: string;
  blocks: string[];
  blockedBy: string[];
  issue: string;
  description: string;
  constraints: string[];
  acceptanceCriteria: string[];
  notes: string;
  rawContent: string;
}

const VALID_STATES: TaskState[] = [
  'not_started',
  'implemented',
  'unit_tested',
  'review_fail',
  'review_pass',
  'completed',
  'cancelled',
  'committed',
];

const TRANSITIONS: Record<TaskState, TaskState[]> = {
  not_started: ['implemented', 'cancelled'],
  implemented: ['unit_tested', 'cancelled'],
  unit_tested: ['review_pass', 'review_fail', 'completed', 'cancelled'],
  review_fail: ['implemented', 'cancelled'],
  review_pass: ['completed', 'cancelled'],
  completed: ['committed', 'cancelled'],
  committed: [],
  cancelled: ['not_started'],
};

// State to location mapping
const STATE_TO_LOCATION: Record<TaskState, Location> = {
  not_started: 'backlog',
  implemented: 'active',
  unit_tested: 'active',
  review_fail: 'active',
  review_pass: 'active',
  completed: 'active',
  committed: 'archive',
  cancelled: 'archive',
};

// Priority order for sorting (lower = higher priority)
const PRIORITY_ORDER: Record<string, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

// ============================================================================
// Utility Functions
// ============================================================================

export function loadState(): StateJson {
  if (!fs.existsSync(STATE_FILE)) {
    console.error(`State file not found at ${STATE_FILE}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
}

export function saveState(state: StateJson): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

export function getTaskFilePath(taskId: string, location: Location): string {
  return path.join(TASKS_DIR, location, `${taskId}.md`);
}

export function findTaskFile(taskId: string): { path: string; location: Location } | null {
  for (const loc of LOCATIONS) {
    const filePath = getTaskFilePath(taskId, loc);
    if (fs.existsSync(filePath)) {
      return { path: filePath, location: loc };
    }
  }
  return null;
}

export function parseTaskFile(content: string): ParsedTaskFile {
  const result: ParsedTaskFile = {
    id: '',
    priority: 'medium',
    blocks: [],
    blockedBy: [],
    issue: 'N/A',
    description: '',
    constraints: [],
    acceptanceCriteria: [],
    notes: '',
    rawContent: content,
  };

  // Parse header (first line with #)
  const headerMatch = content.match(/^#\s+(.+)$/m);
  if (headerMatch) {
    result.id = headerMatch[1].trim();
  }

  // Parse metadata
  const priorityMatch = content.match(/\*\*Priority:\*\*\s*(.+)/i);
  if (priorityMatch) result.priority = priorityMatch[1].trim().toLowerCase();

  const blocksMatch = content.match(/\*\*Blocks:\*\*\s*(.+)/i);
  if (blocksMatch && blocksMatch[1].trim().toLowerCase() !== 'none') {
    result.blocks = blocksMatch[1].split(',').map(s => s.trim());
  }

  const blockedByMatch = content.match(/\*\*Blocked By:\*\*\s*(.+)/i);
  if (blockedByMatch && blockedByMatch[1].trim().toLowerCase() !== 'none') {
    result.blockedBy = blockedByMatch[1].split(',').map(s => s.trim());
  }

  const issueMatch = content.match(/\*\*Issue:\*\*\s*(.+)/i);
  if (issueMatch) result.issue = issueMatch[1].trim();

  // Parse sections
  const descMatch = content.match(/## Description\s*\n([\s\S]*?)(?=\n## |$)/);
  if (descMatch) result.description = descMatch[1].trim();

  const constraintsMatch = content.match(/## Constraints\s*\n([\s\S]*?)(?=\n## |$)/);
  if (constraintsMatch) {
    result.constraints = constraintsMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^-\s*/, '').trim());
  }

  const acMatch = content.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |$)/);
  if (acMatch) {
    result.acceptanceCriteria = acMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^-\s*\[.\]\s*/, '').trim());
  }

  const notesMatch = content.match(/## Notes\s*\n([\s\S]*?)(?=\n## |$)/);
  if (notesMatch) result.notes = notesMatch[1].trim();

  return result;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function parseArgs(args: string[]): { positional: string[]; options: Record<string, string> } {
  const positional: string[] = [];
  const options: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value ?? 'true';
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      options[key] = args[++i] ?? 'true';
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

// ============================================================================
// Command Handlers
// ============================================================================

export function showHelp(): void {
  console.log(`
Task Management CLI v2.0

Usage: npm run task -- <command> [arguments] [options]

Commands:
  state <id> <state>              Update task state
                                  Valid states: ${VALID_STATES.join(', ')}

  show <id>                       Display task details

  list [options]                  List tasks with filtering
    --state=<state>               Filter by state
    --location=<loc>              Filter by location (backlog, active, archive)
    --limit=<n>                   Max results (default: 20)

  create <id> [options]           Create new task from template
    --priority=<p>                Priority (high, medium, low)
    --description=<desc>          Brief description

  move <id> <location>            Move task between folders

  archive <id>                    Move task to archive (alias for 'move <id> archive')

  next                            Get next actionable task

  help                            Show this help message

Examples:
  npm run task -- state 065-toastify implemented
  npm run task -- show 065-toastify
  npm run task -- list --state=not_started
  npm run task -- create 069-new-feature --priority=high
  npm run task -- next
`);
}

export function handleState(taskId: string, newState: string): void {
  if (!VALID_STATES.includes(newState as TaskState)) {
    console.error(`Invalid state: ${newState}`);
    console.error(`Valid states: ${VALID_STATES.join(', ')}`);
    process.exit(1);
  }

  const state = loadState();
  const task = state.tasks[taskId];

  if (!task) {
    console.error(`Task not found in state.json: ${taskId}`);
    process.exit(1);
  }

  const currentState = task.state;
  const targetState = newState as TaskState;

  // Validate transition
  if (currentState !== targetState && !TRANSITIONS[currentState].includes(targetState)) {
    console.error(`Invalid transition: ${currentState} → ${targetState}`);
    console.error(
      `Allowed transitions from ${currentState}: ${TRANSITIONS[currentState].join(', ')}`
    );
    process.exit(1);
  }

  // Determine if location change is needed
  const currentLocation = task.location ?? STATE_TO_LOCATION[currentState];
  const targetLocation = STATE_TO_LOCATION[targetState];

  // Move file if location changes
  if (currentLocation !== targetLocation) {
    const taskFile = findTaskFile(taskId);
    if (taskFile) {
      const newPath = getTaskFilePath(taskId, targetLocation);
      fs.renameSync(taskFile.path, newPath);
      console.log(`Moved ${taskId}.md: ${currentLocation}/ → ${targetLocation}/`);
    }
  }

  const isArchivedState = targetState === 'committed' || targetState === 'cancelled';

  if (isArchivedState) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state.tasks[taskId];
    saveState(state);
    console.log(`✓ Removed ${taskId} from state.json (archived)`);
    console.log(`✓ Archived ${taskId}: ${currentState} → ${targetState}`);
  } else {
    task.state = targetState;
    task.location = targetLocation;
    task.lastUpdated = new Date().toISOString();
    saveState(state);
    console.log(`✓ Updated ${taskId}: ${currentState} → ${targetState}`);
  }
}

export function handleShow(taskId: string): void {
  const state = loadState();
  let taskEntry = state.tasks[taskId];

  // If not in state.json, try to find the task file directly
  const taskFile = findTaskFile(taskId);

  if (!taskEntry && !taskFile) {
    console.error(`Task not found: ${taskId}`);
    console.error(`Searched in state.json and docs/tasks/{backlog,active,archive}/`);
    process.exit(1);
  }

  // If task exists as file but not in state.json, infer state from location
  if (!taskEntry && taskFile) {
    const inferredState: TaskState = taskFile.location === 'archive' ? 'committed' : 'not_started';
    taskEntry = {
      state: inferredState,
      lastUpdated: new Date().toISOString(),
      location: taskFile.location,
    };
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Task: ${taskId}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`State:        ${taskEntry.state}`);
  console.log(`Location:     ${taskEntry.location ?? STATE_TO_LOCATION[taskEntry.state]}`);
  console.log(`Last Updated: ${formatDate(taskEntry.lastUpdated)}`);

  if (taskEntry.blockedBy?.length) {
    console.log(`Blocked By:   ${taskEntry.blockedBy.join(', ')}`);
  }

  if (taskEntry.description) {
    console.log(`Description:  ${taskEntry.description}`);
  }

  if (taskEntry.notes) {
    console.log(`Notes:        ${taskEntry.notes}`);
  }

  if (taskFile) {
    const content = fs.readFileSync(taskFile.path, 'utf-8');
    const parsed = parseTaskFile(content);

    console.log(`\n${'─'.repeat(60)}`);
    console.log('Task File Details');
    console.log(`${'─'.repeat(60)}`);
    console.log(`Priority:     ${parsed.priority}`);
    if (parsed.blocks.length) console.log(`Blocks:       ${parsed.blocks.join(', ')}`);
    if (parsed.blockedBy.length) console.log(`Blocked By:   ${parsed.blockedBy.join(', ')}`);
    if (parsed.issue !== 'N/A') console.log(`Issue:        ${parsed.issue}`);

    if (parsed.description) {
      console.log(`\nDescription:\n  ${parsed.description.split('\n').join('\n  ')}`);
    }

    if (parsed.constraints.length) {
      console.log(`\nConstraints:`);
      parsed.constraints.forEach(c => console.log(`  • ${c}`));
    }

    if (parsed.acceptanceCriteria.length) {
      console.log(`\nAcceptance Criteria:`);
      parsed.acceptanceCriteria.forEach(ac => console.log(`  □ ${ac}`));
    }

    if (parsed.notes) {
      console.log(`\nNotes:\n  ${parsed.notes.split('\n').join('\n  ')}`);
    }
  } else {
    console.log(`\n(No task file found in backlog/, active/, or archive/)`);
  }

  console.log(`${'─'.repeat(60)}\n`);
}

export function handleList(options: Record<string, string>): void {
  const state = loadState();
  const filterState = options.state as TaskState | undefined;
  const filterLocation = options.location as Location | undefined;
  const limit = parseInt(options.limit ?? '20', 10);

  // Start with tasks from state.json
  let tasks = Object.entries(state.tasks).map(([id, entry]) => ({
    id,
    ...entry,
    location: entry.location ?? STATE_TO_LOCATION[entry.state],
  }));

  // Also scan backlog and active folders for tasks not in state.json
  for (const loc of ['backlog', 'active'] as const) {
    const dir = path.join(TASKS_DIR, loc);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const taskId = file.replace('.md', '');
        // Only add if not already in tasks list
        if (!tasks.some(t => t.id === taskId)) {
          tasks.push({
            id: taskId,
            state: loc === 'backlog' ? 'not_started' : 'implemented',
            location: loc,
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    }
  }

  // Apply filters
  if (filterState) {
    tasks = tasks.filter(t => t.state === filterState);
  }
  if (filterLocation) {
    tasks = tasks.filter(t => t.location === filterLocation);
  }

  // Sort by lastUpdated (newest first)
  tasks.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  // Limit results
  const displayTasks = tasks.slice(0, limit);
  const hasMore = tasks.length > limit;

  // Display
  console.log(`\nTasks (${displayTasks.length}${hasMore ? ` of ${tasks.length}` : ''}):`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`${'ID'.padEnd(40)} ${'State'.padEnd(15)} ${'Location'.padEnd(10)} Updated`);
  console.log(`${'─'.repeat(80)}`);

  for (const task of displayTasks) {
    const updated = new Date(task.lastUpdated).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    console.log(
      `${task.id.padEnd(40)} ${task.state.padEnd(15)} ${task.location.padEnd(10)} ${updated}`
    );
  }

  if (hasMore) {
    console.log(`\n... and ${tasks.length - limit} more. Use --limit to show more.`);
  }

  console.log();
}

export function handleCreate(taskId: string, options: Record<string, string>): void {
  const state = loadState();

  // Check if task already exists
  if (state.tasks[taskId]) {
    console.error(`Task already exists in state.json: ${taskId}`);
    process.exit(1);
  }

  const existingFile = findTaskFile(taskId);
  if (existingFile) {
    console.error(`Task file already exists: ${existingFile.path}`);
    process.exit(1);
  }

  // Read template
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`Template file not found: ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  let template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

  // Fill in template
  const priority = options.priority ?? 'medium';
  const description = options.description ?? 'TODO: Add description';

  template = template
    .replace(/\{\{TASK_ID\}\}/g, taskId)
    .replace(/\{\{high\|medium\|low\}\}/g, priority)
    .replace(/\{\{comma-separated task IDs or "none"\}\}/g, 'none')
    .replace(/\{\{link to issue or "N\/A"\}\}/g, 'N/A')
    .replace(/\{\{Detailed description.*?\}\}/g, description)
    .replace(/\{\{Technical constraint 1\}\}/g, 'TODO: Add constraint')
    .replace(/\{\{Technical constraint 2\}\}/g, '')
    .replace(/\{\{Pattern or convention to follow\}\}/g, '')
    .replace(/\{\{Measurable criterion 1\}\}/g, 'TODO: Add criterion')
    .replace(/\{\{Measurable criterion 2\}\}/g, '')
    .replace(/\{\{Test requirement\}\}/g, 'Unit tests pass')
    .replace(/\{\{Documentation requirement\}\}/g, '')
    .replace(/\{\{Optional:.*?\}\}/g, '');

  // Clean up empty list items
  template = template
    .split('\n')
    .filter(line => !line.match(/^-\s*$/))
    .join('\n');

  // Write task file to backlog
  const taskFilePath = getTaskFilePath(taskId, 'backlog');
  fs.writeFileSync(taskFilePath, template);

  // Add to state.json
  state.tasks[taskId] = {
    state: 'not_started',
    lastUpdated: new Date().toISOString(),
    location: 'backlog',
    description: description !== 'TODO: Add description' ? description : undefined,
  };
  saveState(state);

  console.log(`✓ Created task: ${taskId}`);
  console.log(`  File: docs/tasks/backlog/${taskId}.md`);
  console.log(`  State: not_started`);
  console.log(`\nEdit the task file to add details.`);
}

export function handleMove(taskId: string, targetLocation: string): void {
  if (!LOCATIONS.includes(targetLocation as Location)) {
    console.error(`Invalid location: ${targetLocation}`);
    console.error(`Valid locations: ${LOCATIONS.join(', ')}`);
    process.exit(1);
  }

  const state = loadState();
  const task = state.tasks[taskId];

  if (!task) {
    console.error(`Task not found in state.json: ${taskId}`);
    process.exit(1);
  }

  const taskFile = findTaskFile(taskId);
  const currentLocation = taskFile?.location ?? task.location ?? STATE_TO_LOCATION[task.state];
  const target = targetLocation as Location;

  if (currentLocation === target) {
    console.log(`Task is already in ${target}/`);
    return;
  }

  // Move file if it exists
  if (taskFile) {
    const newPath = getTaskFilePath(taskId, target);
    fs.renameSync(taskFile.path, newPath);
  }

  // Update state
  task.location = target;
  task.lastUpdated = new Date().toISOString();
  saveState(state);

  console.log(`✓ Moved ${taskId}: ${currentLocation}/ → ${target}/`);
}

export function handleArchive(taskId: string): void {
  handleMove(taskId, 'archive');
}

export function handleNext(): void {
  const state = loadState();

  // Get all active/not_started tasks from state.json
  let candidates = Object.entries(state.tasks)
    .map(([id, entry]) => ({
      id,
      ...entry,
      location: entry.location ?? STATE_TO_LOCATION[entry.state],
    }))
    .filter(t => t.state !== 'committed' && t.state !== 'cancelled')
    .filter(t => t.location !== 'archive');

  // If no candidates in state.json, scan backlog folder for task files
  if (candidates.length === 0) {
    const backlogDir = path.join(TASKS_DIR, 'backlog');
    if (fs.existsSync(backlogDir)) {
      const backlogFiles = fs.readdirSync(backlogDir).filter(f => f.endsWith('.md'));
      const backlogTasks = backlogFiles.map(f => {
        const taskId = f.replace('.md', '');
        return {
          id: taskId,
          state: 'not_started' as TaskState,
          location: 'backlog' as Location,
          lastUpdated: new Date().toISOString(),
        };
      });

      if (backlogTasks.length > 0) {
        // Add discovered backlog tasks to candidates
        candidates = backlogTasks;
      }
    }
  }

  if (candidates.length === 0) {
    console.log('\n🎉 No actionable tasks! All tasks are completed or archived.\n');
    return;
  }

  // Check for tasks with file details for priority sorting
  const tasksWithDetails = candidates.map(task => {
    const taskFile = findTaskFile(task.id);
    let priority = 'medium';
    let blockedBy: string[] = task.blockedBy ?? [];

    if (taskFile) {
      const content = fs.readFileSync(taskFile.path, 'utf-8');
      const parsed = parseTaskFile(content);
      priority = parsed.priority || 'medium';
      if (parsed.blockedBy.length) {
        blockedBy = parsed.blockedBy;
      }
    }

    return { ...task, priority, blockedBy };
  });

  // Filter out blocked tasks
  const unblockedTasks = tasksWithDetails.filter(task => {
    if (!task.blockedBy.length) return true;

    // Check if all blocking tasks are completed/committed
    return task.blockedBy.every(blockerId => {
      // Normalize the blocker ID (remove 'task-' prefix if present)
      const normalizedId = blockerId.replace(/^task-/, '');

      // First check state.json
      const blocker = state.tasks[blockerId] || state.tasks[normalizedId];
      if (blocker && (blocker.state === 'committed' || blocker.state === 'completed')) {
        return true;
      }

      // Then check if the blocker is in the archive folder (implicitly completed)
      const archiveDir = path.join(TASKS_DIR, 'archive');
      if (fs.existsSync(archiveDir)) {
        const archiveFiles = fs.readdirSync(archiveDir);
        // Check both original and normalized ID
        if (
          archiveFiles.includes(`${blockerId}.md`) ||
          archiveFiles.includes(`${normalizedId}.md`)
        ) {
          return true;
        }
      }

      return false;
    });
  });

  if (unblockedTasks.length === 0) {
    console.log('\n⏳ All remaining tasks are blocked. Resolve dependencies first.\n');
    console.log('Blocked tasks:');
    tasksWithDetails.forEach(t => {
      if (t.blockedBy.length) {
        console.log(`  ${t.id} blocked by: ${t.blockedBy.join(', ')}`);
      }
    });
    return;
  }

  // Sort: in-progress first, then by priority, then by state progression
  const stateOrder: Record<string, number> = {
    review_fail: 0,
    implemented: 1,
    unit_tested: 2,
    review_pass: 3,
    completed: 4,
    not_started: 5,
  };

  unblockedTasks.sort((a, b) => {
    // In-progress tasks first (not_started is "not in progress")
    const aInProgress = a.state !== 'not_started' && a.state !== 'completed';
    const bInProgress = b.state !== 'not_started' && b.state !== 'completed';
    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;

    // Then by priority
    const priorityDiff = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by state (closer to completion first)
    return (stateOrder[a.state] ?? 10) - (stateOrder[b.state] ?? 10);
  });

  const nextTask = unblockedTasks[0];
  let taskFile = findTaskFile(nextTask.id);

  // === AUTO-ACTIVATE: Move to active/ and add to state.json if needed ===

  // 1. Ensure task is in state.json
  if (!state.tasks[nextTask.id]) {
    state.tasks[nextTask.id] = {
      state: nextTask.state as TaskState,
      lastUpdated: new Date().toISOString(),
      location: nextTask.location as Location,
    };
    saveState(state);
    console.log(`📝 Added ${nextTask.id} to state.json`);
  }

  // 2. Move file from backlog/ to active/ if it's a not_started task being picked up
  if (taskFile && taskFile.location === 'backlog') {
    const newPath = getTaskFilePath(nextTask.id, 'active');
    fs.renameSync(taskFile.path, newPath);

    // Update state.json location
    state.tasks[nextTask.id].location = 'active';
    state.tasks[nextTask.id].lastUpdated = new Date().toISOString();
    saveState(state);

    console.log(`📦 Moved ${nextTask.id}.md: backlog/ → active/`);

    // Update taskFile reference to new location
    taskFile = { path: newPath, location: 'active' };
    nextTask.location = 'active';
  }

  // === END AUTO-ACTIVATE ===

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`NEXT TASK: ${nextTask.id}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`State:      ${nextTask.state}`);
  console.log(`Priority:   ${nextTask.priority}`);
  console.log(`Location:   ${nextTask.location}`);

  if (taskFile) {
    const content = fs.readFileSync(taskFile.path, 'utf-8');
    const parsed = parseTaskFile(content);

    if (parsed.description) {
      console.log(`\nDescription:\n  ${parsed.description.split('\n').slice(0, 3).join('\n  ')}`);
    }

    if (parsed.acceptanceCriteria.length) {
      console.log(`\nAcceptance Criteria:`);
      parsed.acceptanceCriteria.slice(0, 5).forEach(ac => console.log(`  □ ${ac}`));
      if (parsed.acceptanceCriteria.length > 5) {
        console.log(`  ... and ${parsed.acceptanceCriteria.length - 5} more`);
      }
    }
  }

  // Suggest next action based on state
  console.log(`\nSuggested Action:`);
  switch (nextTask.state) {
    case 'not_started':
      console.log(
        `  Start implementation. When done: npm run task -- state ${nextTask.id} implemented`
      );
      break;
    case 'implemented':
      console.log(
        `  Write/run unit tests. When done: npm run task -- state ${nextTask.id} unit_tested`
      );
      break;
    case 'unit_tested':
      console.log(`  Review the code. If pass: npm run task -- state ${nextTask.id} review_pass`);
      break;
    case 'review_fail':
      console.log(
        `  Fix review issues. When done: npm run task -- state ${nextTask.id} implemented`
      );
      break;
    case 'review_pass':
      console.log(`  Complete the task. When done: npm run task -- state ${nextTask.id} completed`);
      break;
    case 'completed':
      console.log(`  Commit changes. When done: npm run task -- state ${nextTask.id} committed`);
      break;
    default:
      console.log(`  Continue working on this task.`);
  }

  console.log(`${'═'.repeat(60)}\n`);

  // Show queue
  if (unblockedTasks.length > 1) {
    console.log(`Queue (${unblockedTasks.length - 1} more):`);
    unblockedTasks.slice(1, 4).forEach((t, i) => {
      console.log(`  ${i + 2}. ${t.id} [${t.state}] (${t.priority})`);
    });
    if (unblockedTasks.length > 4) {
      console.log(`  ... and ${unblockedTasks.length - 4} more`);
    }
    console.log();
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

export function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const { positional, options } = parseArgs(args);
  const command = positional[0];

  // Handle legacy usage: `npm run task -- <taskId> <state>`
  // If first arg looks like a task ID (contains hyphen) and second is a valid state
  if (
    positional.length === 2 &&
    positional[0].includes('-') &&
    VALID_STATES.includes(positional[1] as TaskState)
  ) {
    handleState(positional[0], positional[1]);
    return;
  }

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    case 'state':
      if (positional.length < 3) {
        console.error('Usage: npm run task -- state <task-id> <new-state>');
        process.exit(1);
      }
      handleState(positional[1], positional[2]);
      break;

    case 'show':
      if (positional.length < 2) {
        console.error('Usage: npm run task -- show <task-id>');
        process.exit(1);
      }
      handleShow(positional[1]);
      break;

    case 'list':
      handleList(options);
      break;

    case 'create':
      if (positional.length < 2) {
        console.error(
          'Usage: npm run task -- create <task-id> [--priority=<p>] [--description=<desc>]'
        );
        process.exit(1);
      }
      handleCreate(positional[1], options);
      break;

    case 'move':
      if (positional.length < 3) {
        console.error('Usage: npm run task -- move <task-id> <location>');
        console.error(`Valid locations: ${LOCATIONS.join(', ')}`);
        process.exit(1);
      }
      handleMove(positional[1], positional[2]);
      break;

    case 'archive':
      if (positional.length < 2) {
        console.error('Usage: npm run task -- archive <task-id>');
        process.exit(1);
      }
      handleArchive(positional[1]);
      break;

    case 'next':
      handleNext();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "npm run task -- help" for usage information.');
      process.exit(1);
  }
}

main();
