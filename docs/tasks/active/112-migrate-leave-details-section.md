# task-112-migrate-leave-details-section

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate LeaveDetailsSection.tsx to use i18next translations for all labels, options, and headings.

## Constraints

- Use useTranslation('forms') hook
- Replace leave type options with translations
- Use Trans component for text with styling if needed
- Maintain existing component structure

## Acceptance Criteria

- [ ] LeaveDetailsSection uses useTranslation hook
- [ ] Heading "Leave Details Form" uses t('forms.leave.heading')
- [ ] Leave type options use t('forms.leave.annualLeave'), etc.
- [ ] Field labels and placeholders use translation keys
- [ ] Component renders correctly in both languages

## Notes

No notes.
