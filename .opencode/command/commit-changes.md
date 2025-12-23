---
description: Commit all changes grouped by their corresponding Tasks
agent: finisher
subtask: false
---

# Commit Changes

Commit all changes grouped by their corresponding Tasks. Follow these steps:

1. **Read Task State**: Load `docs/tasks/state.json` to see which tasks are in `not_started`, `implemented`, `unit_tested`, `review_fail`, `review_pass`, or `completed` state (i.e., NOT `committed`)

2. **Read Task Definitions**: Load `docs/tasks/TASKS.md` to understand each task's description, acceptance criteria, and files involved

3. **Load Git Changes**: Get all untracked and modified files using `git status` and `git diff`

4. **Map Changes to Tasks**: For each task that is NOT in `committed` state, analyze its description and acceptance criteria to determine which files belong to it. Look for patterns like:
   - Task-specific file paths (e.g., `src/features/leave-request/ui/SignatureModal.tsx` for `013-task-signature-modal`)
   - Component/service names matching task descriptions
   - Test files corresponding to implementation files
   - Configuration files mentioned in task acceptance criteria

5. **Generate Commit Plan**: Create a plan that groups all changes by their corresponding tasks. For each task:
   - List all files that belong to it
   - Create a commit message that describes the task work
   - Ensure commit message follows the pattern: `<task-identifier>: <brief description>`

6. **Handle Unrelated Changes**: If there are changes that do NOT belong to any task:
   - List them separately as "Unrelated Changes"
   - Do NOT add or commit these files
   - Inform the user about these files

7. **Present Plan to User**: Display the commit plan showing:
   - Each task with its commit message
   - Files to be added and committed for each task
   - Any unrelated changes that will be skipped
   - Ask for user confirmation before proceeding

8. **Execute Commits**: After confirmation:
   - For each task: `git add <files>` and `git commit -m "<message>"`
   - Update `docs/tasks/state.json` to mark each committed task as `"state": "committed"`
   - Report successful commits

9. **Report Results**: After all commits, show:
   - Number of tasks committed
   - Summary of files committed
   - Any errors encountered
   - Current state of task tracking
