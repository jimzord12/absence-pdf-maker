# task-118-update-persistence-service-messages

**Priority:** medium
**Blocks:** task-126-run-typecheck-and-lint
**Blocked By:** task-101-install-i18next-dependencies, task-104-create-translation-files, task-110-migrate-personal-details-section, task-111-migrate-employment-details-section, task-112-migrate-leave-details-section, task-113-migrate-date-range-field, task-114-migrate-signature-modal, task-115-migrate-leave-request-form, task-116-migrate-review-and-generate, task-117-migrate-leave-request-page
**Issue:** N/A

---

## Description

Update persistence.ts service to use i18next translations for all toast and error messages.

## Constraints

- Pass t function as parameter to service functions
- Use t('messages.*') for all user-facing messages
- Maintain existing error handling logic
- Update function signatures where necessary

## Acceptance Criteria

- [ ] Service functions accept TFunction parameter
- [ ] All toast success/error messages use t('messages.*')
- [ ] Field labels in error messages use translations
- [ ] Existing error handling logic preserved
- [ ] Callers pass t function from useTranslation hook

## Notes

No notes.
