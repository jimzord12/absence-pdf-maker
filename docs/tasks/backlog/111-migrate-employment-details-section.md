# task-111-migrate-employment-details-section

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate EmploymentDetailsSection.tsx to use i18next translations for all labels, placeholders, and headings.

## Constraints

- Use useTranslation('forms') hook
- Replace all hardcoded English strings with t() calls
- Maintain existing component structure and styling
- Preserve accessibility attributes

## Acceptance Criteria

- [ ] EmploymentDetailsSection uses useTranslation hook
- [ ] Heading "Employment Details Form" uses t('forms.employment.heading')
- [ ] All field labels use appropriate translation keys
- [ ] All placeholders use appropriate translation keys
- [ ] Component renders correctly in both languages

## Notes

No notes.
