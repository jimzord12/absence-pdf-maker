# task-115-migrate-leave-request-form

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate LeaveRequestForm.tsx to use i18next translations for button labels and any other hardcoded text.

## Constraints

- Use useTranslation('common') hook
- Translate "Reset Form" button
- Maintain existing form logic

## Acceptance Criteria

- [ ] LeaveRequestForm uses useTranslation hook
- [ ] Reset button uses t('common.buttons.reset')
- [ ] Component renders correctly in both languages

## Notes

No notes.
