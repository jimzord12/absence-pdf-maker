# task-130-fix-translation-keys-forms

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Fix missing Greek translation keys in `forms` namespace that are causing raw translation keys to display in Review section. Keys like `forms.review.heading`, `forms.personal.heading`, `forms.leave.heading`, `forms.leave.leaveType`, `forms.dateRange.leaveAllowance`, `forms.dateRange.startDate`, `forms.dateRange.endDate`, `forms.leave.reason`, `forms.signature.label` are showing as raw text instead of translated Greek.

## Constraints

- Translation files located in `src/locales/gr/` directory
- Maintain exact key paths used in components (e.g., `forms.leave.leaveType`, `forms.dateRange.startDate`)
- Follow existing translation key naming convention (dot notation)
- Ensure translations use proper Greek terminology matching form headings
- Do NOT change component code - only update translation files

## Acceptance Criteria

- [ ] All `forms.*` namespace keys resolve to Greek text in Review section
- [ ] Section headings (forms.review.heading, forms.personal.heading, forms.leave.heading, forms.actions.heading) display correctly
- [ ] Leave details labels (leaveType, startDate, endDate, reason) display in Greek
- [ ] No i18next `missingKey` warnings for `forms.*` namespace in console
- [ ] Test in both Greek (gr) and English (en) locales

## Notes

No notes.
