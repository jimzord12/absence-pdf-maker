# Verification Protocol

This document defines **mandatory verification requirements** for all agents working on this project. Subagents MUST follow these protocols and provide evidence in their reports.

## Core Principle: "Prove It Works"

**Every acceptance criterion must have concrete evidence.** Claims without proof are rejected.

---

## Playwright MCP Server Commands

All UI verification MUST use the Playwright MCP server. Here are the required commands:

### Taking Screenshots

```
Tool: mcp_playwright_browser_screenshot
Use: Capture visual proof of UI state
```

### Taking Accessibility Snapshots

```
Tool: mcp_playwright_browser_snapshot
Use: Get text-based representation of page elements with UIDs
```

### Navigation

```
Tool: activate_browser_navigation_tools → then use navigation commands
Use: Navigate to specific URLs, go back, manage pages
```

### Form Interaction

```
Tool: activate_form_input_tools → then use fill, press_key commands
Use: Test form inputs, buttons, selections
```

### Console Messages

```
Tool: mcp_playwright_browser_console_messages
Use: Check for JavaScript errors or warnings
```

---

## Evidence Requirements by Criterion Type

### Visual/UI Changes

| Evidence Type     | Required? | How to Capture                                       |
| ----------------- | --------- | ---------------------------------------------------- |
| Before screenshot | ✅ YES    | `take_screenshot` before changes                     |
| After screenshot  | ✅ YES    | `take_screenshot` after changes                      |
| Console check     | ✅ YES    | `browser_console_messages` - must show no new errors |

### Functional/Behavior Changes

| Evidence Type             | Required? | How to Capture                                      |
| ------------------------- | --------- | --------------------------------------------------- |
| Screenshot showing action | ✅ YES    | Capture the UI after performing the action          |
| Console output            | ✅ YES    | Verify no errors during interaction                 |
| Interaction proof         | ✅ YES    | Use `click`, `fill`, `press_key` and capture result |

### Form/Input Changes

| Evidence Type               | Required? | How to Capture                        |
| --------------------------- | --------- | ------------------------------------- |
| Empty state screenshot      | ✅ YES    | Form before filling                   |
| Filled state screenshot     | ✅ YES    | Form after filling with test data     |
| Validation error screenshot | ✅ YES    | Form with invalid data showing errors |
| Console check               | ✅ YES    | No console errors during interaction  |

### Data/State Changes

| Evidence Type     | Required? | How to Capture                                         |
| ----------------- | --------- | ------------------------------------------------------ |
| Before state      | ✅ YES    | Screenshot or console log of initial state             |
| After state       | ✅ YES    | Screenshot or console log of final state               |
| Persistence check | ✅ YES    | Refresh page and verify state persists (if applicable) |

---

## Acceptance Criteria Evidence Table Template

Every subagent report MUST include this table mapping each acceptance criterion to evidence:

```markdown
### Acceptance Criteria Evidence

| #   | Criterion                   | Status      | Evidence                                      |
| --- | --------------------------- | ----------- | --------------------------------------------- |
| 1   | [Copy exact criterion text] | ✅ VERIFIED | [Screenshot name/description + what it shows] |
| 2   | [Copy exact criterion text] | ✅ VERIFIED | [Test name that covers this + actual output]  |
| 3   | [Copy exact criterion text] | ❌ NOT MET  | [Explain what's missing or blocking]          |
```

**Rules:**

- Every criterion must have a row
- Status must be ✅ VERIFIED, ❌ NOT MET, or ⚠️ PARTIAL
- Evidence must be specific (not "tested" or "works")
- If any criterion is ❌ NOT MET, the task is NOT complete

---

## Mandatory Playwright Verification Workflow

### Screenshot Storage

**Save work screenshots to:** `.opencode/tmp/screenshots/<taskId>/`

Example: `.opencode/tmp/screenshots/T-042/before-changes.png`

These screenshots are ephemeral evidence for the current task. The finisher agent will clean up this directory before committing.

**Update the task file:** Record screenshot paths in the "Screenshots" table in `docs/tasks/active/<taskId>.md`

### Before Making Changes

1. **Navigate to the app**: Use `activate_browser_navigation_tools` to go to `http://localhost:5173`
2. **Take initial screenshot**: Save to `.opencode/tmp/screenshots/<taskId>/before-changes.png`
3. **Check console**: Run `browser_console_messages` to note existing errors/warnings
4. **Take accessibility snapshot**: Capture element structure

### After Making Changes

1. **Refresh the page**: Ensure latest code is loaded
2. **Take final screenshot**: Save to `.opencode/tmp/screenshots/<taskId>/after-changes.png`
3. **Test interactions**: Use Playwright to click buttons, fill forms, etc.
4. **Check console**: Verify no NEW errors were introduced
5. **Compare states**: Describe what changed between before/after

---

## Code Quality Baseline Snapshots (MANDATORY)

**You MUST capture code quality baselines BEFORE and AFTER making changes to detect regressions.**

**IMPORTANT:** Store baseline data directly in the task file at `docs/tasks/active/<taskId>.md` in the "Code Quality Baselines" section. This keeps everything self-contained and visible to all agents.

### Before Making Changes (Capture Baseline)

Run these commands and **save the output**:

```bash
# 1. Lint baseline
npm run lint 2>&1 | tail -20

# 2. Typecheck baseline
npm run typecheck 2>&1 | tail -20

# 3. Test baseline
npm run test -- --run 2>&1 | tail -30
```

**Record:**

- Number of lint warnings/errors (e.g., "0 errors, 2 warnings")
- Number of type errors (e.g., "0 errors")
- Number of tests passing/failing (e.g., "45 passed, 0 failed")

### After Making Changes (Compare with Baseline)

Run the same commands and **compare with baseline**:

```bash
# 1. Lint - compare with baseline
npm run lint 2>&1 | tail -20

# 2. Typecheck - compare with baseline
npm run typecheck 2>&1 | tail -20

# 3. Test - compare with baseline
npm run test -- --run 2>&1 | tail -30
```

### Regression Detection

| Metric        | Baseline | After Changes | Status           |
| ------------- | -------- | ------------- | ---------------- |
| Lint errors   | 0        | 0             | ✅ No regression |
| Lint warnings | 2        | 2             | ✅ No regression |
| Type errors   | 0        | 0             | ✅ No regression |
| Tests passing | 45       | 45            | ✅ No regression |
| Tests failing | 0        | 0             | ✅ No regression |

**Regression Rules:**

- ❌ **NEW lint errors** = Regression (must fix)
- ⚠️ **NEW lint warnings** = Should fix (document if intentional)
- ❌ **NEW type errors** = Regression (must fix)
- ❌ **NEWLY failing tests** = Regression (must fix)
- ❌ **FEWER passing tests** = Regression (tests removed/broken)

### Baseline Report Template

Include this table in your report:

```markdown
### Code Quality Baseline Comparison

| Metric        | Before   | After    | Status |
| ------------- | -------- | -------- | ------ |
| Lint errors   | [number] | [number] | ✅/❌  |
| Lint warnings | [number] | [number] | ✅/⚠️  |
| Type errors   | [number] | [number] | ✅/❌  |
| Tests passing | [number] | [number] | ✅/❌  |
| Tests failing | [number] | [number] | ✅/❌  |

**Regression detected:** Yes/No
**New issues introduced:** [List any new warnings/errors]
```

---

## Terminal Output Requirements

When running commands (`npm run test`, `npm run lint`, etc.), you MUST:

1. **Include actual terminal output** in your report (not just "passed")
2. **Show the full summary** (e.g., "5 tests passed, 0 failed")
3. **If errors occur**, include the full error message

Example of what to include:

```
$ npm run test -- --run

 ✓ src/features/leave-request/services/absenceDays.test.ts (8 tests) 234ms
 ✓ src/shared/ui/Button.test.tsx (4 tests) 156ms

 Test Files  2 passed (2)
      Tests  12 passed (12)
   Start at  14:32:15
   Duration  1.24s
```

---

## Report Rejection Criteria

The Orchestrator will **REJECT** subagent reports that:

1. ❌ Missing Acceptance Criteria Evidence table
2. ❌ Have criteria marked ❌ NOT MET without explanation
3. ❌ Claim "tests pass" without showing actual test output
4. ❌ Skip Playwright verification for UI changes
5. ❌ Have no screenshots for visual changes
6. ❌ Don't include console message check results

---

## Quick Reference: Playwright Commands

| Action        | Command                                             |
| ------------- | --------------------------------------------------- |
| Navigate      | `activate_browser_navigation_tools` → `navigate`    |
| Screenshot    | `take_screenshot` (after activating snapshot tools) |
| Snapshot      | `take_snapshot` (accessibility tree)                |
| Click         | `activate_form_input_tools` → `click`               |
| Fill input    | `activate_form_input_tools` → `fill`                |
| Console logs  | `browser_console_messages`                          |
| Wait for text | `activate_form_interaction_tools` → `wait_for`      |

---

## Summary

**Before returning a report, ask yourself:**

1. Did I take before/after screenshots?
2. Did I check console messages for errors?
3. Did I test the actual UI behavior with Playwright?
4. Did I fill in the Acceptance Criteria Evidence table?
5. Did I include actual terminal output (not summaries)?
6. Can I PROVE each criterion is met?

If any answer is "no", your report will be rejected.
