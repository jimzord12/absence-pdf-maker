# add-theme-e2e-tests

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from add-comprehensive-tests](../issues/open/Derived from add-comprehensive-tests.md)

---

## Description

Add Playwright E2E tests for critical user flows with theme switching across the application.

## Constraints

- Must be completed after add-component-dark-mode-tests
- Must test critical user flows
- Must test accessibility (keyboard navigation)

## Acceptance Criteria

- E2E test for initial load with light mode
- E2E test for toggling to dark mode
- E2E test for toggling back to light mode
- E2E test for filling form in dark mode
- E2E test for theme persistence across page reload
- E2E test for theme persistence across browser restart
- E2E test for keyboard accessibility of theme toggle
- All E2E tests pass with npm run test:e2e (if configured)
- Baseline tests run successfully in both themes

## Notes

No notes.
