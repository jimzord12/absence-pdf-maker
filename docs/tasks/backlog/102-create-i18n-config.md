# task-102-create-i18n-config

**Priority:** high
**Blocks:** task-103-create-i18n-type-declarations, task-104-create-translation-files, task-105-initialize-i18next-in-main
**Blocked By:** task-101-install-i18next-dependencies
**Issue:** N/A

---

## Description

Create i18next configuration file to initialize react-i18next with English and Greek language support.

## Constraints

- Follow existing project patterns for file organization
- Default language should be 'gr' (matching locale.store.ts)
- Fallback language should be 'en'
- Disable HTML escaping (React handles this)

## Acceptance Criteria

- [ ] src/i18n/config.ts created
- [ ] Config initializes with 'gr' as default and 'en' as fallback
- [ ] Resource structure supports English and Greek translations
- [ ] interpolation.escapeValue is set to false

## Notes

No notes.
