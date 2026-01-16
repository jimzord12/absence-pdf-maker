# 143-fix-e2e-test-infrastructure

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Fix E2E test infrastructure issues that are causing test failures unrelated to actual application bugs.

From task 141-plan, the following E2E tests are failing due to test infrastructure issues (not accessibility violations):

**Failing Tests (14 total):**

1. **i18n Tests (3 tests):**
   - `should display localized form labels and switch them` - Element visibility issues with localized labels
   - `should format dates based on locale` - Element visibility issues with date labels
   - `should switch PDF language independently` - Currently SKIPPED (pending investigation)

2. **Leave Request Tests (10 tests):**
   - `should complete happy path flow` - Form fill timeout finding `input[placeholder="Enter your full name"]`
   - `should handle optional leave allowance field correctly` - Form fill timeout
   - `should allow editing and updating personal details` - Form fill timeout
   - `should allow adding, updating, and clearing signature` - Form fill timeout + "Not Signed" not visible
   - `should allow exporting and importing profile data` - Form fill timeout
   - `should clear all profile data and reset form` - Form fill timeout

3. **Accessibility Audit Tests (1 test):**
   - `should have no accessibility violations after filling personal details` - Form fill timeout
   - `should have no accessibility violations with signature modal open` - "Add Signature" not visible
   - `should have no accessibility violations after selecting dates` - Date cells not visible/clickable

**Root Causes Identified:**

1. **React Rendering Race Conditions** - Tests attempt to fill forms immediately after clearing localStorage and reloading, but React may not have re-rendered with new locale values
2. **Element Visibility Issues** - Playwright reports elements as "not visible" even though they exist in DOM (likely CSS opacity/display properties or viewport issues)
3. **Strict Mode Violations** - Some tests find multiple elements with same selectors (duplicate form names after React renders)
4. **Date Picker Issues** - `react-day-picker` calendar cells use complex CSS that's not stable in test environment
5. **Test Isolation Issues** - Tests may not be properly clearing React state between runs

**Requirements:**

- Fix all 14 failing E2E tests
- Ensure proper test isolation (clear localStorage/sessionStorage, React state)
- Add robust wait conditions for React rendering
- Improve element selectors to handle duplicates (use `.first()`, more specific selectors)
- Fix date picker interaction tests
- Ensure all accessibility audit tests pass (currently 3/7 passing)
- Fix ESLint error: unused `page` parameter in skipped test `i18n.spec.ts:38`

**Constraints:**

- Do NOT modify application code unless there's a genuine bug found during testing
- Focus on test configuration/infrastructure fixes only
- Follow Playwright best practices for element visibility and waiting
- Ensure tests are flake-free and consistent across runs

## Constraints

- TODO: Add constraints

## Acceptance Criteria

- [x] All 14 currently failing E2E tests now pass
- [x] All 7 accessibility audit tests pass (currently 3/7 passing)
- [x] ESLint error fixed (unused variable in skipped test)
- [x] Tests are flake-free and consistent across multiple runs
- [x] Test isolation is working properly (localStorage/sessionStorage cleared, React state reset)

## Notes

No notes.
