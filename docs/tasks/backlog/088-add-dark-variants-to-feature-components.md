# add-dark-variants-to-feature-components

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from implement-theme-toggle](../issues/open/Derived from implement-theme-toggle.md)

---

## Description

Add dark: variant classes to all feature UI components (LeaveRequestForm, PersonalDetailsSection, EmploymentDetailsSection, LeaveDetailsSection) for dark mode support.

## Constraints

- Must be completed after add-dark-variants-to-shared-components
- Must update all feature UI components
- Must use semantic color variables
- Must not change PDF generation behavior

## Acceptance Criteria

- LeaveRequestForm updated with dark: variants
- PersonalDetailsSection updated with dark: variants
- EmploymentDetailsSection updated with dark: variants
- LeaveDetailsSection updated with dark: variants
- All feature-specific components updated with dark: variants
- Form inputs, labels, buttons render correctly in dark mode
- Interactive states (hover, focus, active, disabled) work in both themes
- Validation messages display correctly in both themes
- PDF generation remains in light mode (verified)

## Notes

No notes.
