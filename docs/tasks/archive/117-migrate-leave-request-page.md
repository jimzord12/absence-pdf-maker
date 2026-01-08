# task-117-migrate-leave-request-page

**Priority:** medium
**Blocks:** task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate LeaveRequestPage.tsx to use i18next translations for page heading, subtitle, and any other text.

## Constraints

- Use useTranslation('common') hook
- Translate "Leave Request" heading
- Translate subtitle about PDF generation
- Translate "Install App" button
- Maintain existing page structure

## Acceptance Criteria

- [x] LeaveRequestPage uses useTranslation hook
- [x] Heading uses translation key
- [x] Subtitle uses translation key
- [x] Component renders correctly in both languages

## Notes

Task completed successfully. All tests passing (40/41, 1 unrelated CSS styling failure).
