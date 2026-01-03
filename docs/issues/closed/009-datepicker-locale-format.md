# Issue Report: DatePicker Format Should Match Selected Locale

**Issue ID:** 009
**Component:** DatePicker Components
**Date Discovered:** 2025-12-30
**Status:** closed
**Priority:** Medium

## Summary

DatePicker components currently use "MM/DD/YYYY" format, but should display dates in locale-specific format: "DD/MM/YYYY" for Greek (gr) and "MM/DD/YYYY" for English (en) users.

## Problem Description

### Symptom

1. User selects Greek locale in application settings
2. DatePicker displays dates in "MM/DD/YYYY" format
3. Users unfamiliar with this format may enter incorrect dates
4. Date format does not align with Greek conventions

### Investigation Details

#### 1. Hardcoded Date Format

- **File:** `src/features/leave-request/ui/LeaveDetailsSection.tsx` or DatePicker components
- **Issue:** Date format is hardcoded or not locale-aware
- **Evidence:** All users see "MM/DD/YYYY" regardless of locale setting
- **Fix Applied (if any):** None yet

#### 2. Missing Locale Integration

- **File:** Various DatePicker components across the application
- **Root Cause:** DatePicker components do not read current locale setting
- **Evidence:** No locale-based date formatting logic

## Steps to Reproduce

1. Open the application
2. Change locale to Greek (gr) in settings
3. Navigate to Leave Request form
4. Observe DatePicker display format
5. Expected behavior: Dates should show as "DD/MM/YYYY" for Greek locale
6. Actual behavior: Dates show as "MM/DD/YYYY" regardless of locale

## Technical Details

### Date Handling

- **Date Library:** date-fns
- **Locale Support:** Greek (gr) and English (en) implemented in feature: add-gr-locale-and-lang-support
- **Component:** Custom DatePicker or third-party date input component

### Relevant Files

1. **`src/features/leave-request/ui/DateRangeField.tsx`**

   - Contains DatePicker for leave date range selection

2. **`src/shared/lib/dates.ts`**

   - Date utility functions
   - May contain locale-related date formatting

3. **`src/features/leave-request/ui/LeaveDetailsSection.tsx`**

   - Contains date range field in the form

### Locale Configuration

```typescript
// Expected format mapping
const DATE_FORMATS = {
  gr: 'dd/MM/yyyy', // Greek locale
  en: 'MM/dd/yyyy', // English locale
};
```

## Potential Causes

### 1. Hardcoded Format String

DatePicker components may use a hardcoded format string like `MM/dd/yyyy` instead of reading the current locale.

### 2. Missing Locale Context

DatePicker components may not have access to the current locale context or state.

### 3. Library Limitation

The DatePicker library may not support dynamic locale switching or may require specific configuration.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Date Entry:**
   - Users manually enter dates in the correct format
   - Limitations: Prone to errors, poor UX

### Medium Term (Proper Fix)

1. **Locale-Aware Date Formatting:**

   - Create a utility function that returns format string based on current locale
   - Apply format to all DatePicker components
   - Expected outcome: Dates display in locale-appropriate format

2. **DatePicker Configuration:**
   - Configure DatePicker component to accept locale prop
   - Pass current locale from app state
   - Expected outcome: Dynamic format switching when locale changes

### Long Term (Architectural)

1. **Centralized Date Configuration:**

   - Create a shared date configuration module
   - Centralize all locale-specific date settings
   - Benefits: Consistency across the application, easier maintenance

2. **i18n Integration:**
   - Integrate with a full i18n library (e.g., i18next)
   - Use library's date formatting capabilities
   - Benefits: Comprehensive localization support

## Additional Notes

- Blocked by feature: [add-gr-locale-and-lang-support](../open/docs/features/add-gr-locale-and-lang-support/feature.md)
- Important for Greek user experience as they are the primary user base
- Consider date input format as well as display format
- Ensure validation also respects locale format

## Related Issues

- Feature: [add-gr-locale-and-lang-support](../open/docs/features/add-gr-locale-and-lang-support/feature.md) - Implements locale switching functionality

## References

- File: `src/features/leave-request/ui/DateRangeField.tsx`
- File: `src/shared/lib/dates.ts`
- Documentation: date-fns locale configuration

