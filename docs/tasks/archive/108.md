# task-108-create-pdf-language-selector

**Priority:** medium
**Blocks:** task-116-migrate-review-and-generate
**Blocked By:** task-107-create-pdf-language-store
**Issue:** N/A

---

## Description

Create PdfLanguageSelector component for selecting PDF document language independently from UI language.

## Constraints

- Follow LocaleSelector.tsx pattern and styling
- Use Select component from shared/ui
- Support Greek and English options with flag emojis
- Connect to usePdfLanguageStore

## Acceptance Criteria

- [ ] src/features/leave-request/ui/components/PdfLanguageSelector.tsx created
- [ ] Component accepts optional className prop
- [ ] Displays "PDF Language:" label
- [ ] Options: "🇬🇷 Ελληνικά (Greek)" and "🇺🇸 English"
- [ ] Integrates with usePdfLanguageStore
- [ ] Follows existing Select component pattern

## Notes

No notes.
