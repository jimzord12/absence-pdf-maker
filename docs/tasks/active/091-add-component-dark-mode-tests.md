# add-component-dark-mode-tests

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from add-comprehensive-tests](../issues/open/Derived from add-comprehensive-tests.md)

---

## Description

Add tests for all UI components to verify dark: variant classes render correctly in both light and dark themes.

## Constraints

- Must be completed after add-dark-variants-to-feature-components
- Must test all shared and feature components
- Must test both light and dark modes

## Acceptance Criteria

- Tests created for Button dark mode variants
- Tests created for Input dark mode variants
- Tests created for Card dark mode variants
- Tests created for Modal dark mode variants
- Tests created for Alert dark mode variants
- Tests created for LeaveRequestForm dark mode variants
- Tests created for PersonalDetailsSection dark mode variants
- Tests created for EmploymentDetailsSection dark mode variants
- Tests created for LeaveDetailsSection dark mode variants
- Tests verify dark: classes are present in DOM when data-theme='dark'
- Tests verify light mode classes when data-theme='light'
- All tests pass with npm run test

## Notes

No notes.
