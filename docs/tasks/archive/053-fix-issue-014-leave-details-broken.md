# 053-fix-issue-014-leave-details-broken

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Fix completely broken Date Range picker layout and ensure Reason field is visible and functional in Leave Details section.

## Constraints

- Must fix DateRangeField styling and layout
- Must integrate DateRangeField with LeaveRequestForm properly
- Reason field must be visible and functional
- Maintain existing date validation and absence calculation
- Must pass control and locale props to DateRangeField

## Acceptance Criteria

- [ ] Date Range picker displays correctly with proper layout
- [ ] Calendar shows holidays highlighted with distinct style
- [ ] Weekend days have visual distinction
- [ ] Date range validation (start <= end) works
- [ ] DateRangeField receives `control` prop from useForm
- [ ] DateRangeField receives `locale` prop from useLocaleStore
- [ ] Date format respects locale setting (DD/MM/YYYY for Greek, MM/DD/YYYY for English)
- [ ] Absence days calculation displays correctly
- [ ] Reason field is visible in Leave Details section
- [ ] Reason field connected to form via `register('reason')`
- [ ] Reason field has label "Reason"
- [ ] Reason field has placeholder text
- [ ] Reason field validation errors display correctly
- [ ] Leave Type dropdown works (annual, sick, unpaid, other)
- [ ] Leave Allowance checkbox works
- [ ] All Leave Details fields work together
- [ ] No TypeScript errors
- [ ] No console errors related to DateRangeField
- [ ] Responsive layout works on mobile and desktop
- [ ] Tests for DateRangeField functionality
- [ ] Tests for Leave Details section integration

## Notes

No notes.
