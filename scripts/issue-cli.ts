#!/usr/bin/env node
/**
 * Issue Management CLI v1.0
 *
 * Commands:
 *   state <id> <state>       Update issue state
 *   show <id>                Display issue details
 *   list [--state] [--location]  List issues with filtering
 *   create <id>              Create new issue from template
 *   move <id> <location>     Move issue between folders
 *   resolve <id>             Set issue to Resolved state
 *   close <id>               Set issue to Closed state
 *   open <id>                Set issue to Open state
 *   help                     Show help
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// Constants & Types
// ============================================================================

const ISSUES_DIR = path.resolve(process.cwd(), 'docs/issues');
const TEMPLATE_FILE = path.resolve(process.cwd(), 'docs/templates/ISSUE-TEMPLATE.md');

const LOCATIONS = ['open', 'in-progress', 'closed', 'discarded'] as const;
type Location = (typeof LOCATIONS)[number];

type IssueState = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

interface ParsedIssueFile {
  id: string;
  component: string;
  dateDiscovered: string;
  status: IssueState;
  priority: string;
  taskId: string;
  summary: string;
  problemDescription: string;
  stepsToReproduce: string[];
  technicalDetails: string;
  potentialCauses: string[];
  suggestedSolutions: string[];
  additionalNotes: string;
  relatedIssues: string[];
  rawContent: string;
}

const VALID_STATES: IssueState[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

// Status to location mapping
const STATUS_TO_LOCATION: Record<IssueState, Location> = {
  Open: 'open',
  'In Progress': 'in-progress',
  Resolved: 'closed',
  Closed: 'closed',
};

// Priority order for sorting (lower = higher priority)
const PRIORITY_ORDER: Record<string, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

// ============================================================================
// Utility Functions
// ============================================================================

export function getIssueFilePath(issueId: string, location: Location): string {
  return path.join(ISSUES_DIR, location, `${issueId}.md`);
}

export function findIssueFile(issueId: string): { path: string; location: Location } | null {
  for (const loc of LOCATIONS) {
    const filePath = getIssueFilePath(issueId, loc);
    if (fs.existsSync(filePath)) {
      return { path: filePath, location: loc };
    }
  }
  return null;
}

export function parseIssueFile(content: string): ParsedIssueFile {
  const result: ParsedIssueFile = {
    id: '',
    component: 'N/A',
    dateDiscovered: new Date().toISOString().split('T')[0],
    status: 'Open',
    priority: 'Medium',
    taskId: 'None',
    summary: '',
    problemDescription: '',
    stepsToReproduce: [],
    technicalDetails: '',
    potentialCauses: [],
    suggestedSolutions: [],
    additionalNotes: '',
    relatedIssues: [],
    rawContent: content,
  };

  // Parse header (first line with #)
  const headerMatch = content.match(/^#\s+(.+)$/m);
  if (headerMatch) {
    result.id = headerMatch[1].trim();
  }

  // Parse metadata
  const idMatch = content.match(/\*\*Issue ID:\*\*\s*(.+)/i);
  if (idMatch) result.id = idMatch[1].trim();

  const componentMatch = content.match(/\*\*Component:\*\*\s*(.+)/i);
  if (componentMatch) result.component = componentMatch[1].trim();

  const dateMatch = content.match(/\*\*Date Discovered:\*\*\s*(.+)/i);
  if (dateMatch) result.dateDiscovered = dateMatch[1].trim();

  const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/i);
  if (statusMatch) result.status = statusMatch[1].trim() as IssueState;

  const priorityMatch = content.match(/\*\*Priority:\*\*\s*(.+)/i);
  if (priorityMatch) result.priority = priorityMatch[1].trim();

  const taskIdMatch = content.match(/\*\*Task ID:\*\*\s*(.+)/i);
  if (taskIdMatch) result.taskId = taskIdMatch[1].trim();

  // Parse sections
  const summaryMatch = content.match(/## Summary\s*\n([\s\S]*?)(?=\n## |$)/);
  if (summaryMatch) result.summary = summaryMatch[1].trim();

  const problemMatch = content.match(/## Problem Description\s*\n([\s\S]*?)(?=\n## |$)/);
  if (problemMatch) result.problemDescription = problemMatch[1].trim();

  const stepsMatch = content.match(/## Steps to Reproduce\s*\n([\s\S]*?)(?=\n## |$)/);
  if (stepsMatch) {
    const lines = stepsMatch[1]
      .split('\n')
      .filter(l => l.trim().match(/^\d+\./))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
    result.stepsToReproduce = lines;
  }

  const techDetailsMatch = content.match(/## Technical Details\s*\n([\s\S]*?)(?=\n## |$)/);
  if (techDetailsMatch) result.technicalDetails = techDetailsMatch[1].trim();

  const causesMatch = content.match(/## Potential Causes\s*\n([\s\S]*?)(?=\n## |$)/);
  if (causesMatch) {
    const lines = causesMatch[1]
      .split('\n')
      .filter(l => l.trim().match(/^###\s+\d+\./))
      .map(l => l.replace(/^###\s+\d+\.\s*/, '').trim());
    result.potentialCauses = lines;
  }

  const solutionsMatch = content.match(/## Suggested Solutions\s*\n([\s\S]*?)(?=\n## |$)/);
  if (solutionsMatch) {
    const lines = solutionsMatch[1]
      .split('\n')
      .filter(l => l.trim().match(/^###\s+/))
      .map(l => l.replace(/^###\s+/, '').trim());
    result.suggestedSolutions = lines;
  }

  const notesMatch = content.match(/## Additional Notes\s*\n([\s\S]*?)(?=\n## |$)/);
  if (notesMatch) result.additionalNotes = notesMatch[1].trim();

  const relatedMatch = content.match(/## Related Issues\s*\n([\s\S]*?)(?=\n## |$)/);
  if (relatedMatch) {
    const lines = relatedMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^-\s*/, '').trim());
    result.relatedIssues = lines;
  }

  return result;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function parseArgs(args: string[]): {
  positional: string[];
  options: Record<string, string>;
} {
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
Issue Management CLI v1.0

Usage: npm run issue -- <command> [arguments] [options]

Commands:
  state <id> <state>              Update issue state
                                   Valid states: ${VALID_STATES.join(', ')}

  show <id>                       Display issue details

  list [options]                  List issues with filtering
    --state=<state>               Filter by state
    --location=<loc>              Filter by location (open, in-progress, closed, discarded)
    --priority=<p>                Filter by priority (Critical, High, Medium, Low)
    --limit=<n>                   Max results (default: 20)

  create <id> [options]           Create new issue from template
    --priority=<p>                Priority (Critical, High, Medium, Low)
    --component=<comp>            Component/feature area
    --title=<title>               Brief title
    --summary=<summary>           One or two sentence summary

  move <id> <location>            Move issue between folders

  resolve <id>                    Set issue to Resolved state (moves to closed/)

  close <id>                      Set issue to Closed state (moves to closed/)

  open <id>                       Set issue to Open state (moves to open/)

  help                            Show this help message

Examples:
  npm run issue -- state 021 "In Progress"
  npm run issue -- show 021
  npm run issue -- list --state=Open
  npm run issue -- create 023-new-issue --priority=High --component=PDF
  npm run issue -- resolve 021
`);
}

export function handleState(issueId: string, newState: string): void {
  if (!VALID_STATES.includes(newState as IssueState)) {
    console.error(`Invalid state: ${newState}`);
    console.error(`Valid states: ${VALID_STATES.join(', ')}`);
    process.exit(1);
  }

  const issueFile = findIssueFile(issueId);
  if (!issueFile) {
    console.error(`Issue not found: ${issueId}`);
    console.error(`Searched in docs/issues/{open,in-progress,closed,discarded}/`);
    process.exit(1);
  }

  const targetState = newState as IssueState;
  const targetLocation = STATUS_TO_LOCATION[targetState];

  // Move file if location changes
  if (issueFile.location !== targetLocation) {
    const newPath = getIssueFilePath(issueId, targetLocation);
    const content = fs.readFileSync(issueFile.path, 'utf-8');

    // Update status in file
    const updatedContent = content.replace(/(\*\*Status:\*\*\s*)([^\n]+)/i, `$1${targetState}`);

    fs.writeFileSync(newPath, updatedContent);
    fs.unlinkSync(issueFile.path);
    console.log(`Moved ${issueId}.md: ${issueFile.location}/ → ${targetLocation}/`);
    console.log(`✓ Updated ${issueId}: status → ${targetState}`);
  } else {
    // Just update status in file
    const content = fs.readFileSync(issueFile.path, 'utf-8');
    const updatedContent = content.replace(/(\*\*Status:\*\*\s*)([^\n]+)/i, `$1${targetState}`);
    fs.writeFileSync(issueFile.path, updatedContent);
    console.log(`✓ Updated ${issueId}: status → ${targetState}`);
  }
}

export function handleShow(issueId: string): void {
  const issueFile = findIssueFile(issueId);

  if (!issueFile) {
    console.error(`Issue not found: ${issueId}`);
    console.error(`Searched in docs/issues/{open,in-progress,closed,discarded}/`);
    process.exit(1);
  }

  const content = fs.readFileSync(issueFile.path, 'utf-8');
  const parsed = parseIssueFile(content);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Issue: ${parsed.id}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Status:       ${parsed.status}`);
  console.log(`Priority:     ${parsed.priority}`);
  console.log(`Location:     ${issueFile.location}`);
  console.log(`Component:    ${parsed.component}`);
  console.log(`Task ID:      ${parsed.taskId}`);
  console.log(`Discovered:   ${formatDate(parsed.dateDiscovered)}`);

  if (parsed.summary) {
    console.log(`\nSummary:\n  ${parsed.summary.split('\n').join('\n  ')}`);
  }

  if (parsed.problemDescription) {
    console.log(
      `\nProblem Description:\n  ${parsed.problemDescription.split('\n').slice(0, 5).join('\n  ')}`
    );
    if (parsed.problemDescription.split('\n').length > 5) {
      console.log('  ...');
    }
  }

  if (parsed.relatedIssues.length) {
    console.log(`\nRelated Issues: ${parsed.relatedIssues.join(', ')}`);
  }

  console.log(`${'─'.repeat(60)}\n`);
}

export function handleList(options: Record<string, string>): void {
  const filterState = options.state as IssueState | undefined;
  const filterLocation = options.location as Location | undefined;
  const filterPriority = options.priority as Priority | undefined;
  const limit = parseInt(options.limit ?? '20', 10);

  // Collect all issue files
  const issues: {
    id: string;
    status: IssueState;
    priority: string;
    component: string;
    location: Location;
    dateDiscovered: string;
    taskId: string;
  }[] = [];

  for (const loc of LOCATIONS) {
    const dir = path.join(ISSUES_DIR, loc);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const issueId = file.replace('.md', '');
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseIssueFile(content);

        issues.push({
          id: issueId,
          status: parsed.status,
          priority: parsed.priority,
          component: parsed.component,
          location: loc,
          dateDiscovered: parsed.dateDiscovered,
          taskId: parsed.taskId,
        });
      }
    }
  }

  // Apply filters
  if (filterState) {
    const normalizedFilter = filterState.trim();
    issues.splice(0, issues.length, ...issues.filter(i => i.status === normalizedFilter));
  }
  if (filterLocation) {
    issues.splice(0, issues.length, ...issues.filter(i => i.location === filterLocation));
  }
  if (filterPriority) {
    const normalizedFilter = filterPriority.trim();
    issues.splice(
      0,
      issues.length,
      ...issues.filter(i => i.priority.toLowerCase() === normalizedFilter.toLowerCase())
    );
  }

  // Sort: by priority (critical first), then by date discovered (newest first)
  issues.sort((a, b) => {
    const priorityDiff =
      (PRIORITY_ORDER[a.priority.toLowerCase()] ?? 3) -
      (PRIORITY_ORDER[b.priority.toLowerCase()] ?? 3);
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(b.dateDiscovered).getTime() - new Date(a.dateDiscovered).getTime();
  });

  // Limit results
  const displayIssues = issues.slice(0, limit);
  const hasMore = issues.length > limit;

  // Display
  console.log(`\nIssues (${displayIssues.length}${hasMore ? ` of ${issues.length}` : ''}):`);
  console.log(`${'─'.repeat(85)}`);
  console.log(
    `${'ID'.padEnd(15)} ${'State'.padEnd(12)} ${'Priority'.padEnd(10)} ${'Component'.padEnd(
      20
    )} Updated`
  );
  console.log(`${'─'.repeat(85)}`);

  for (const issue of displayIssues) {
    const updated = formatDate(issue.dateDiscovered);
    console.log(
      `${issue.id.padEnd(15)} ${issue.status.padEnd(12)} ${issue.priority.padEnd(
        10
      )} ${issue.component.padEnd(20)} ${updated}`
    );
  }

  if (hasMore) {
    console.log(`\n... and ${issues.length - limit} more. Use --limit to show more.`);
  }

  console.log();
}

export function handleCreate(issueId: string, options: Record<string, string>): void {
  // Check if issue already exists
  const existingFile = findIssueFile(issueId);
  if (existingFile) {
    console.error(`Issue file already exists: ${existingFile.path}`);
    process.exit(1);
  }

  // Read template
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`Template file not found: ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  let template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

  // Fill in template
  const priority = options.priority ?? 'Medium';
  const component = options.component ?? 'N/A';
  const title = options.title ?? 'TODO: Add title';
  const summary = options.summary ?? 'TODO: Add summary';
  const dateDiscovered = new Date().toISOString().split('T')[0];

  template = template
    .replace(/\[Brief Title\]/g, title)
    .replace(/\[XXX\]/g, issueId)
    .replace(/\[Component \/ Feature Area\]/g, component)
    .replace(/\[YYYY-MM-DD\]/g, dateDiscovered)
    .replace(/\[Open \| In Progress \| Resolved \| Closed\]/g, 'Open')
    .replace(/\[Critical \| High \| Medium \| Low\]/g, priority)
    .replace(/\[None \| Task identifier if converted to task\]/g, 'None')
    .replace(/\[One or two sentences describing the issue at a high level\.\]/g, summary)
    .replace(/\[First step\]/g, 'TODO: Add first step')
    .replace(/\[Second step\]/g, 'TODO: Add second step')
    .replace(/\[Third step\]/g, '')
    .replace(/\[What user should see\]/g, '')
    .replace(/\[What should happen\]/g, '')
    .replace(/\[What actually happens\]/g, '')
    .replace(/\[Description of why this might be cause and evidence for\/against\]/g, '')
    .replace(/\[Description of workaround\]/g, '')
    .replace(/\[Pros\/cons or limitations\]/g, '')
    .replace(/\[Implementation steps\]/g, '')
    .replace(/\[Expected outcome\]/g, '')
    .replace(/\[Description of larger refactor or redesign\]/g, '')
    .replace(/\[Benefits\]/g, '')
    .replace(/\[Any other relevant information\]/g, '')
    .replace(/\[Tools used for investigation\]/g, '')
    .replace(/\[Observations that don't fit elsewhere\]/g, '')
    .replace(
      /\[#XXX - Related Issue Title\]\(link\) or "None documented yet"/g,
      'None documented yet'
    )
    .replace(/\[File or resource\]: `\[path\/to\/relevant\/file\.ts\]`/g, '')
    .replace(/\[Documentation\]: \[Link or path\]/g, '')
    .replace(/\[path\/to\/file\.ts:lineNumber\]/g, '')
    .replace(/\[path\/to\/file\.ts\]/g, '')
    .replace(/\[Description of what was found\]/g, '')
    .replace(/\[Logs, screenshots, or other proof\]/g, '')
    .replace(/\[Description of fix or "None yet"\]/g, 'None yet')
    .replace(/\[Explanation of why this is happening\]/g, '')
    .replace(/\[Logs, console output, behavior observed\]/g, '')
    .replace(/\[First Finding Title\]/g, '')
    .replace(/\[Second Finding Title\]/g, '')
    .replace(/\[What user does\]/g, '')
    .replace(/\[What happens\]/g, '')
    .replace(/\[What is wrong or unexpected\]/g, '')
    .replace(/\[Property\]/g, '')
    .replace(/\[Value\]/g, '')
    .replace(/\[Relevant System\/Configuration\]/g, '')
    .replace(/\[Diagram or textual representation of how data flows through system\]/g, '')
    .replace(/\[Line X-Y: Description of relevant code\]/g, '')
    .replace(/\[Cause Category\]/g, '');

  // Clean up empty list items
  template = template
    .split('\n')
    .filter(line => !line.match(/^-\s*$/))
    .filter(line => !line.match(/^\s*\$\{[^}]+\}\s*$/))
    .filter(line => line.trim() !== '')
    .join('\n');

  // Write issue file to open
  const issueFilePath = getIssueFilePath(issueId, 'open');
  fs.writeFileSync(issueFilePath, template);

  console.log(`✓ Created issue: ${issueId}`);
  console.log(`  File: docs/issues/open/${issueId}.md`);
  console.log(`  Status: Open`);
  console.log(`\nEdit issue file to add details.`);
}

export function handleMove(issueId: string, targetLocation: string): void {
  if (!LOCATIONS.includes(targetLocation as Location)) {
    console.error(`Invalid location: ${targetLocation}`);
    console.error(`Valid locations: ${LOCATIONS.join(', ')}`);
    process.exit(1);
  }

  const issueFile = findIssueFile(issueId);
  if (!issueFile) {
    console.error(`Issue not found: ${issueId}`);
    console.error(`Searched in docs/issues/{open,in-progress,closed,discarded}/`);
    process.exit(1);
  }

  const target = targetLocation as Location;

  if (issueFile.location === target) {
    console.log(`Issue is already in ${target}/`);
    return;
  }

  const newPath = getIssueFilePath(issueId, target);
  fs.renameSync(issueFile.path, newPath);

  console.log(`✓ Moved ${issueId}: ${issueFile.location}/ → ${target}/`);
}

export function handleResolve(issueId: string): void {
  handleState(issueId, 'Resolved');
}

export function handleClose(issueId: string): void {
  handleState(issueId, 'Closed');
}

export function handleOpen(issueId: string): void {
  handleState(issueId, 'Open');
}

// ============================================================================
// Main Entry Point
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const { positional, options } = parseArgs(args);
  const command = positional[0];

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    case 'state':
      if (positional.length < 3) {
        console.error('Usage: npm run issue -- state <issue-id> <new-state>');
        process.exit(1);
      }
      handleState(positional[1], positional[2]);
      break;

    case 'show':
      if (positional.length < 2) {
        console.error('Usage: npm run issue -- show <issue-id>');
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
          'Usage: npm run issue -- create <issue-id> [--priority=<p>] [--component=<comp>] [--title=<title>] [--summary=<summary>]'
        );
        process.exit(1);
      }
      handleCreate(positional[1], options);
      break;

    case 'move':
      if (positional.length < 3) {
        console.error('Usage: npm run issue -- move <issue-id> <location>');
        console.error(`Valid locations: ${LOCATIONS.join(', ')}`);
        process.exit(1);
      }
      handleMove(positional[1], positional[2]);
      break;

    case 'resolve':
      if (positional.length < 2) {
        console.error('Usage: npm run issue -- resolve <issue-id>');
        process.exit(1);
      }
      handleResolve(positional[1]);
      break;

    case 'close':
      if (positional.length < 2) {
        console.error('Usage: npm run issue -- close <issue-id>');
        process.exit(1);
      }
      handleClose(positional[1]);
      break;

    case 'open':
      if (positional.length < 2) {
        console.error('Usage: npm run issue -- open <issue-id>');
        process.exit(1);
      }
      handleOpen(positional[1]);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "npm run issue -- help" for usage information.');
      process.exit(1);
  }
}

main();

