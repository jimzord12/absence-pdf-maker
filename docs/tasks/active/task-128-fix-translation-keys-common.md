# task-128-fix-translation-keys-common

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Fix missing Greek translation keys in the `common` namespace that are causing raw translation keys to display in the Review and Actions sections. Keys like `common.no`, `common.status.signed`, `common.status.update`, `common.buttons.exportProfile`, `common.buttons.importProfile`, `common.buttons.clearProfile`, `pdf.clickToGenerate`, `pdf.loadingMessage` are showing as raw text instead of translated Greek.

## Constraints

- Translation files located in `src/locales/gr/` directory
- Maintain exact key paths used in components (e.g., `common.no`, not `common.status.no`)
- Follow existing translation key naming convention (dot notation)
- Ensure translations use proper Greek terminology matching form labels
- Do NOT change component code - only update translation files

## Acceptance Criteria

- [ ] All `common.*` translation keys resolve to Greek text in Review section
- [ ] All button labels (export/import/clear) display in Greek
- [ ] PDF generation button text displays correctly in Greek
- [ ] No i18next `missingKey` warnings for `common.*` namespace in console
- [ ] Test in both Greek (gr) and English (en) locales

## Notes

No notes.
