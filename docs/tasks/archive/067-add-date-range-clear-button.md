# 067-add-date-range-clear-button

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#017](../issues/open/017.md)

---

## Description

Add a clear button to Date Range Picker in Leave Details section to allow users to easily reset selected dates with one click. Currently users must manually deselect dates in calendar, requiring extra clicks.

## Constraints

- Add clear button in LeaveDetailsSection (next to Holidays Legend)
- Button should reset startDate and endDate to undefined
- Button should only be visible when dates are selected (context-aware)
- Must integrate with existing React Hook Form state
- Must follow Tailwind CSS styling patterns
- Must maintain accessibility (keyboard navigation, ARIA attributes)
- Must pass lint and typecheck

## Acceptance Criteria

- [ ] "Clear Dates" button added in LeaveDetailsSection
- [ ] Button positioned in same row as Holidays Legend
- [ ] Button has appropriate styling (secondary button style)
- [ ] Button is visible only when dates are selected
- [ ] Button is hidden when no dates selected
- [ ] Clicking button clears startDate and endDate form fields
- [ ] Clicking button clears date selection in calendar
- [ ] Absence days calculation updates correctly after clearing (shows '—')
- [ ] Button has tooltip: "Clear selected dates"
- [ ] Button is keyboard accessible (Enter key activates)
- [ ] Button has proper ARIA attributes
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests for clear button functionality

## Notes

Reviewer feedback: PASS ✅

Strengths:
- Context-aware visibility (button only shows when both dates selected)
- Proper accessibility (title and aria-label attributes)
- Correct React Hook Form integration
- Comprehensive test coverage (7 new tests, all passing)
- Clean, well-documented code

Optional improvements (non-blocking):
1. Code duplication: Clear button could call existing handleSelect(undefined) instead of duplicating setValue logic
2. Footer accessibility: Could add aria-labelledby attribute
