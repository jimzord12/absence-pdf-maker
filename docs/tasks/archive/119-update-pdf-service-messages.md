# task-119-update-pdf-service-messages

**Priority:** medium
**Blocks:** task-122-integrate-pdf-language-in-generation, task-126-run-typecheck-and-lint
**Blocked By:** task-101-install-i18next-dependencies, task-104-create-translation-files, task-110-migrate-personal-details-section, task-111-migrate-employment-details-section, task-112-migrate-leave-details-section, task-113-migrate-date-range-field, task-114-migrate-signature-modal, task-115-migrate-leave-request-form, task-116-migrate-review-and-generate, task-117-migrate-leave-request-page
**Issue:** N/A

---

## Description

Update pdf.service.ts to use i18next translations for error and status messages.

## Constraints

- Pass t function to service functions
- Use t('messages.*') for user-facing messages
- Update function signatures where necessary
- Maintain existing PDF generation logic

## Acceptance Criteria

- [ ] PDF service functions accept TFunction parameter
- [ ] Error messages use t('messages.*')
- [ ] Status messages use translation keys
- [ ] Existing PDF generation logic preserved

## Notes

No notes.
