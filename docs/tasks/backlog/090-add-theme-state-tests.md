# add-theme-state-tests

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from add-comprehensive-tests](../issues/open/Derived from add-comprehensive-tests.md)

---

## Description

Add unit tests for theme store, ThemeProvider, and integration tests for StarsWarsRobotToggle.

## Constraints

- Must be completed after integrate-starswars-toggle
- Must use Vitest with @testing-library/react
- Must clear localStorage before each test

## Acceptance Criteria

- theme.store.test.ts created with tests for:
  - Initial state is 'light'
  - toggleTheme switches between 'light' and 'dark'
  - setTheme sets theme correctly
  - Persist middleware saves to localStorage
  - Persist middleware loads from localStorage
- ThemeProvider.test.tsx created with tests for:
  - Applies data-theme attribute to document element
  - Updates attribute when theme changes
  - Renders children without errors
  - Uses useLayoutEffect (timing verified)
- StarsWarsRobotToggle integration test created with tests for:
  - Toggle reflects current theme state correctly
  - Clicking toggle calls store's toggleTheme
  - Theme attribute updates on document element
- All tests pass with npm run test

## Notes

No notes.
