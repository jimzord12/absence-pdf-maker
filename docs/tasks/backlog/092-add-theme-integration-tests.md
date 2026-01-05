# add-theme-integration-tests

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from add-comprehensive-tests](../issues/open/Derived from add-comprehensive-tests.md)

---

## Description

Add integration tests for theme switching workflows: toggle, persistence across reload, and form functionality in both themes.

## Constraints

- Must be completed after integrate-starswars-toggle
- Must test critical user workflows
- Must verify PDF generation remains in light mode

## Acceptance Criteria

- Integration test for theme toggle workflow:
  - User toggles theme → entire app updates
  - Theme attribute changes on document element
- Integration test for theme persistence:
  - Theme persists across page reload
  - Theme persists across browser restart (via localStorage)
- Integration test for form in dark mode:
  - User fills form in dark mode → validation works
  - PDF generation remains in light mode
- Integration test for smooth transitions:
  - CSS transitions apply correctly when switching themes
- All tests pass with npm run test

## Notes

No notes.
