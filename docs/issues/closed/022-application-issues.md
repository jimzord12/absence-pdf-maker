# Issue Report: Application Issues - Translation System, Console Spam, and UX Improvements

**Issue ID:** 022
**Component:** Application-wide (i18n, UI Components)
**Date Discovered:** 2026-01-09
**Status:** Closed
**Priority:** Critical (Translation), High (Console), Medium (UX)

## Summary

Critical and high-severity issues discovered during Playwright browser automation testing:

1. **CRITICAL:** Translation keys displayed instead of actual Greek text throughout the application
2. **HIGH:** Console flooded with thousands of i18next missingKey warnings
3. **MEDIUM:** Date picker selection visibility (visual styling issue, not functional)
4. **MEDIUM:** Leave Allowance field always shows "No" instead of actual values
5. **LOW:** PWA Install button prominence (addressed by task-135)

## Problem Description

### Issue 1: Translation Keys Displayed Instead of Translated Text (CRITICAL)

**Severity:** Critical
**Impact:** User experience completely broken in Review section and other areas

Large portions of the application are displaying translation keys instead of the actual translated Greek text.

**Affected Sections:**

**Review Section:**
- `forms.review.heading` instead of "Παρουσίαση Αίτησης"
- `forms.personal.heading` instead of "Προσωπικά Στοιχεία"
- `forms.leave.heading` instead of "Στοιχεία Άδειας"
- `forms.actions.heading` instead of "Ενέργειες"

**Personal Details Labels:**
- `messages.fields.fullName` instead of "Ονοματεπώνυμο"
- `messages.fields.fathersName` instead of "Πατρώνυμο"
- `messages.fields.email` instead of "Διεύθυνση Email"
- `messages.fields.phone` instead of "Αριθμός Τηλεφώνου"
- `messages.fields.identityNumber` instead of "Αριθμός Ταυτότητας (ΑΔΤ)"
- `messages.fields.employeeId` instead of "Αριθμός Υπαλλήλου"
- `messages.fields.companyName` instead of "Επωνυμία Εταιρείας"
- `messages.fields.department` instead of "Τμήμα"
- `messages.fields.position` instead of "Θέση"

**Leave Details Labels:**
- `forms.leave.leaveType` instead of "Τύπος Άδειας"
- `forms.dateRange.leaveAllowance` instead of "Ημερήσια Άδεια"
- `forms.dateRange.startDate` instead of "Ημερομηνία Έναρξης"
- `forms.dateRange.endDate` instead of "Ημερομηνία Λήξης"
- `forms.leave.reason` instead of "Λόγος"
- `forms.signature.label` instead of "Υπογραφή"
- `common.status.signed` instead of "Υπογεγραμμένο"
- `common.status.update` instead of "Ενημέρωση"

**Absence Calculation Section:**
- `forms.leave.absence.calculationHeading` instead of "Υπολογισμός Ημερών"
- `forms.leave.absence.totalDays` instead of "Συνολικές Ημέρες"
- `forms.leave.absence.weekendDays` instead of "Σαββατοκύριακα"
- `forms.leave.absence.holidayDays` instead of "Αργίες"
- `forms.leave.absence.absenceDays` instead of "Ημέρες Απουσίας"

**Actions Buttons:**
- `common.buttons.exportProfile` instead of "Εξαγωγή"
- `common.buttons.importProfile` instead of "Εισαγωγή"
- `common.buttons.clearProfile` instead of "Καθαρισμός"
- `pdf.clickToGenerate` instead of "Δημιουργία PDF"
- `pdf.loadingMessage` instead of "Φόρτωση..."

**Root Cause:**
The translation system (i18next) is failing to resolve these keys. The console is flooded with warnings like:
```
i18next::translator: missingKey gr common forms.leave.types.annual forms.leave.types.annual
```

This indicates the Greek (`gr`) locale translation files are missing these keys or have incorrect key paths.

### Issue 2: Console Spam Flood (HIGH)

**Severity:** High
**Impact:** Performance degradation, difficult debugging, unprofessional in production

The browser console is being flooded with thousands of repeated `missingKey` warnings from i18next. Each user interaction triggers dozens (sometimes hundreds) of duplicate warnings.

**Example Warnings (each repeated dozens of times):**
```
i18next::translator: missingKey gr common forms.leave.types.annual forms.leave.types.annual
i18next::translator: missingKey gr common forms.leave.types.sick forms.leave.types.sick
i18next::translator: missingKey gr common forms.leave.types.unpaid forms.leave.types.unpaid
i18next::translator: missingKey gr common forms.leave.types.other forms.leave.types.other
i18next::translator: missingKey gr common forms.review.heading forms.review.heading
i18next::translator: missingKey gr common forms.personal.heading forms.personal.heading
i18next::translator: missingKey gr common messages.fields.fullName messages.fields.fullName
... (and many more)
```

**Impact:**
- Console becomes unusable for debugging
- Performance degradation due to excessive logging
- Unprofessional appearance in production (if debug mode is left on)
- Each render cycle repeats the same warnings

### Issue 3: Date Picker Selection Visibility (MEDIUM)

**Severity:** Medium (UX issue, not functional bug)
**Impact:** User confusion, but functionality works correctly

The user reported "selected dates are not visible in the date picker", but testing reveals that date selection **IS working correctly**.

**Actual Behavior:**
- When a date range is selected (e.g., Jan 9 to Feb 16), all dates in the range are marked with `[selected]` attribute in the accessibility tree
- The selection spans correctly across multiple months
- The date range summary section shows correct calculations (total days, weekend days, holidays, absence days)
- Both January and February calendars show all selected dates highlighted

**Root Cause:**
The visual highlighting style (CSS) for selected dates is too subtle or has poor contrast. Dates are marked as "selected" programmatically but not visually distinct enough for users to notice.

### Issue 4: Leave Allowance Field Always Shows "No" (MEDIUM)

**Severity:** Medium
**Impact:** Feature may be broken or not implemented

In the Review section, the "Leave Allowance" field consistently displays `common.no` (or its translation key) instead of an actual number or user input.

**Expected Behavior:**
- Should display the number of available leave days
- Should allow user to input their leave allowance
- Should be used for validation (cannot request more days than available)

**Current State:**
The field shows `common.no` instead of a numeric value, suggesting either:
- The feature is not implemented
- The translation key is wrong
- The field is not connected to any data source

## Steps to Reproduce

1. Navigate to http://localhost:5173
2. Observe the Review section and other UI elements
3. Notice translation keys displayed instead of Greek text
4. Open browser console and observe thousands of `missingKey` warnings
5. Select a date range in the date picker
6. Observe that selected dates are hard to see visually
7. Check the Leave Allowance field in the Review section
8. Observe it displays "No" instead of a numeric value

## Technical Details

### Translation System

**Files to Check:**
- `src/i18n/locales/gr/common.json` or `src/i18n/locales/gr/translation.json`
- `src/i18n.ts` (or similar configuration file)

**Required Keys (missing in Greek locale):**
- `forms.review.heading`
- `forms.personal.heading`
- `forms.leave.heading`
- `forms.actions.heading`
- `messages.fields.fullName`
- `messages.fields.fathersName`
- `messages.fields.email`
- `messages.fields.phone`
- `messages.fields.identityNumber`
- `messages.fields.employeeId`
- `messages.fields.companyName`
- `messages.fields.department`
- `messages.fields.position`
- `forms.leave.leaveType`
- `forms.dateRange.leaveAllowance`
- `forms.dateRange.startDate`
- `forms.dateRange.endDate`
- `forms.leave.reason`
- `forms.signature.label`
- `common.status.signed`
- `common.status.update`
- `forms.leave.absence.calculationHeading`
- `forms.leave.absence.totalDays`
- `forms.leave.absence.weekendDays`
- `forms.leave.absence.holidayDays`
- `forms.leave.absence.absenceDays`
- `common.buttons.exportProfile`
- `common.buttons.importProfile`
- `common.buttons.clearProfile`
- `pdf.clickToGenerate`
- `pdf.loadingMessage`
- `forms.leave.types.annual`
- `forms.leave.types.sick`
- `forms.leave.types.unpaid`
- `forms.leave.types.other`

### Date Picker Styling

**Files to Check:**
- `src/features/leave-request/ui/DateRangeField.tsx` (or similar)
- Check Tailwind classes for `rdp-day_selected`
- Review color contrast and visual indicators

### Leave Allowance

**Files to Check:**
- `src/features/leave-request/model/leaveRequest.schema.ts`
- `src/features/leave-request/ui/LeaveRequestForm.tsx`
- Check if leaveAllowance field is properly connected

## Suggested Solutions

### Issue 1 & 2: Translation System Fix (CRITICAL)

1. **Fix all missing translation keys in Greek locale file**
   - Add all missing keys listed above to `src/i18n/locales/gr/*.json`
   - Verify key paths match i18next namespace structure
   - Test all UI text displays correctly

2. **Disable i18next debug mode in production**
   - Set `debug: false` in i18next config
   - Consider environment-based configuration

3. **Implement translation key validation in CI/CD pipeline**
   - Add a script to verify all keys exist in all locales
   - Fail build if missing keys detected

### Issue 3: Date Picker Visual Styling (MEDIUM)

1. **Verify the CSS styling for `rdp-day_selected`**
2. **Ensure sufficient color contrast for selected dates**
   - Dark background with light text, or strong border
3. **Add a clear visual indicator**
   - Checkmark icon or bold font weight
4. **Test with different color themes** (light/dark mode)
5. **Consider adding a visual "range" indicator** showing start/end dates distinctly

### Issue 4: Leave Allowance (MEDIUM)

1. **Verify feature implementation**
   - Check if leaveAllowance field exists in schema
   - Verify it's connected to the form
2. **Add proper data source**
   - Connect to user profile data
   - Allow user to input leave allowance
3. **Add validation**
   - Cannot request more days than available

## Acceptance Criteria

### Critical (Must Fix Immediately)

- [ ] All translation keys resolve to actual Greek text
- [ ] No translation keys displayed in UI
- [ ] Review section displays proper Greek text
- [ ] All form labels show translated text
- [ ] All buttons show translated text
- [ ] Console shows zero `missingKey` warnings

### High Priority

- [ ] i18next debug mode disabled in production
- [ ] Translation key validation script added to CI/CD
- [ ] Console logs clean (no spam)

### Medium Priority

- [ ] Date picker selected dates are visually distinct
- [ ] Date picker has sufficient color contrast (WCAG AA)
- [ ] Leave Allowance field displays numeric values
- [ ] Leave Allowance field allows user input
- [ ] Leave Allowance validation implemented

### Low Priority

- [ ] PWA Install button UX improved (task-135 completed)

## Additional Notes

**Working Correctly:**
- Date range calculation logic works perfectly
- Form data persistence works (Zustand store with persist middleware)
- Absence days calculation is accurate
- Weekend and holiday detection works

**Browser/Environment:**
- Tested via Playwright browser automation
- URL: http://localhost:5173
- Headless mode with screenshots captured
- Console messages and accessibility tree analyzed

**Date Format:**
- Selected dates stored and displayed in DD/MM/YYYY format
- January 9, 2026 → "09/01/2026"
- February 16, 2026 → "16/02/2026"

## Related Issues

- Task-135: Improve PWA Install Button UX (completed, addresses low severity issue)

## References

- Source: `APPLICATION_ISSUES.md` in project root
- Test Date: January 9, 2026
- Testing Method: Playwright Browser Automation
