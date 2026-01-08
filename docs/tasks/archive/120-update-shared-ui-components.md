# task-120-update-shared-ui-components

**Priority:** low
**Blocks:** task-126-run-typecheck-and-lint
**Blocked By:** task-101-install-i18next-dependencies, task-104-create-translation-files
**Issue:** N/A

---

## Description

Update shared UI components (Button, Modal, Alert) to use i18next translations for default text and accessibility attributes.

## Constraints

- Button: Translate default "Loading..." text
- Modal: Update aria-labels to use translations
- Alert: Update aria-label to use translation
- Make translation keys optional (allow overrides via props)

## Acceptance Criteria

- [ ] Button loading text uses t('common.labels.loading')
- [ ] Modal aria-labels can accept translation keys
- [ ] Alert aria-label can accept translation keys
- [ ] Existing component interfaces support translation overrides
- [ ] Backward compatibility maintained

## Notes

No notes.
