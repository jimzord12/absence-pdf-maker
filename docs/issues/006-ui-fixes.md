# Issue Report: UI Fixes - Text Wrapping and Section Visibility

**Issue ID:** 006
**Component:** Leave Request Form UI
**Date Discovered:** 2025-12-30
**Status:** Open
**Priority:** Medium

## Summary

Personal Details section lacks text wrapping for long user input, and Absence Days calculation section appears only after selecting dates, causing inconsistent UI layout.

## Problem Description

### Symptom

1. User enters a long name, address, or other details in the Personal Details section
2. Text overflows or is cut off instead of wrapping within the input box
3. Absence Days calculation section only appears after selecting leave dates
4. UI layout shifts when the section appears, causing inconsistent user experience

### Investigation Details

#### 1. Text Wrapping Issue

- **File:** `src/features/leave-request/ui/PersonalDetailsSection.tsx`
- **Issue:** Input fields do not have proper text wrapping styling
- **Evidence:** User enters long text and it overflows
- **Fix Applied (if any):** None yet

#### 2. Section Visibility Issue

- **File:** `src/features/leave-request/ui/LeaveDetailsSection.tsx`
- **Root Cause:** Absence Days section is conditionally rendered only when dates are selected
- **Evidence:** UI layout shifts when dates are selected

## Steps to Reproduce

1. Navigate to the Leave Request form
2. In the Personal Details section, enter a very long name or address
3. Observe: Text overflows or is cut off instead of wrapping
4. Before selecting any dates, observe the layout
5. Select leave dates
6. Observe: Absence Days calculation section appears and UI layout shifts
7. Expected behavior: Text should wrap and Absence Days section should always be visible with '—' when no data
8. Actual behavior: Text overflows and section appears conditionally

## Technical Details

### UI Components

- **Component:** `PersonalDetailsSection`
- **Component:** `LeaveDetailsSection`
- **Styling:** CSS or Tailwind classes

### Relevant Files

1. **`src/features/leave-request/ui/PersonalDetailsSection.tsx`**

   - Contains input fields for personal details

2. **`src/features/leave-request/ui/LeaveDetailsSection.tsx`**

   - Contains Absence Days calculation display

3. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**

   - Main form component managing sections

## Potential Causes

### 1. Missing CSS Properties

Input fields may be missing CSS properties like `word-wrap`, `overflow-wrap`, or `white-space` to handle text wrapping.

### 2. Conditional Rendering

Absence Days section may be using conditional rendering (e.g., `{dates && <Section>}`) instead of always rendering with placeholder data.

## Suggested Solutions

### Short Term (Workaround)

1. **CSS Fixes:**
   - Add `word-wrap: break-word` and `white-space: normal-wrap` to input fields
   - Limitations: May not solve all text wrapping scenarios

### Medium Term (Proper Fix)

1. **Text Wrapping:**
   - Add proper CSS classes for text wrapping in all input fields
   - Ensure consistent behavior across all text inputs
   - Expected outcome: All text wraps properly within input boxes

2. **Section Visibility:**
   - Change conditional rendering to always render Absence Days section
   - Display '—' when no dates are selected
   - Expected outcome: Consistent UI layout with no shifts

### Long Term (Architectural)

1. **UI Consistency Review:**
   - Audit all form sections for similar conditional rendering issues
   - Establish consistent patterns for empty state display
   - Benefits: Improved user experience and maintainability

## Additional Notes

- This issue affects user experience and form usability
- Consistent UI layout prevents user confusion
- Text wrapping ensures all information is visible

## Related Issues

- None documented yet

## References

- File: `src/features/leave-request/ui/PersonalDetailsSection.tsx`
- File: `src/features/leave-request/ui/LeaveDetailsSection.tsx`
