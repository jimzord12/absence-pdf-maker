# Issue Report: Date Range Picker - Missing Clear Button

**Issue ID:** 017
**Component:** Date Range Field and Leave Details Section
**Date Discovered:** 2026-01-03
**Status:** In Progress
**Priority:** Medium
**Task ID:** 067-add-date-range-clear-button

## Summary

The Date Range Picker lacks a clear button to reset selected dates. Users must manually open the calendar and deselect dates, which provides poor user experience and requires extra clicks.

## Problem Description

### Symptom

1. User selects leave dates in the Date Range Picker
2. User decides to cancel or reset the date selection
3. No clear button is available to reset the dates
4. User must open calendar and manually deselect each date
5. Poor user experience with unnecessary clicks required

### Investigation Details

#### 1. Missing Clear UI Element

- **File:** `src/features/leave-request/ui/DateRangeField.tsx` or `src/features/leave-request/ui/LeaveDetailsSection.tsx`
- **Issue:** No button or UI element exists to clear/reset date selection
- **Evidence:** User must manually clear dates by opening calendar and deselecting
- **Fix Applied (if any):** None yet
- **Note:** Issue #015 mentions this but marks it as "Not Completed" in TODO

#### 2. UX Inefficiency

- **Root Cause:** Clear functionality was not included in initial design
- **Impact:** Users must perform multiple clicks to clear dates instead of one click

## Steps to Reproduce

1. Navigate to Leave Request form
2. Click on Date Range field to open calendar
3. Select a leave date range (start and end dates)
4. Decide you want to clear/reset the selection
5. Observe: No clear button available in the date row
6. User must open calendar and manually deselect dates
7. Expected: A clear button should be available to reset date selection with one click

## Technical Details

### Current Implementation

- **Component:** `DateRangeField.tsx` (uses `react-day-picker` v9)
- **Form Control:** React Hook Form with `useController` or similar hook
- **State:** Two date fields (`startDate`, `endDate`) in form state

### Clear Button Placement Options

**Option 1 - Inside DateRangeField:**
- Position: Next to the date input field
- Icon: "X" icon or "Clear" text button
- Action: Resets `startDate` and `endDate` to undefined/null
- Pros: Clear context, directly related to date picker
- Cons: May clutter the input field area

**Option 2 - In LeaveDetailsSection (next to Holidays Legend):**
- Position: In the same row as "Holidays legend"
- Text: "Clear Dates" button
- Action: Same as above
- Pros: Cleaner UI, grouped with other date-related controls
- Cons: Less direct association with the date input

### Relevant Files

1. **`src/features/leave-request/ui/DateRangeField.tsx`**
   - Date range picker component
   - Needs clear button implementation

2. **`src/features/leave-request/ui/LeaveDetailsSection.tsx`**
   - Contains DateRangeField and HolidaysLegend
   - Alternative location for clear button

3. **`src/features/leave-request/ui/components/HolidaysLegend.tsx`**
   - Shows holiday information
   - Clear button could be placed nearby

## Potential Causes

### 1. Design Oversight

Clear functionality may have been intentionally omitted during initial development or simply overlooked as a convenience feature.

### 2. Minimal UI Preference

Design may have favored minimal UI over convenience, assuming users can manually clear dates if needed.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Date Management:**
   - Users manually deselect dates in calendar by clicking on selected dates
   - Limitations: Poor UX, extra clicks required, not intuitive

### Medium Term (Proper Fix)

1. **Add Clear Button in DateRangeField:**

   - Add a clear button next to the date input
   - Use "X" icon or text "Clear"
   - On click, call form reset for date fields: `setValue('startDate', undefined); setValue('endDate', undefined);`
   - Style button to be visible but not intrusive
   - Expected outcome: Easy date clearing with one click

2. **Add Clear Button in LeaveDetailsSection:**

   - Add "Clear Dates" button next to Holidays Legend
   - Use appropriate styling (secondary button style)
   - Same reset logic as above
   - Expected outcome: Convenient clear option in date-related section

3. **Clear Button Visibility:**

   - Show clear button only when dates are selected (not empty)
   - Hide button when no dates selected to avoid confusion
   - Expected outcome: Clear, context-aware UI

### Long Term (Architectural)

1. **Reusable Date Range Picker Component:**

   - Move DateRangeField to `src/shared/ui/` for reuse
   - Add prop for optional clear button: `showClearButton?: boolean`
   - Add callback for clear action: `onClear?: () => void`
   - Benefits: Reusable, configurable, consistent behavior

2. **Form Reset Utilities:**

   - Create utility functions for clearing form sections
   - Support partial form resets
   - Benefits: Consistent clear behavior across all form sections

## Additional Notes

- Medium priority: Affects user experience but does not block core functionality
- Clear button should be easily discoverable (use common icon or clear label)
- Consider keyboard accessibility (Enter key when button is focused)
- Consider adding tooltip: "Clear selected dates"
- Should update any related state (e.g., absence days calculation) when cleared

## Related Issues

- [#015 - Leave Details Section - Holidays, Business Days, and Clear Button](015-leave-details-holidays-business-days-clear-button.md) - Mentions clear button but marked as not completed

## References

- Component: `src/features/leave-request/ui/DateRangeField.tsx`
- Component: `src/features/leave-request/ui/LeaveDetailsSection.tsx`
- Documentation: [TODO.md](../tasks/TODO.md) - Leave Details Section Form section
- Library: [react-day-picker v9](https://daypicker.dev/)
