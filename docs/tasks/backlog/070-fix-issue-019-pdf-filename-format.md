# 070-fix-issue-019-pdf-filename-format

**Priority:** Medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#019](../../issues/open/019-pdf-filename-format.md)

---

## Description

Update the PDF filename generation to include full name, date range, and company name for better identification, replacing the current format that only uses employee ID and generation date.

**Constraints:**

- Must follow project code style (AGENTS.md)
- Must use `date-fns` for date formatting
- Must sanitize strings (replace spaces with hyphens, remove special chars)
- Must handle Greek characters properly (preserve or transliterate)
- Must use format: `LeaveRequest_<Firstname-Lastname>_<start-date(dd-mm-yyyy)>_<end-date(dd-mm-yyyy)>_<Company-Name>.pdf`

**Acceptance Criteria:**

- [ ] Filename includes employee's full name (sanitized)
- [ ] Filename includes start date in dd-MM-yyyy format
- [ ] Filename includes end date in dd-MM-yyyy format
- [ ] Filename includes company name (sanitized)
- [ ] Filename format follows: `LeaveRequest_<Name>_<StartDate>_<EndDate>_<Company>.pdf`
- [ ] Special characters are properly removed/replaced
- [ ] Greek characters in names and company names are handled correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests added for filename generation with various input scenarios

---
