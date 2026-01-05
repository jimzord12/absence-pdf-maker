# task-103-create-i18n-type-declarations

**Priority:** high
**Blocks:** task-104-create-translation-files
**Blocked By:** task-101-install-i18next-dependencies, task-102-create-i18n-config
**Issue:** N/A

---

## Description

Create TypeScript type declarations for i18next to enable IDE autocomplete for translation keys.

## Constraints

- Augment i18next module declarations
- Import en.json translation structure as type reference
- Use 'common' as default namespace

## Acceptance Criteria

- [ ] src/types/i18next.d.ts created
- [ ] Module 'i18next' augmented with CustomTypeOptions
- [ ] Default namespace set to 'common'
- [ ] Resources type inferred from en.json structure

## Notes

No notes.
