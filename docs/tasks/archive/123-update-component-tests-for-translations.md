# task-123-update-component-tests-for-translations

**Priority:** high
**Blocks:** task-126-run-typecheck-and-lint
**Blocked By:** task-101-install-i18next-dependencies, task-110-migrate-personal-details-section, task-111-migrate-employment-details-section, task-112-migrate-leave-details-section, task-113-migrate-date-range-field, task-114-migrate-signature-modal, task-115-migrate-leave-request-form, task-116-migrate-review-and-generate, task-117-migrate-leave-request-page
**Issue:** N/A

---

## Description

Update existing component tests to expect translated content or mock i18next provider.

## Constraints

- Create renderWithI18n helper for test utilities
- Update test expectations to match translated strings
- Mock i18next where needed for non-React contexts
- Maintain test coverage

## Acceptance Criteria

- [ ] Helper function created for rendering with i18n provider
- [ ] Component tests updated to expect translated text
- [ ] Service tests mock t function appropriately
- [ ] All tests pass with new translation system
- [ ] Test coverage maintained

## Notes

No notes.
