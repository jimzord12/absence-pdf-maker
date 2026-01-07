# task-105-initialize-i18next-in-main

**Priority:** high
**Blocks:** task-106-update-locale-store-with-i18next
**Blocked By:** task-101-install-i18next-dependencies, task-102-create-i18n-config
**Issue:** N/A

---

## Description

Initialize i18next configuration in main.tsx before app renders to ensure translations are available throughout the application.

## Constraints

- Import config before any other imports that might use translations
- Maintain existing app initialization logic

## Acceptance Criteria

- [ ] src/main.tsx imports i18n/config
- [ ] Import is placed before React DOM rendering
- [ ] App renders successfully with i18next initialized

## Notes

No notes.
