# Issue Report: Leave Details Section - Holidays, Business Days, and Clear Button

**Issue ID:** 015
**Component:** Date Range Field and Business Days Calculator
**Date Discovered:** 2025-12-31
**Status:** Open
**Priority:** High

## Summary

DateRangeField component does not utilize holidays.json data to visually highlight holidays in date picker calendar. The service for calculating business days (excluding weekends and holidays) is missing or not properly integrated. Additionally, there is no clear button to reset selected dates in Date Range Picker.

## Problem Description

### Symptom

1. User opens Date Range Picker to select leave dates
2. Holidays are not visually highlighted in calendar (Done!)
3. Business days calculation may not exclude holidays (Done!)
4. No clear button exists to reset date selection (Not Completed)
5. Users must manually clear dates by opening calendar and deselecting

### Investigation Details

#### 1. DateRangeField Not Using Holidays

- **File:** `src/features/leave-request/ui/DateRangeField.tsx`
- **Issue:** Component does not read or utilize `data/holidays.json`
- **Evidence:** No holiday highlighting in calendar UI
- **Expected:** Holidays should be highlighted with different color/marker
- **Fix Applied (if any):** None yet

#### 2. Missing Business Days Service

- **File:** `src/features/leave-request/services/absenceDays.ts` (may exist but incomplete)
- **Issue:** Service may not properly exclude holidays from business days calculation
- **Evidence:** Need to verify if holidays.json is used in calculation
- **Root Cause:** Holidays data may not be passed to calculation function

#### 3. Missing Clear Button

- **File:** `src/features/leave-request/ui/DateRangeField.tsx` or `LeaveDetailsSection.tsx`
- **Issue:** No UI element to clear selected dates
- **Evidence:** User cannot easily reset date selection
- **User Impact:** Poor UX, requires manual date deselection

## Steps to Reproduce

1. Navigate to Leave Request form
2. Click on Date Range field to open calendar
3. Observe: Greek holidays are not highlighted
4. Select date range that includes holidays
5. Observe: Check if business days correctly excludes holidays
6. Try to clear selected dates
7. Observe: No clear button available, must open calendar and deselect manually

## Technical Details

### Current Implementation

**Date Range Picker:**

- Library: `react-day-picker` (currently v9)
- Component: `DateRangeField.tsx`
- Props: Receives form control and validation

**Holidays Data:**

- File: `data/holidays.json`
- Format: JSON array of holiday dates
- Usage: Should be used for both UI highlighting and calculation

**Business Days Service:**

- File: `src/features/leave-request/services/absenceDays.ts`
- Function: `calculateAbsenceDays(startDate, endDate, holidays)`
- Current State: May or may not exclude holidays

### Holiday Highlighting Requirements

The date picker should visually distinguish:

1. **Regular days** - Default styling
2. **Holidays** - Highlighted with different color (e.g., red or orange)
3. **Weekends** - Already handled by react-day-picker
4. **Selected range** - Current selection styling

### Business Days Calculation

Should calculate:

- Total calendar days
- Weekends excluded
- Holidays excluded
- Result: Actual business days (working days)

### Clear Button Placement

**Option 1 - In DateRangeField:**

- Position: Next to date input
- Icon: "X" or "Clear" text
- Action: Resets form field values for start and end dates

**Option 2 - In LeaveDetailsSection:**

- Position: Next to "Holidays legend"
- Text: "Clear Dates" button
- Action: Same as above

### Relevant Files

1. **`src/features/leave-request/ui/DateRangeField.tsx`**

   - Date range picker component
   - Needs holiday integration and clear button

2. **`src/features/leave-request/ui/LeaveDetailsSection.tsx`**

   - Contains DateRangeField
   - Alternative location for clear button

3. **`data/holidays.json`**

   - Contains Greek holidays data
   - Needs to be imported and used

4. **`src/features/leave-request/services/absenceDays.ts`**

   - Business days calculation logic
   - Needs to receive and use holidays data

5. **`src/features/leave-request/services/holidays/holidays.service.ts`**
   - Holiday data service (may exist)
   - Should provide holidays data to other components

### react-day-picker v9 API

```typescript
// Example of how to modify styling for holidays
const modifiers = {
  holiday: (date: Date) => isHoliday(date, holidays),
};

const modifiersStyles = {
  holiday: {
    color: 'red',
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
};
```

## Potential Causes

### 1. Missing Holiday Integration

DateRangeField was implemented without reading holidays.json, either because:

- Holidays feature was deferred to later
- Holiday integration was overlooked during implementation
- No clear requirement for holiday highlighting was specified

### 2. Service Not Connected

The business days calculation service may exist but:

- Does not receive holidays as parameter
- Holiday service not integrated with calculator
- Logic exists but not called properly

### 3. UI/UX Decision

Clear button may have been intentionally omitted due to:

- Design preference for minimal UI
- Assumption users can deselect dates manually
- Not considered during initial development

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Date Management:**
   - Users manually deselect dates in calendar
   - Limitations: Poor UX, extra clicks required

### Medium Term (Proper Fix)

1. **Integrate Holidays in DateRangeField:**

   - Import holidays.json or use holidays.service
   - Add `modifiers` prop to react-day-picker
   - Create `isHoliday(date: Date, holidays: string[])` utility
   - Apply custom styling to holiday dates
   - Expected outcome: Holidays visually highlighted in calendar

2. **Update Business Days Service:**

   - Ensure `calculateAbsenceDays()` receives holidays data
   - Filter out holiday dates from business days count
   - Update function signature if needed
   - Add unit tests for holiday exclusion
   - Expected outcome: Correct business days calculation

3. **Add Clear Button:**
   - Add button in DateRangeField or LeaveDetailsSection
   - Use form context to reset date fields
   - Add appropriate styling (icon or text)
   - Expected outcome: Easy date clearing for users

### Long Term (Architectural)

1. **Holiday Configuration Service:**

   - Create centralized holiday configuration
   - Support multiple countries/regions
   - Allow holiday updates without code changes
   - Benefits: Scalability, maintainability

2. **Reusable Date Range Picker:**

   - Move DateRangeField to shared components
   - Make holiday highlighting configurable
   - Add props for custom modifiers and styles
   - Benefits: Reusable across features

3. **Business Days Utility Library:**
   - Create robust business days calculation library
   - Support customizable weekend days (e.g., Fri-Sat in some regions)
   - Add support for custom holiday calendars
   - Benefits: Reusable, flexible, well-tested

## Additional Notes

- High priority: Business days calculation is critical for leave requests
- Holiday highlighting improves user experience and prevents selection of non-working days
- Clear button is important UX improvement
- Consider adding tooltip on holiday dates showing holiday name
- Test with various date ranges (spanning holidays, all holidays, no holidays)
- Ensure holiday dates are timezone-aware

## Related Issues

- [#012 - Leave Details Broken](004-leave-details-broken-issue-rep.md) - Duplicate issue that should be deprecated
- [Feature: Add Greek Locale and Lang Support](../features/add-gr-locale-and-lang-support/feature.md) - Related to Greek holiday support

## References

- File: `src/features/leave-request/ui/DateRangeField.tsx`
- File: `src/features/leave-request/services/absenceDays.ts`
- File: `data/holidays.json`
- File: `src/features/leave-request/services/holidays/holidays.service.ts`
- Documentation: [TODO.md](../../tasks/TODO.md) - Issue #04
- Library: [react-day-picker v9](https://daypicker.dev/)

