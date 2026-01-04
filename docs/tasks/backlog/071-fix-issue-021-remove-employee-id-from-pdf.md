# 071-fix-issue-021-remove-employee-id-from-pdf

**Priority:** Medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#021](../../issues/open/021-remove-employee-id-field-from-pdf.md)

---

## Description

Remove the "Αρ. Μητρώου" (Employee ID) field from the PDF template completely. The field should not be displayed in the generated document at all, regardless of whether an employee ID is provided in the form.

**Constraints:**

- Must follow project code style (AGENTS.md)
- Only remove from PDF template - keep `employeeId` in data model if needed for other purposes
- Do not modify the form input field unless specified
- Ensure PDF layout adjusts automatically without gaps or spacing issues

**Acceptance Criteria:**

- [ ] Employee ID field is completely removed from PDF template
- [ ] "Αρ. Μητρώου" field does not appear in PDF regardless of data
- [ ] All other fields in Employee Details section remain unchanged
- [ ] PDF layout is correct without gaps or spacing issues
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests added to verify employee ID is not in PDF output

---
