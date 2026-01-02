### 051-fix-issue-012-personal-details-validation

**Identifier:** `051-fix-issue-012-personal-details-validation`

**Description:**
Implement comprehensive field validation for Personal Details section, including Greek Identity Number (ADT) format validation with support for multiple valid formats.

**Constraints:**

- Must use Zod schema validation
- Support multiple Greek identity number formats (ADT, AMKA, Passport)
- Validation errors must display in UI
- Must integrate with existing React Hook Form setup
- Maintain Greek (default) and English error messages

**Acceptance Criteria:**

- [ ] Personal Details fields show validation errors for invalid data
- [ ] Full Name: min 2 characters, Greek and Latin letters
- [ ] Father's Name: min 2 characters, Greek and Latin letters
- [ ] Email: valid email format with clear error message
- [ ] Phone: Greek phone format (+30 or 10 digits)
- [ ] Identity Number (ADT): validates against Greek formats:
  - Standard ADT: 8 digits (LLLDDDDD format)
  - AMKA: 11 digits with checksum
  - Passport: 2 letters + 7 digits
- [ ] Validation errors display below each field in red text
- [ ] Form cannot submit with invalid personal details
- [ ] All validation messages are user-friendly
- [ ] Tests for Greek ADT validation formats
- [ ] Tests for email and phone validation

---

### 052-fix-issue-013-employment-details-validation

**Identifier:** `052-fix-issue-013-employment-details-validation`

**Description:**
Implement validation for Employment Details section fields, ensuring Company Name, Department, and Position are required with appropriate error handling.

**Constraints:**

- Must use Zod schema validation
- Company Name has default value "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
- Employee ID remains optional
- Validation errors must display in UI
- Integrate with existing React Hook Form setup

**Acceptance Criteria:**

- [ ] Employment Details fields show validation errors for invalid data
- [ ] Company Name: required, min 2 characters, editable
- [ ] Company Name pre-filled with "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
- [ ] Department: required, min 2 characters
- [ ] Position: required, min 2 characters
- [ ] Employee ID: optional, allows alphanumeric
- [ ] Validation errors display below each field in red text
- [ ] Form cannot submit with empty required employment fields
- [ ] All validation messages are user-friendly
- [ ] Asterisk (\*) displayed on required fields
- [ ] Tests for employment field validation
- [ ] Tests for default company name behavior

---

### 053-fix-issue-014-leave-details-broken

**Identifier:** `053-fix-issue-014-leave-details-broken`

**Description:**
Fix completely broken Date Range picker layout and ensure Reason field is visible and functional in Leave Details section.

**Constraints:**

- Must fix DateRangeField styling and layout
- Must integrate DateRangeField with LeaveRequestForm properly
- Reason field must be visible and functional
- Maintain existing date validation and absence calculation
- Must pass control and locale props to DateRangeField

**Acceptance Criteria:**

- [ ] Date Range picker displays correctly with proper layout
- [ ] Calendar shows holidays highlighted with distinct style
- [ ] Weekend days have visual distinction
- [ ] Date range validation (start <= end) works
- [ ] DateRangeField receives `control` prop from useForm
- [ ] DateRangeField receives `locale` prop from useLocaleStore
- [ ] Date format respects locale setting (DD/MM/YYYY for Greek, MM/DD/YYYY for English)
- [ ] Absence days calculation displays correctly
- [ ] Reason field is visible in Leave Details section
- [ ] Reason field connected to form via `register('reason')`
- [ ] Reason field has label "Reason"
- [ ] Reason field has placeholder text
- [ ] Reason field validation errors display correctly
- [ ] Leave Type dropdown works (annual, sick, unpaid, other)
- [ ] Leave Allowance checkbox works
- [ ] All Leave Details fields work together
- [ ] No TypeScript errors
- [ ] No console errors related to DateRangeField
- [ ] Responsive layout works on mobile and desktop
- [ ] Tests for DateRangeField functionality
- [ ] Tests for Leave Details section integration

---

### 054-fix-issue-015-datepicker-styling-broken

**Identifier:** `054-fix-issue-015-datepicker-styling-broken`

**Description:**
Fix DateRangeField calendar layout that displays days vertically in a single column instead of the expected 7-column weekly grid. The root cause is using react-day-picker v8 API styling on v9.

**Constraints:**

- Project uses react-day-picker v9.13.0
- Must migrate from v8 styling API to v9 styling approach
- Must import default react-day-picker v9 styles
- Must maintain holiday and weekend highlighting functionality
- Must maintain Greek/English locale support
- Follow AGENTS.md code style guidelines

**Acceptance Criteria:**

- [ ] Import `react-day-picker/style.css` for default v9 styles
- [ ] Remove `DAY_PICKER_STYLES` object (v8 API properties like `row`, `cell`, `head_row`, `head_cell`, `table`, `tbody`)
- [ ] Remove `styles` prop from DayPicker component
- [ ] Keep `modifiersStyles` for holiday and weekend highlighting
- [ ] Calendar displays in proper 7-column weekly grid layout
- [ ] Week headers (Δε, Τρ, Τε, Πέ, Πα, Σά, Κυ) aligned with day columns
- [ ] Holidays highlighted with yellow background (#fef3c7) and brown text (#92400e)
- [ ] Weekend days highlighted with gray background (#f3f4f6)
- [ ] Two months display side-by-side with proper layout
- [ ] Month/year dropdowns work correctly
- [ ] Date range selection works
- [ ] Locale switching (Greek/English) works
- [ ] Console.log statements wrapped in `import.meta.env.DEV` check
- [ ] TypeScript type assertions with `as any` removed or types fixed
- [ ] Unnecessary `useMemo` for `modifiersStyles` removed
- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] Calendar layout responsive on mobile and desktop
- [ ] Tests pass for DateRangeField component

---

### 055-update-tests-for-new-schema

**Identifier:** `055-update-tests-for-new-schema`

**Description:**
Update outdated test files to match new Personal Details schema structure and validation requirements introduced in Task 051.

**Constraints:**

- All tests must pass after updates
- Must follow project test conventions (AGENTS.md)
- Test data must include new required fields (fathersName, identityNumber)
- Test data must use valid Greek phone formats
- Test expectations must match new component structure

**Acceptance Criteria:**

- [ ] Store tests updated to expect `leaveAllowance: false` in initial state
- [ ] Store tests updated to expect signature data to be persisted
- [ ] Persistence tests updated with valid profile data including new fields:
  - Add `fathersName: 'George Doe'` to test profiles
  - Add `identityNumber: 'ΑΒΓ12345'` to test profiles
  - Update phone numbers to valid Greek format (e.g., `6901234567`)
- [ ] PersonalDetailsSection tests updated to expect 5 fields:
  - Full Name, Father's Name, Email, Phone, Identity Number
  - Correct order of fields
- [ ] Integration tests updated with valid profile data
- [ ] All updated tests pass
- [ ] No regressions in previously passing tests

---

## Summary

Total New Tasks: 5

### Task Dependencies

Tasks should be completed in this order:

1. **Task 055** (High Priority) - Update outdated tests for new schema
2. **Task 054** (Critical Priority) - Date Picker UI completely broken, calendar grid not displaying
3. **Task 053** (Critical Priority) - Leave Details section is completely broken
4. **Task 051** (High Priority) - Personal Details validation missing - **COMPLETED**
5. **Task 052** (Medium Priority) - Employment Details validation missing

Task 055 should be completed first to ensure test suite is green.

---

### 056-ai-tool-heuristics-matrix

**Identifier:** `056-ai-tool-heuristics-matrix`

**Description:**
Update `AGENTS.md` with a "Tool Selection & Heuristics" section to guide autonomous tool use. This ensures agents know _when_ to use Playwright, DevTools, or Context7 without being explicitly told.

**Constraints:**

- Define specific triggers for UI changes, library research, and visual analysis.
- Must not conflict with existing architecture rules.

**Acceptance Criteria:**

- [x] New section "Tool Selection Heuristics" added to `AGENTS.md`.
- [x] Triggers defined for UI changes (DevTools/Playwright).
- [x] Triggers defined for library research (Context7).
- [x] Triggers defined for visual analysis (ZAI).

---

### 057-task-state-automation-cli

**Identifier:** `057-task-state-automation-cli`

**Description:**
Create a Node.js script to automate `state.json` updates. This prevents manual editing errors and ensures consistent timestamps and valid state transitions.

**Constraints:**

- Use TypeScript.
- Handle ISO timestamps.
- Validate state transitions (e.g., cannot skip `unit_tested`).

**Acceptance Criteria:**

- [ ] Script created at `scripts/task-cli.ts`.
- [ ] Command `npm run task -- <id> <state>` works.
- [ ] Updates `lastUpdated` automatically.
- [ ] Prevents invalid state transitions.

---

### 058-ai-handover-protocol

**Identifier:** `058-ai-handover-protocol`

**Description:**
Implement a handover protocol for cross-session context. This ensures that if one agent stops, the next one knows exactly where to pick up.

**Constraints:**

- Update `state.schema.json` to include a `notes` field.
- Create a standardized handover template.

**Acceptance Criteria:**

- [ ] `state.schema.json` updated with an optional `notes` field.
- [ ] `docs/templates/HANDOVER-TEMPLATE.md` created.
- [ ] `AGENTS.md` updated to require a handover note for unfinished tasks.

---

### 059-feature-context-mapping

**Identifier:** `059-feature-context-mapping`

**Description:**
Implement "Context Layering" to reduce token usage. Move static rules (Stack, Naming, Imports) from individual agent files to `AGENTS.md` and create feature-specific `CONTEXT.md` files.

**Constraints:**

- De-clutter `frontend-dev.md`, `tester.md`, and `reviewer.md`.
- Follow a standard `CONTEXT.md` structure.

**Acceptance Criteria:**

- [ ] `src/features/leave-request/CONTEXT.md` created with feature-specific rules.
- [ ] `src/shared/CONTEXT.md` created for UI primitives.
- [ ] Subagent files (`.opencode/agent/*.md`) stripped of redundant static rules.
- [ ] `AGENTS.md` updated to instruct agents to look for local `CONTEXT.md` files.

---

### 060-ai-review-workflow

**Identifier:** `060-ai-review-workflow`

**Description:**
Integrate the dedicated `reviewer` agent into the core workflow and implement mandatory self-reflection steps for all developer subagents.

**Constraints:**

- Update `docs/tasks/README.md` and subagent definitions.

**Acceptance Criteria:**

- [ ] `frontend-dev.md` and `tester.md` updated with a "Self-Reflection Checklist".
- [ ] `orchestrator.md` updated to automatically deploy the `reviewer` agent after `unit_tested`.
- [ ] `README.md` updated to reflect that `review_pass/fail` is determined by the `reviewer` agent.
- [ ] Reviewer output is summarized in the task's `notes` field.

---

### 061-issue-to-task-prompt

**Identifier:** `061-issue-to-task-prompt`

**Description:**
Create a high-fidelity prompt template for converting Issue Reports into structured Tasks in `TASKS.md`.

**Constraints:**

- Must output valid Markdown matching the existing `TASKS.md` structure.

**Acceptance Criteria:**

- [ ] `docs/prompts/003-issue-to-task.txt` created.
- [ ] Prompt handles parsing "Technical Details" and "Requirements" from issue reports.
- [ ] Output format matches the existing `TASKS.md` structure.

---

### 062-visual-regression-baseline

**Identifier:** `062-visual-regression-baseline`

**Description:**
Setup a script for AI-driven visual verification using Playwright to capture UI baselines and verify changes.

**Constraints:**

- Use Playwright to capture screenshots of key components.

**Acceptance Criteria:**

- [ ] `scripts/capture-baselines.ts` created.
- [ ] Captures screenshots of Personal Details, Employment Details, and Leave Details.
- [ ] `AGENTS.md` updated to require a `ui_diff_check` after UI modifications.

