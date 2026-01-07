# task-110-migrate-personal-details-section

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate PersonalDetailsSection.tsx to use i18next translations for all labels, placeholders, and headings.

## Constraints

- Use useTranslation('forms') hook
- Replace all hardcoded English strings with t() calls
- Maintain existing component structure and styling
- Preserve accessibility attributes (update aria-labels with translations)

## Acceptance Criteria

- [ ] PersonalDetailsSection uses useTranslation hook
- [ ] Heading "Personal Details Form" uses t('forms.personal.heading')
- [ ] All field labels use appropriate translation keys
- [ ] All placeholders use appropriate translation keys
- [ ] Accessibility attributes updated with translated strings
- [ ] Component renders correctly in both languages

## Notes

No notes.
