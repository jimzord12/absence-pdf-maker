# task-106-update-locale-store-with-i18next

**Priority:** high
**Blocks:** task-109-create-validation-schema-factories, task-124-test-language-switching-persistence
**Blocked By:** task-101-install-i18next-dependencies, task-102-create-i18n-config, task-105-initialize-i18next-in-main
**Issue:** N/A

---

## Description

Enhance locale.store.ts to sync Zustand state with i18next language changes.

## Constraints

- Import i18next instance
- Call i18n.changeLanguage() when setLocale is called
- Maintain existing persist middleware and partialize configuration
- Export inferred LocaleStoreType for external use

## Acceptance Criteria

- [ ] locale.store.ts imports i18next config
- [ ] setLocale action calls i18n.changeLanguage(locale)
- [ ] Persist configuration unchanged (name: 'locale-storage', partialize preserves locale)
- [ ] LocaleStoreType exported and inferred from store

## Notes

No notes.
