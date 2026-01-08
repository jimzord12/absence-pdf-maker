# task-116-migrate-review-and-generate

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-108-create-pdf-language-selector, task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate ReviewAndGenerate.tsx to use i18next translations for headings, field labels, status messages, and action buttons.

## Constraints

- Use useTranslation hooks (common, forms, messages)
- Translate section headings, summary labels, status indicators
- Translate success/error messages and toast notifications
- Add PdfLanguageSelector component to PDF section
- Maintain existing functionality

## Acceptance Criteria

- [ ] ReviewAndGenerate uses useTranslation hooks
- [ ] Section headings use translation keys
- [ ] Summary field labels use translation keys
- [ ] Status messages ("✓ Signed", "✗ Not signed") use t('common.status.*')
- [ ] Buttons use t('common.buttons.*')
- [ ] Toast messages use t('messages.*')
- [ ] PdfLanguageSelector component integrated
- [ ] Component renders correctly in both languages

## Notes

No notes.
