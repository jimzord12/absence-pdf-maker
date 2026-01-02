import * as fs from 'node:fs';
import * as path from 'node:path';

const STATE_FILE = path.resolve(process.cwd(), 'docs/tasks/state.json');

type TaskState =
  | 'not_started'
  | 'implemented'
  | 'unit_tested'
  | 'review_fail'
  | 'review_pass'
  | 'completed'
  | 'cancelled'
  | 'committed';

interface Task {
  state: TaskState;
  lastUpdated: string;
  description?: string;
  blockedBy?: string[];
}

interface StateJson {
  $schema: string;
  tasks: Record<string, Task>;
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

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npm run task -- <task-id> <new-state>');
    process.exit(1);
  }

  const [taskId, newState] = args as [string, TaskState];

  if (!VALID_STATES.includes(newState)) {
    console.error(`Invalid state: ${newState}. Valid states are: ${VALID_STATES.join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(STATE_FILE)) {
    console.error(`State file not found at ${STATE_FILE}`);
    process.exit(1);
  }

  const stateData: StateJson = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const task = stateData.tasks[taskId];

  if (!task) {
    console.error(`Task not found: ${taskId}`);
    process.exit(1);
  }

  const currentState = task.state;

  // Validate transition
  if (currentState !== newState && !TRANSITIONS[currentState].includes(newState)) {
    console.error(`Invalid transition: ${currentState} -> ${newState}`);
    console.error(
      `Allowed transitions from ${currentState}: ${TRANSITIONS[currentState].join(', ')}`
    );
    process.exit(1);
  }

  // Update task
  task.state = newState;
  task.lastUpdated = new Date().toISOString();

  fs.writeFileSync(STATE_FILE, JSON.stringify(stateData, null, 2) + '\n');
  console.log(`Successfully updated task ${taskId} to state ${newState}`);
}

main();
