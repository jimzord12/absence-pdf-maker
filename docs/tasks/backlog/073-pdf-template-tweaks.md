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

- [ ] "ΑΙΤΗΣΗ" is gray (#222) and vertically aligned with "Προς Τον εργοδότη:"
- [ ] Phone number displays as "+30 XXXXXXXXXX" with space after +30
- [ ] Date labels ("Από", "Έως (και)", "Ημερομηνία Επιστροφής") are bold
- [ ] Signature image is 15-20% larger (scale factor 1.15-1.20)
- [ ] "Ημερομηνία: dd/mm/yyyy" section fits on first page without creating second page
- [ ] All existing tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Visual layout remains professional and balanced

## Notes

- The signature box for employee should be updated with larger image dimensions
- Consider reducing margins or spacing to fit the date section on first page
- Phone formatting should be applied in the PDF component, not the data model
