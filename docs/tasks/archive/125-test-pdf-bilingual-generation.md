# task-125-test-pdf-bilingual-generation

**Priority:** high
**Blocks:** task-127-end-to-end-testing
**Blocked By:** task-107-create-pdf-language-store, task-121-refactor-pdf-component-for-bilingual, task-122-integrate-pdf-language-in-generation
**Issue:** N/A

---

## Description

Test PDF generation in both English and Greek to ensure correct content and language independence from UI language.

## Constraints

- Test Greek PDF generation (default)
- Test English PDF generation
- Verify PDF language is independent of UI language
- Test PDF content correctness for both languages

## Acceptance Criteria

- [x] Test generates PDF in Greek
- [x] Test generates PDF in English
- [x] Test verifies PDF language does not affect UI language
- [x] Test verifies UI language does not affect PDF language
- [x] Both PDF outputs have correct language content

## Notes

- Implemented unit tests for `LeaveRequestPdf` component to verify bilingual rendering.
- Implemented integration tests for `pdf.service` to verify store language is correctly passed to the PDF component.
- Verified that PDF language selection is independent of UI language by mocking the Zustand store and component props.
