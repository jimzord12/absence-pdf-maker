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

All acceptance criteria met. E2E tests implemented in `tests/e2e/theme.spec.ts`:
- ✓ Initial load with light mode
- ✓ Toggle to dark mode
- ✓ Toggle back to light mode
- ✓ Fill form in dark mode
- ✓ Theme persistence across page reload
- ✓ Theme persistence across browser restart
- ✓ Keyboard accessibility of theme toggle
- ✓ Additional tests: Multiple toggle without errors, theme state during form interaction

All 36 tests passing across 4 browsers (Chromium, Firefox, WebKit, Mobile Chrome).

Verified: All E2E tests pass with `npm run test:e2e tests/e2e/theme.spec.ts` (36 passed, 15.6s)
