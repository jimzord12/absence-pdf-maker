---
description: Commit all changes grouped by their corresponding Tasks
# agent: finisher
subtask: false
---

# Commit Changes

Commit all changes grouped by their corresponding Tasks. Follow these steps:

1. **Check State Cleanup**: Run `tasks_checkArchivedState` tool to verify there are no tasks with `"location": "archive"` in `docs/tasks/state.json`. If archived tasks exist, they **should be removed** before proceeding (state.json should only track non-archived tasks).

2. **Read Task State**: Load `docs/tasks/state.json` to see which tasks are in the `completed` state (i.e., NOT `committed`)

3. **Read Task Definitions**: Read individual task files from `docs/tasks/active/<taskId>.md` to understand each task's description, acceptance criteria, and files involved

4. **Load Git Changes**: Get all untracked and modified files using `git status` and `git diff`

5. **Map Changes to Tasks**: For each task that is NOT in `committed` state, analyze its description and acceptance criteria to determine which files belong to it. Look for patterns like:

   - Task-specific file paths (e.g., `src/features/leave-request/ui/SignatureModal.tsx` for `013-task-signature-modal`)
   - Component/service names matching task descriptions
   - Test files corresponding to implementation files
   - Configuration files mentioned in task acceptance criteria

6. **Generate Commit Plan**: Create a plan that groups all changes by their corresponding tasks. For each task:

   - List all files that belong to it
   - Create a commit message that describes the task work
   - Ensure commit message follows the pattern: `<task-identifier>: <brief description>`

7. **Handle Unrelated Changes**: If there are changes that do NOT belong to any task:

   - List them separately as "Unrelated Changes"
   - Do NOT add or commit these files
   - Inform the user about these files

8. **Move Task Files**: Completed Tasks need to be moved from `docs/tasks/active/` to `docs/tasks/archive/` before their changes are committed, in order for the commit to reflect the task's completion.

9. **Execute Commits**:

   - For each task: `git add <files>` and `git commit -m "<message>"`
   - Move task file from `active/` or `backlog/` to `archive/`
   - **IMPORTANT**: Remove the task entry from `docs/tasks/state.json` (archived tasks are NOT tracked in state.json)
   - Report successful commits

10. **Report Results**: After all commits, show:
    - Number of tasks committed
    - Summary of files committed
    - Any errors encountered
    - Current state of task tracking

