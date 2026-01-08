# task-122-integrate-pdf-language-in-generation

**Priority:** high
**Blocks:** task-125-test-pdf-bilingual-generation
**Blocked By:** task-107-create-pdf-language-store, task-121-refactor-pdf-component-for-bilingual
**Issue:** N/A

---

## Description

Update pdf.service.ts to pass pdfLanguage from store to LeaveRequestPdf component during generation.

## Constraints

- Import usePdfLanguageStore
- Get pdfLanguage state before PDF generation
- Pass pdfLanguage to LeaveRequestPdf component
- Maintain existing PDF filename generation logic

## Acceptance Criteria

- [ ] pdf.service.ts imports usePdfLanguageStore
- [ ] generatePdf function retrieves pdfLanguage from store
- [ ] pdfLanguage passed to LeaveRequestPdf component
- [ ] PDF generation works with both language options
- [ ] Filename generation unchanged

## Notes

No notes.
