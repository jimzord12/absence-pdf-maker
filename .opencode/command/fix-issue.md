---
description: Fix a reported issue by analyzing the report, creating a fix plan, implementing the fix, and updating the issue status.
agent: orchestrator
subtask: false
---

# Fix Issue

## Issues Location

- `docs/issues`

## Issues Format

See `docs/templates/ISSUE-TEMPLATE.md` for the standard issue report format.

## Steps to Fix

1. **Identify the Issue Report:**

   - Parse User Input: $ARGUMENTS

   - if no argument is provided, search for the first Not Completed issue report in the `docs/issues` directory.
   - if an argument is provided, treat it as the issue ID or title to locate the specific issue report file.

2. **Analyze the Issue Report:**

   - Read the identified issue report file.
   - Extract key details such as symptoms, investigation findings, steps to reproduce, and technical details.

3. **Create a Fix Plan:**

   - Based on the analysis, outline a plan to address the issue.
   - **Complexity Check**: If the fix requires changes to multiple files or complex logic, suggest converting the issue to a formal task using `/issue-to-task` instead of fixing it directly.
   - This may include code changes, configuration updates, or other necessary actions.

4. **Pasue and Wait for Confirmation:**

   - Present the fix plan to the user for review.
   - Await user confirmation before proceeding with the implementation.

5. **Develop a Fix:**

   - Based on the analysis, determine the necessary code changes to resolve the issue.
   - Implement the fix in the relevant code files.

6. **Test the Fix:**

   - Reproduce the steps outlined in the issue report to verify that the fix resolves the problem
   - Ensure no new issues are introduced.
   - You should run any relevant unit tests or integration tests to confirm the fix.
   - You should also create any new tests if necessary to cover the fix.

7. **Notify the user**:

   - Provide a summary of the changes made.
   - Ask the user to review and confirm that the issue is resolved.

8. **Update the Issue Report:**

   - Document the fix in the issue report, including.
   - Update the Report's Status to "Completed".
   - Recommend to the user to commit the changes if the user is satisfied.

9. **Close the Issue (After Commit):**
   - Once the fix is committed, move the issue file from `docs/issues/open/` to `docs/issues/closed/`
   - If the issue has a linked Task (check `**Task ID:**` field), verify the task is also marked as `committed` in `docs/tasks/state.json`
