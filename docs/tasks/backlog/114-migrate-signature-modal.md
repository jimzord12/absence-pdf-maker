# task-114-migrate-signature-modal

**Priority:** medium
**Blocks:** task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-123-update-component-tests-for-translations
**Blocked By:** task-109-create-validation-schema-factories
**Issue:** N/A

---

## Description

Migrate SignatureModal.tsx to use i18next translations for all text, labels, and button content.

## Constraints

- Use useTranslation('forms') hook
- Translate title, description, labels
- Use Trans component for description if it contains styled elements
- Maintain modal behavior

## Acceptance Criteria

- [ ] SignatureModal uses useTranslation hook
- [ ] Title "Sign Your Name" uses t('forms.signature.heading')
- [ ] Description uses t('forms.signature.description') or Trans component
- [ ] Radio labels, input labels, buttons use translation keys
- [ ] Component renders correctly in both languages

## Notes

No notes.
