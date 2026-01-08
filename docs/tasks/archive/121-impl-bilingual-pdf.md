# 121-impl-bilingual-pdf

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Implement bilingual PDF support for LeaveRequestPdf component

## Constraints

• Accept pdfLanguage prop (type PdfLanguage)
• Create translation function that selects EN/GR text
• Maintain existing Greek PDF structure as default
• Extract all hardcoded text to translation lookup
• PDF content should match existing English and Greek translations in gr.json

## Acceptance Criteria

- LeaveRequestPdf component accepts pdfLanguage prop
- All PDF text uses translation lookup based on pdfLanguage
- Greek PDF matches existing LeaveRequestPdf.tsx output
- English PDF uses appropriate translation keys
- Component renders correctly for both languages
- Existing styling and layout preserved

## Notes

No notes.
