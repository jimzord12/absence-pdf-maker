# task-133-improve-date-picker-visual-selection

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Improve visual styling for selected dates in react-day-picker to make them immediately visible. Currently, selected dates ARE marked correctly in the DOM (visible in accessibility tree), but the CSS styling is too subtle with insufficient contrast. Users cannot easily distinguish selected from unselected dates.

## Constraints

- Date picker component likely in `src/features/leave-request/ui/DateRangeField.tsx`
- Use Tailwind CSS for styling (project uses Tailwind v4)
- Maintain existing functionality, only improve visual feedback
- Test with multiple date ranges including single date, short range, and long range
- Ensure styling works across months (January to February, etc.)

## Acceptance Criteria

- [ ] Selected dates have clear visual distinction from unselected dates (strong contrast)
- [ ] Selected state is immediately visible in both light and dark modes
- [ ] Date range selection shows clear visual indication of start and end dates
- [ ] Color contrast meets WCAG AA standards (at least 4.5:1)
- [ ] User testing confirms dates are easily identifiable as selected
- [ ] CSS styling matches react-day-picker documentation best practices

## Notes

No notes.
