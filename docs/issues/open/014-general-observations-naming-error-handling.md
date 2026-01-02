# Issue Report: General Observations - Section Naming and Error Handling

**Issue ID:** 014
**Component:** UI Components and Error Handling
**Date Discovered:** 2025-12-31
**Status:** Open
**Priority:** Medium

## Summary

Multiple UI sections share identical names between form inputs and read-only summary sections, causing confusion when communicating about specific components. Additionally, error handling should use toast notifications instead of brief red box overlays for better user experience.

## Problem Description

### Symptom

1. Personal Details name used for both form section and read-only summary section
2. Leave Details name used for both form section and date range summary section
3. When discussing changes, it's unclear which component is being referenced
4. Error messages appear as brief red boxes instead of persistent toast notifications
5. User cannot easily reference errors after they disappear

### Investigation Details

#### 1. Duplicate Section Names

- **Files:**
  - `src/features/leave-request/ui/PersonalDetailsSection.tsx` (Form)
  - `src/features/leave-request/ui/ReviewAndGenerate.tsx` (Summary)
  - `src/features/leave-request/ui/LeaveDetailsSection.tsx` (Form)
- **Issue:** Components share identical names, making identification difficult
- **Evidence:** Cannot distinguish between form and summary when referencing
- **Fix Applied (if any):** None yet

#### 2. Poor Error Handling

- **Files:** Various components throughout the application
- **Root Cause:** Error messages shown as temporary red box overlays
- **Evidence:** PDF generation failures show brief red alert on Personal Details Summary
- **Impact:** Users cannot read errors properly, poor UX

## Steps to Reproduce

1. Navigate to Leave Request form
2. Observe Personal Details section (form input) and Personal Details (read-only summary)
3. Try to generate PDF with invalid data
4. Observe: Red box error appears briefly on Personal Details Summary
5. Try to discuss "Personal Details" changes with developer
6. Observe: Cannot distinguish which Personal Details component is being discussed

## Technical Details

### Current Naming Structure

**Personal Details:**
- Form Input Section: `PersonalDetailsSection`
- Read-only Summary: Displayed in `ReviewAndGenerate` as "Personal Details"

**Leave Details:**
- Form Input Section: `LeaveDetailsSection`
- Date Range Summary: Displayed as "Leave Details" in summary

### Error Handling

**Current Implementation:**
- Errors displayed as red box overlays on components
- Messages appear briefly and disappear
- No persistent error notification system
- User cannot reference error after it disappears

### Suggested Naming Structure

**Option 1 - Add Context:**
- Form: `Personal Details Form` / `Leave Details Form`
- Summary: `Personal Details Summary` / `Leave Details Summary`

**Option 2 - Add Component Type:**
- Form: `Personal Details (Input)` / `Leave Details (Input)`
- Summary: `Personal Details (Preview)` / `Leave Details (Preview)`

### Suggested Error Handling

**Toast Notification System:**
- Library: `react-toastify`
- Position: Top-right or top-center
- Type: Error, warning, success, info
- Duration: Configurable (default 5-10 seconds for errors)
- Dismissable: Allow user to close manually
- Multiple toasts: Stack multiple notifications if needed

### Relevant Files

1. **`src/features/leave-request/ui/PersonalDetailsSection.tsx`**
   - Form input section for personal details
   - Needs component name update

2. **`src/features/leave-request/ui/LeaveDetailsSection.tsx`**
   - Form input section for leave details
   - Needs component name update

3. **`src/features/leave-request/ui/ReviewAndGenerate.tsx`**
   - Read-only summary sections
   - Needs section title updates

4. **`package.json`**
   - Needs `react-toastify` dependency

5. **Component files with error handling**
   - Replace red box overlays with toast notifications

## Potential Causes

### 1. Development Convenience

Using identical names was convenient during initial development but creates confusion during communication and maintenance.

### 2. No Error Notification System

No centralized error notification system was implemented, leading to ad-hoc red box error displays.

## Suggested Solutions

### Short Term (Workaround)

1. **Naming Documentation:**
   - Document naming confusion in project docs
   - Use full component paths when discussing changes
   - Limitations: Still causes confusion, temporary fix

### Medium Term (Proper Fix)

1. **Update Component Names:**
   - Rename form sections to include "Form" or "Input"
   - Rename summary sections to include "Summary" or "Preview"
   - Update all references in documentation and code comments
   - Expected outcome: Clear identification of components

2. **Install and Configure react-toastify:**
   - Add `react-toastify` to dependencies
   - Create ToastContainer in app root
   - Update error handling to use toast.error()
   - Expected outcome: Persistent, user-friendly error notifications

3. **Centralized Error Handler:**
   - Create utility function for error notifications
   - Support different toast types (error, warning, success, info)
   - Configure default settings (duration, position, styling)
   - Expected outcome: Consistent error handling across app

### Long Term (Architectural)

1. **Component Naming Convention:**
   - Establish naming convention for form vs summary components
   - Document convention in coding standards
   - Enforce in code review
   - Benefits: Clear communication, easier maintenance

2. **Error Boundary and Toast System:**
   - Implement React Error Boundaries
   - Centralize error catching and toast notification
   - Log errors to monitoring service
   - Benefits: Better error tracking, improved UX

## Additional Notes

- Medium priority: Affects developer communication and user experience
- Naming convention should be discussed with team before implementing
- Toast notifications improve accessibility for users with screen readers
- Consider internationalizing toast messages

## Related Issues

- [#007 - PDF Generation Failure](007-pdf-generation-failure.md) - Uses red box error display that should be replaced with toast

## References

- Component: `src/features/leave-request/ui/PersonalDetailsSection.tsx`
- Component: `src/features/leave-request/ui/LeaveDetailsSection.tsx`
- Component: `src/features/leave-request/ui/ReviewAndGenerate.tsx`
- Documentation: [TODO.md](../../tasks/TODO.md) - Issue #00
- Library: [react-toastify](https://fkhadra.github.io/react-toastify/introduction)
