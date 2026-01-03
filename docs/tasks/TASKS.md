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

Total New Tasks: 10

### Task Dependencies

Tasks should be completed in this order:

#### Critical Priority
1. **Task 068** - PDF generation offline failure (CRITICAL - PWA core functionality broken)

#### High Priority
2. **Task 065** - Toastify error notifications (Blocks Task 066)
3. **Task 066** - Import/Export/Clear form sync (User workflow affected)

#### Medium Priority
4. **Task 064** - Component naming (Developer communication improvement)
5. **Task 067** - Date Range clear button (UX improvement)

### Completed Issues (Tasks Done)

- Task 045 - Issue 006 UI fixes (Committed)
- Task 046 - Issue 007 PDF generation failure (Committed)
- Task 047 - Issue 008 Import/Export update (Committed)
- Task 051 - Issue 012 Personal Details validation (Committed)
- Task 052 - Issue 013 Employment Details validation (Committed)
- Task 053 - Issue 014 Leave Details broken (Committed)
- Task 054 - Issue 015 DatePicker styling (Committed)
- Task 055 - Update tests for new schema (Committed)
- Task 056 - AI tool heuristics (Committed)
- Task 057 - Task state automation CLI (Committed)
- Task 058 - AI handover protocol (Committed)
- Task 059 - Feature context mapping (Committed)
- Task 060 - AI review workflow (Committed)
- Task 061 - Issue to task prompt (Committed)
- Task 062 - Visual regression baseline (Committed)
- Task 063 - Copilot optimization (Committed)

**Note:** Task 055 should be completed first to ensure test suite is green. (Already completed)

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

- [x] Script created at `scripts/task-cli.ts`.
- [x] Command `npm run task -- <id> <state>` works.
- [x] Updates `lastUpdated` automatically.
- [x] Prevents invalid state transitions.

---

### 058-ai-handover-protocol

**Identifier:** `058-ai-handover-protocol`

**Description:**
Implement a handover protocol for cross-session context. This ensures that if one agent stops, the next one knows exactly where to pick up.

**Constraints:**

- Update `state.schema.json` to include a `notes` field.
- Create a standardized handover template.

**Acceptance Criteria:**

- [x] `state.schema.json` updated with an optional `notes` field.
- [x] `docs/templates/HANDOVER-TEMPLATE.md` created.
- [x] `AGENTS.md` updated to require a handover note for unfinished tasks.

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

- [x] `frontend-dev.md` and `tester.md` updated with a "Self-Reflection Checklist".
- [x] `orchestrator.md` updated to automatically deploy the `reviewer` agent after `unit_tested`.
- [x] `README.md` updated to reflect that `review_pass/fail` is determined by the `reviewer` agent.
- [x] Reviewer output is summarized in the task's `notes` field.

---

### 061-issue-to-task-prompt

**Identifier:** `061-issue-to-task-prompt`

**Description:**
Create a high-fidelity prompt template for converting Issue Reports into structured Tasks in `TASKS.md`.

**Constraints:**

- Must output valid Markdown matching the existing `TASKS.md` structure.

**Acceptance Criteria:**

- [x] `docs/prompts/003-issue-to-task.txt` created.
- [x] Prompt handles parsing "Technical Details" and "Requirements" from issue reports.
- [x] Output format matches the existing `TASKS.md` structure.

---

### 062-visual-regression-baseline

**Identifier:** `062-visual-regression-baseline`

**Description:**
Setup a script for AI-driven visual verification using Playwright to capture UI baselines and verify changes.

**Constraints:**

- Use Playwright to capture screenshots of key components.

**Acceptance Criteria:**

- [x] `scripts/capture-baselines.ts` created.
- [x] Captures screenshots of Personal Details, Employment Details, and Leave Details.
- [x] `AGENTS.md` updated to require a `ui_diff_check` after UI modifications.

---

### 064-fix-issue-014-component-naming

**Identifier:** `064-fix-issue-014-component-naming`

**Description:**
Rename form sections and read-only summary sections to eliminate naming confusion. Currently "Personal Details" and "Leave Details" names are used for both form inputs and read-only summaries, making it difficult to identify which component is being referenced.

**Constraints:**

- Must follow project code style (AGENTS.md)
- Maintain existing functionality
- Update all references in documentation and code comments
- Ensure clear distinction between form input and summary/preview components

**Acceptance Criteria:**

- [ ] Form section titles include "Form" or "Input" suffix (e.g., "Personal Details Form")
- [ ] Summary section titles include "Summary" or "Preview" suffix (e.g., "Personal Details Summary")
- [ ] ReviewAndGenerate.tsx section titles updated to reflect their purpose
- [ ] Component file names (PersonalDetailsSection, LeaveDetailsSection) may remain unchanged or updated if needed
- [ ] All documentation references updated with new naming convention
- [ ] Code comments updated where section names are mentioned
- [ ] No TypeScript errors
- [ ] No console errors

---

### 065-fix-issue-014-toastify-errors

**Identifier:** `065-fix-issue-014-toastify-errors`

**Description:**
Add react-toastify library to replace brief red box error overlays with persistent, user-friendly toast notifications. Currently error messages appear briefly and disappear, making it difficult for users to understand issues.

**Constraints:**

- Must install and configure react-toastify
- Must create ToastContainer in app root (likely App.tsx or main.tsx)
- Must replace all red box error displays with toast notifications
- Create centralized error notification utility function
- Support different toast types (error, warning, success, info)
- Configure default settings (duration, position, styling)
- Must pass lint and typecheck

**Acceptance Criteria:**

- [ ] react-toastify installed as dependency
- [ ] ToastContainer configured in app root
- [ ] All red box error displays replaced with toast.error() calls
- [ ] Error notifications persist for 5-10 seconds (configurable)
- [ ] Toast notifications are dismissable by user
- [ ] Multiple toast notifications stack properly
- [ ] Toast notifications are accessible (screen reader compatible)
- [ ] Centralized error notification utility created (e.g., showToast function)
- [ ] PDF generation errors show toast instead of red box
- [ ] Form validation errors show toast (in addition to inline errors)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests for toast notification system

---

### 066-fix-issue-016-import-export-clear-sync

**Identifier:** `066-fix-issue-016-import-export-clear-sync`

**Description:**
Fix form state synchronization issues where Clear and Import operations update the Read-only Summary but not the form fields. Additionally, Import should accept partial data with toast notifications instead of rejecting incomplete profiles with errors.

**Constraints:**

- Must sync React Hook Form state on Clear operation
- Must sync React Hook Form state on Import operation
- Must use Zod safeParse() for import validation to accept partial data
- Must show toast notifications for missing/invalid fields during import
- Must integrate with react-toastify (blocked by Task 065)
- Must write comprehensive unit tests for partial data scenarios
- Must pass lint and typecheck

**Acceptance Criteria:**

- [ ] Clear button resets both Zustand store AND React Hook Form state
- [ ] After Clear, form fields show empty state (not previous values)
- [ ] After Clear, Read-only Summary shows empty state
- [ ] Import operation populates both Zustand store AND React Hook Form state
- [ ] After Import, form fields show imported data
- [ ] After Import, Read-only Summary shows imported data
- [ ] Import uses safeParse() instead of strict parse()
- [ ] Import accepts partial valid data and populates valid fields
- [ ] Import shows toast notification with details of missing/invalid fields
- [ ] Import does NOT throw error for incomplete data
- [ ] Toast notification lists all missing/invalid fields
- [ ] Unit tests for partial data scenarios:
  - [ ] Import with only fullName and email
  - [ ] Import with all fields except identityNumber
  - [ ] Import with invalid email format
  - [ ] Import with empty JSON
- [ ] Integration tests for Clear operation
- [ ] Integration tests for Import operation
- [ ] No TypeScript errors
- [ ] No console errors

---

### 067-add-date-range-clear-button

**Identifier:** `067-add-date-range-clear-button`

**Description:**
Add a clear button to Date Range Picker in Leave Details section to allow users to easily reset selected dates with one click. Currently users must manually deselect dates in calendar, requiring extra clicks.

**Constraints:**

- Add clear button in LeaveDetailsSection (next to Holidays Legend)
- Button should reset startDate and endDate to undefined
- Button should only be visible when dates are selected (context-aware)
- Must integrate with existing React Hook Form state
- Must follow Tailwind CSS styling patterns
- Must maintain accessibility (keyboard navigation, ARIA attributes)
- Must pass lint and typecheck

**Acceptance Criteria:**

- [ ] "Clear Dates" button added in LeaveDetailsSection
- [ ] Button positioned in same row as Holidays Legend
- [ ] Button has appropriate styling (secondary button style)
- [ ] Button is visible only when dates are selected
- [ ] Button is hidden when no dates selected
- [ ] Clicking button clears startDate and endDate form fields
- [ ] Clicking button clears date selection in calendar
- [ ] Absence days calculation updates correctly after clearing (shows '—')
- [ ] Button has tooltip: "Clear selected dates"
- [ ] Button is keyboard accessible (Enter key activates)
- [ ] Button has proper ARIA attributes
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests for clear button functionality

---

### 068-fix-issue-018-pdf-offline-generation

**Identifier:** `068-fix-issue-018-pdf-offline-generation`

**Description:**
Fix PDF generation to work fully offline. Currently PDF generation fails with "Failed to fetch" error when the application is used offline, which is critical for a PWA designed to work without internet connection.

**Constraints:**

- Must bundle fonts locally (download to `public/fonts/`)
- Must update font registration in PDF components to use local file paths
- Must add fonts to service worker precache in vite.config.ts
- Must ensure all @react-pdf/renderer assets are available offline
- Must test PDF generation thoroughly in offline mode
- Must maintain Greek character support (Roboto fonts)
- Must pass lint and typecheck
- CRITICAL: PDF generation is core feature that MUST work offline

**Acceptance Criteria:**

- [ ] Roboto font files (regular, italic, bold, bold-italic) downloaded to public/fonts/
- [ ] Font registration in LeaveRequestPdf.tsx uses local file paths (e.g., /fonts/Roboto-Regular.ttf)
- [ ] No external font URLs (e.g., Google Fonts CDN) in PDF code
- [ ] Fonts added to vite-plugin-pwa precache list in vite.config.ts
- [ ] PDF generation works completely offline
- [ ] PDF generation works in different offline scenarios:
  - [ ] Fresh app load offline
  - [ ] Cached app offline
  - [ ] After service worker update
- [ ] Greek characters display correctly in PDF
- [ ] PDF generation produces same output online and offline
- [ ] No network requests during PDF generation (verify in browser network tab)
- [ ] Error handling for offline mode is graceful
- [ ] Tests for offline PDF generation
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] "Failed to fetch" error resolved
- [ ] Font resolution errors resolved

---
