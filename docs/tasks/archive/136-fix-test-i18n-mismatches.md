# 136-fix-test-i18n-mismatches

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Update test assertions to match the new i18n strings and handle multiple occurrences of localized text in the UI.

## Constraints

- TODO: Add constraints

## Acceptance Criteria

- [x] All signature status assertions include symbols (✓/✗)
- [x] Loading message assertions handle multiple instances or use specific selectors
- [x] mockT implementation in persistence tests matches actual service usage
- [x] Success message expectations match en.json content exactly

## Notes

- Fixed i18n string mismatches (symbols like ✓/✗).
- Handled multiple elements with similar text in ReviewAndGenerate.test.tsx.
- Refactored mockT in persistence.test.ts.
- All 1308 tests passing.
