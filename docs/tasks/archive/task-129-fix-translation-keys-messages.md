# task-129-fix-translation-keys-messages

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Fix missing Greek translation keys in `messages.fields` namespace that are causing raw translation keys to display in Review section. Keys like `messages.fields.fullName`, `messages.fields.fathersName`, `messages.fields.email`, `messages.fields.phone`, `messages.fields.identityNumber`, `messages.fields.employeeId`, `messages.fields.companyName`, `messages.fields.department`, `messages.fields.position` are showing as raw text instead of translated Greek.

## Constraints

- Translation files located in `src/locales/gr/` directory
- Maintain exact key paths used in components (e.g., `messages.fields.fullName`)
- Follow existing translation key naming convention (dot notation)
- Ensure translations use proper Greek terminology matching form labels
- Do NOT change component code - only update translation files

## Acceptance Criteria

- [ ] All `messages.fields.*` translation keys resolve to Greek text in Review section
- [ ] Personal details labels display correctly (fullName, fathersName, email, phone, identityNumber, employeeId)
- [ ] No i18next `missingKey` warnings for `messages.fields.*` namespace in console
- [ ] Test in both Greek (gr) and English (en) locales
- [ ] Verify field labels match form input labels exactly

## Notes

No notes.
