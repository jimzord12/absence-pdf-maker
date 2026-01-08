---
description: Commit all changes grouped by their corresponding Tasks
# agent: finisher
subtask: false
---

# Commit Changes

Commit all changes grouped by their corresponding Tasks. Follow these steps:

## Step 1: Get Completed Tasks

Run in terminal:

```bash
npm run task list --state=completed
```

This shows all tasks that are ready to be committed. If no tasks are in `completed` state, inform the user and stop.

## Step 2: Get Task Details

For each completed task, run:

```bash
npm run task show <taskId>
```

This displays:

- Task description
- Acceptance criteria
- Related files/components (infer from description)

## Step 3: Load Git Changes

Run:

```bash
git status
git diff --name-only
```

Get all untracked and modified files.

## Step 4: Map Changes to Tasks

For each completed task, analyze its description and acceptance criteria to determine which files belong to it. Look for patterns like:

- Task-specific file paths mentioned in description
- Component/service names matching task descriptions
- Test files corresponding to implementation files
- Configuration files mentioned in acceptance criteria

## Step 5: Generate Commit Plan

Create a plan that groups all changes by their corresponding tasks. For each task:

- List all files that belong to it
- Create a commit message following the pattern: `<task-identifier>: <brief description>`

## Step 6: Handle Unrelated Changes

If there are changes that do NOT belong to any completed task:

- List them separately as "Unrelated Changes"
- Do NOT add or commit these files
- Inform the user about these files

## Step 7: Execute Commits

For each task, in sequence:

1. **Archive the task first** (so the move is included in the commit):

   ```bash
   npm run task state <taskId> committed
   ```

   This automatically:

   - Moves the task file from `active/` to `archive/`
   - Removes the task entry from `state.json`

2. **Stage files**:

   ```bash
   git add <task-related-files>
   git add docs/tasks/archive/<taskId>.md
   git add docs/tasks/state.json
   ```

3. **Commit**:
   ```bash
   git commit -m "<taskId>: <brief description>"
   ```

## Step 8: Report Results

After all commits, show:

- Number of tasks committed
- Summary of files committed per task
- Any errors encountered
- Remaining tasks (run `npm run task list` to show)

## CLI Command Reference

| Command                               | Purpose                                        |
| ------------------------------------- | ---------------------------------------------- |
| `npm run task list --state=completed` | Find tasks ready to commit                     |
| `npm run task show <id>`              | Get task details                               |
| `npm run task state <id> committed`   | Archive task (moves file + updates state.json) |
| `npm run task list`                   | Show remaining tasks                           |

