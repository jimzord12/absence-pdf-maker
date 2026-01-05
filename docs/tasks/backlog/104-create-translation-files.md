# task-104-create-translation-files

**Priority:** high
**Blocks:** task-109-create-validation-schema-factories, task-121-refactor-pdf-component-for-bilingual
**Blocked By:** task-101-install-i18next-dependencies, task-102-create-i18n-config, task-103-create-i18n-type-declarations
**Issue:** N/A

---

## Description

Create English and Greek translation JSON files with coarse namespace structure (common, forms, validation, messages, pdf).

## Constraints

- Use coarse namespace structure: common, forms, validation, messages, pdf
- en.json is the source of truth for structure
- gr.json mirrors en.json structure with Greek translations
- PDF section should contain existing Greek text from LeaveRequestPdf.tsx
- Include ICU format support for plurals where needed

## Acceptance Criteria

- [ ] src/i18n/locales/en.json created with all ~100+ translation keys
- [ ] src/i18n/locales/gr.json created with Greek translations
- [ ] Namespaces: common (buttons, labels, status), forms (personal, employment, leave, dateRange, signature, pdf), validation, messages, pdf (en/gr subsections)
- [ ] All hardcoded English strings from components are captured
- [ ] Validation messages from leaveRequest.schema.ts are included
- [ ] Toast/error messages from persistence.ts and pdf.service.ts are included

## Notes

No notes.
