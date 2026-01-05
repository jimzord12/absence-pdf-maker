# task-113-migrate-date-range-field

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate DateRangeField.tsx to use i18next translations for labels, summary text, and helper text.

## Constraints

- Use useTranslation('forms') hook
- Translate summary labels (Total Days, Holidays, etc.)
- Update button and helper text
- Maintain existing functionality

## Acceptance Criteria

- [ ] DateRangeField uses useTranslation hook
- [ ] Label "Select Date Range" uses t('common.labels.selectDateRange')
- [ ] "Clear Dates" button uses t('common.labels.clearDates')
- [ ] Summary labels use t('forms.dateRange.*')
- [ ] Component renders correctly in both languages

## Notes

No notes.
