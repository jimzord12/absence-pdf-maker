---
description: Convert open issues to tasks in TASKS.md with proper state tracking.
agent: orchestrator
subtask: false
---

# Issue to Task Converter

Convert issue reports from `docs/issues/open/` into actionable tasks in `docs/tasks/TASKS.md`.

## Arguments

- `$ARGUMENTS` - Optional issue ID (e.g., `006`, `012`) or issue filename
- If no argument provided: Process ALL open issues that don't have corresponding tasks

## Workflow

### Step 1: Parse Arguments

```plaintext
IF $ARGUMENTS is empty:
  → Batch mode: Convert all open issues without existing tasks
ELSE:
  → Single mode: Convert the specified issue to a task
```

### Step 2: Gather Current State

1. **Read existing tasks:**

   - Parse `docs/tasks/TASKS.md` to extract all task identifiers
   - Parse `docs/tasks/state.json` to get task states

2. **Read open issues:**

   - List all files in `docs/issues/open/`
   - Extract issue IDs from filenames (format: `XXX-*.md`)

3. **Read Feature Observations**:
   - Read `docs/tasks/TODO.md` to see if any issues are documented there but not yet converted to formal reports or tasks.

### Step 3: Identify Issues to Convert

For each open issue, check if a corresponding task already exists:

```plaintext
Issue ID: 012
Possible Task Patterns:
  - *-fix-issue-012-*
  - *-issue-012-*
  - Task description mentions "issue 012" or "issue #012"
```

**Skip if:**

- A task with matching pattern already exists in TASKS.md
- The issue is already referenced in an existing task's description

**Process if:**

- No matching task found

### Step 4: Convert Issue to Task

For each issue to convert:

1. **Read the issue file** completely

2. **Extract key information:**

   - Issue ID
   - Issue Title (from `# Issue Report: [Title]`)
   - Summary
   - Problem Description
   - Suggested Solutions (especially "Medium Term" fixes)
   - Relevant Files
   - Priority

3. **Determine task number:**

   - Find the highest task number in `docs/tasks/state.json`
   - New task number = highest + 1

4. **Generate task identifier:**

   ```plaintext
   Format: {task_number}-fix-issue-{issue_id}-{short-description}
   Example: 055-fix-issue-006-ui-text-wrapping
   ```

5. **Create task entry in TASKS.md format:**

```markdown
### {task_identifier}

**Identifier:** `{task_identifier}`

**Description:**
{Derived from issue Summary and Problem Description}

**Constraints:**

- {Derived from Technical Details and architecture}
- Must follow project code style (AGENTS.md)
- Must pass lint and typecheck

**Acceptance Criteria:**

- [ ] {Derived from Suggested Solutions}
- [ ] {Additional criteria from problem description}
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests for new/modified functionality

---
```

6. **Add task to state.json:**

   ```json
   "{task_identifier}": {
     "state": "not_started",
     "lastUpdated": "{current ISO datetime}",
     "description": "{brief description}",
     "fromIssue": "{issue_id}",
     "blockedBy": []
   }
   ```

7. **Update the Issue File (Two-Way Link):**

   - Open the issue file and update the `**Task ID:**` field with the new task identifier
   - Example: Change `**Task ID:** None` to `**Task ID:** 055-fix-issue-006-ui-text-wrapping`
   - Update `**Status:**` from `Open` to `In Progress`

8. **Update TODO.md (Optional):**
   - If the issue was listed in `docs/tasks/TODO.md`, add a reference to the new task ID next to the issue heading (e.g., `## Issue #01 [Task 047]`).

### Step 5: Handle Dependencies

When creating tasks, check if issues reference other issues:

- If issue mentions "depends on issue X" or "blocked by issue X":
  - Add the corresponding task to `blockedBy` array
  - If blocking task doesn't exist, note it for creation first

### Step 6: Output Report

Provide a summary to the user:

```markdown
## Issue to Task Conversion Report

### Converted Issues

| Issue ID | Task Identifier                    | Description                |
| -------- | ---------------------------------- | -------------------------- |
| 006      | 055-fix-issue-006-ui-text-wrapping | UI fixes for text wrapping |
| 007      | 056-fix-issue-007-pdf-generation   | Fix PDF generation failure |

### Skipped Issues (Already Have Tasks)

| Issue ID | Existing Task                                 |
| -------- | --------------------------------------------- |
| 012      | 051-fix-issue-012-personal-details-validation |

### Issues Requiring Manual Review

| Issue ID | Reason                                                     |
| -------- | ---------------------------------------------------------- |
| 014      | Multiple problems - consider splitting into separate tasks |

### Next Steps

1. Review the generated tasks in TASKS.md
2. Adjust acceptance criteria if needed
3. Start implementation with: `/implement-task {task_identifier}`
```

## Conversion Rules

### Task Description

- Combine issue Summary + first paragraph of Problem Description
- Keep it action-oriented ("Fix...", "Implement...", "Add...")
- Maximum 2-3 sentences

### Constraints

- Always include: "Must follow project code style (AGENTS.md)"
- Include technology constraints from issue (Zod, React Hook Form, etc.)
- Include architectural constraints (vertical slice, etc.)
- Include any explicit constraints from issue

### Acceptance Criteria

- Convert "Suggested Solutions" items to checkboxes
- Convert "Expected behavior" from Steps to Reproduce
- Add standard criteria:
  - [ ] No TypeScript errors
  - [ ] No console errors
  - [ ] Relevant tests added/updated

### Priority Mapping

| Issue Priority | Task Order                           |
| -------------- | ------------------------------------ |
| Critical       | Convert first, mark as high priority |
| High           | Convert second                       |
| Medium         | Convert third                        |
| Low            | Convert last                         |

## Edge Cases

### Issue Too Large

If an issue contains multiple unrelated problems:

1. Note this in the report
2. Suggest splitting into separate tasks
3. Create tasks for clearly separable parts

### Missing Information

If issue lacks sufficient detail:

1. Create task with available information
2. Add note: "Needs clarification on: [missing items]"
3. Include in "Requires Manual Review" section

### Duplicate Detection

Before creating a task:

1. Check TASKS.md for similar descriptions
2. Check state.json for similar task identifiers
3. If potential duplicate found, report it instead of creating

## Example Conversions

### Input: Issue 006 (UI Fixes)

```markdown
# Issue Report: UI Fixes - Text Wrapping and Section Visibility

**Issue ID:** 006
**Summary:** Personal Details section lacks text wrapping...
```

### Output: Task 055

```markdown
### 055-fix-issue-006-ui-text-wrapping

**Identifier:** `055-fix-issue-006-ui-text-wrapping`

**Description:**
Fix text wrapping in Personal Details section to prevent overflow on long input, and ensure Absence Days section is always visible with placeholder when no dates selected.

**Constraints:**

- Must use Tailwind CSS utilities for text wrapping
- Must maintain responsive layout
- Follow project code style (AGENTS.md)

**Acceptance Criteria:**

- [ ] Long text in Personal Details fields wraps properly
- [ ] Input fields have `break-words` and proper overflow handling
- [ ] Absence Days section always visible (shows '—' when no dates)
- [ ] UI layout does not shift when dates are selected
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests for text wrapping behavior

---
```

## Commands After Conversion

After converting issues to tasks:

1. **Start implementation:**

   ```
   /implement-task 055-fix-issue-006-ui-text-wrapping
   ```

2. **View task state:**

   ```
   Read docs/tasks/state.json
   ```

3. **Commit when done:**
   ```
   /commit-task 055-fix-issue-006-ui-text-wrapping
   ```
