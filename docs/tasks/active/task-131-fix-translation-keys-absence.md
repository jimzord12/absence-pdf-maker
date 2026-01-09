# task-131-fix-translation-keys-absence

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Fix missing Greek translation keys in `forms.leave.absence` namespace that are causing raw translation keys to display in Review section. Keys like `forms.leave.absence.calculationHeading`, `forms.leave.absence.totalDays`, `forms.leave.absence.weekendDays`, `forms.leave.absence.holidayDays`, `forms.leave.absence.absenceDays` are showing as raw text instead of translated Greek.

## Constraints

- Translation files located in `src/locales/gr/` directory
- Maintain exact key paths used in components (e.g., `forms.leave.absence.totalDays`)
- Follow existing translation key naming convention (dot notation)
- Ensure translations use proper Greek terminology for absence calculations
- Do NOT change component code - only update translation files

## Acceptance Criteria

- [ ] All `forms.leave.absence.*` translation keys resolve to Greek text in Review section
- [ ] Absence calculation section heading displays correctly in Greek
- [ ] Labels for totalDays, weekendDays, holidayDays, absenceDays display correctly
- [ ] No i18next `missingKey` warnings for `forms.leave.absence.*` namespace in console
- [ ] Test in both Greek (gr) and English (en) locales

## Notes

No notes.
