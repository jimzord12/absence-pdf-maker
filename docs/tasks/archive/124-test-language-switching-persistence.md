# task-124-test-language-switching-persistence

**Priority:** high
**Blocks:** task-127-end-to-end-testing
**Blocked By:** task-106-update-locale-store-with-i18next
**Issue:** N/A

---

## Description

Test that UI language changes persist across sessions and sync correctly with i18next.

## Constraints

- Create integration test for locale store + i18next sync
- Test localStorage persistence
- Test language re-renders components
- Test default language initialization

## Acceptance Criteria

- [ ] Integration test for setLocale → i18next.sync
- [ ] Test verifies localStorage persistence
- [ ] Test verifies components re-render on language change
- [ ] Test verifies default language (gr) on first load
- [ ] All tests pass

## Notes

No notes.
