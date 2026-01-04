# 048-fix-issue-009-datepicker-locale

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Update DatePicker to match selected locale format. Created locale store (locale.store.ts), LocaleSelector component (LocaleSelector.tsx), updated formatDate() function (dates.ts), added locale support to page header (LeaveRequestPage.tsx), updated ReviewAndGenerate date display (ReviewAndGenerate.tsx). Updated DateRangeField to accept locale prop and pass to react-day-picker component. react-day-picker v9 supports locale prop from date-fns/locale. Component integration in progress - need to properly integrate DateRangeField with existing LeaveRequestForm structure to pass control from form.

## Constraints

- No constraints specified.

## Acceptance Criteria

- [ ] No acceptance criteria specified.

## Notes

No notes.
