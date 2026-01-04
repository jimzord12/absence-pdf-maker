# 073-pdf-template-tweaks

**Priority:** Medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Apply several visual tweaks to the PDF template to improve layout and formatting:

1. **Title Positioning**: Move "ΑΙΤΗΣΗ" to align vertically with "Προς Τον εργοδότη:" and change its color to gray (#222) instead of blue (#1a73e8)

2. **Phone Format**: Format phone number with space after country code: "+30 XXXXXXXXXX"

3. **Date Labels**: Make date labels ("Από", "Έως (και)", "Ημερομηνία Επιστροφής") bold for better readability

4. **Signature Size**: Increase signature image size by 15-20% for better visibility

5. **Date Section Fit**: Adjust layout to fit the "Ημερομηνία: dd/mm/yyyy" section on the first page to prevent it from creating a second page

## Constraints

- Follow project code style (AGENTS.md)
- Maintain existing A4 layout proportions
- Do not break existing tests
- Keep Greek character support intact

## Acceptance Criteria

- [x] "ΑΙΤΗΣΗ" is gray (#222) and vertically aligned with "Προς Τον εργοδότη:"
- [x] Phone number displays as "+30 XXXXXXXXXX" with space after +30
- [x] Date labels ("Από", "Έως (και)", "Ημερομηνία Επιστροφής") are bold
- [x] Signature image is 15-20% larger (scale factor 1.15-1.20)
- [x] "Ημερομηνία: dd/mm/yyyy" section fits on first page without creating second page
- [x] All existing tests pass
- [x] No TypeScript errors
- [x] No console errors
- [x] Visual layout remains professional and balanced

## Notes

- The signature box for employee should be updated with larger image dimensions
- Consider reducing margins or spacing to fit the date section on first page
- Phone formatting should be applied in the PDF component, not the data model

### Implementation Changes

1. **Title Positioning**: Removed `marginTop: 12` from `documentTitle` style to align "ΑΙΤΗΣΗ" with "Προς Τον εργοδotte:". Color was already #222.

2. **Phone Format**: Already implemented via `formatPhone` function (adds space after +30).

3. **Date Labels**: Already bold via `styles.label` (fontWeight: 'bold').

4. **Signature Size**: Increased signature image dimensions from 138x69 to 163x81 (18% increase, within 15-20% range).

5. **Date Section Fit**: Reduced vertical spacing to fit content on first page:
   - `header.marginBottom`: 35 → 25
   - `header.paddingBottom`: 15 → 10
   - `subject.marginBottom`: 25 → 15
   - `section.marginBottom`: 20 → 15
   - `footer.marginTop`: 45 → 30
   - `dateSection.marginTop`: 25 → 15
   - `allowanceSection.marginTop`: 25 → 15, `padding`: 15 → 12

All 72 tests pass. No TypeScript errors. Linting errors are pre-existing issues in unrelated files.
