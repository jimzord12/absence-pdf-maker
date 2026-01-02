---
description: Generate a structured TODO list from an Issue Report.
agent: implementor
subtask: true
---

# TODO from Issue

Generate a structured `todoList` using the `manage_todo_list` tool based on an Issue Report.

## Workflow

1. **Read Issue**:

   - Read the issue report specified in `$ARGUMENTS` from `docs/issues/open/`.

2. **Analyze Requirements**:

   - Extract the "Suggested Solutions" and "Steps to Reproduce".
   - Identify the files that need to be modified.

3. **Create TODO List**:

   - Use `manage_todo_list` to initialize a list of actionable steps.
   - Ensure steps include:
     - Reproduction of the issue (if possible).
     - Implementation of the fix.
     - Verification/Testing.
     - Updating the issue status.

4. **Start Work**:
   - Mark the first step as `in-progress`.
