# Issue Report: Employment Details Form Validation Missing

**Issue ID:** 013
**Component:** Employment Details Section Form
**Date Discovered:** 2025-12-31
**Status:** Closed
**Priority:** Medium

## Summary

Employment Details section form lacks proper validation, allowing submission with empty or invalid data in critical fields like Company Name, Department, and Position.

## Problem Description

### Symptom

1. User navigates to Employment Details section
2. User can leave Company Name, Department, or Position empty
3. User can submit form without validating these fields
4. No validation errors are displayed for missing required information

### Investigation Details

#### 1. Missing Required Field Validation

- **File:** `src/features/leave-request/model/leaveRequest.schema.ts`
- **Issue:** Employment fields may have Zod validation but not enforced in UI
- **Evidence:** Form accepts empty company name, department, or position
- **Fix Applied (if any):** None yet

#### 2. Field Validation Rules Incomplete

- **File:** `src/features/leave-request/ui/EmploymentDetailsSection.tsx`
- **Root Cause:** Validation errors not displayed for required fields
- **Evidence:** User can bypass filling out employment information

## Steps to Reproduce

1. Navigate to Leave Request form
2. Go to Employment Details section
3. Leave Company Name, Department, or Position fields empty
4. Try to submit the form
5. Observe: No validation errors, form may submit with empty fields
6. Expected behavior: Required fields should show validation errors
7. Actual behavior: Form submits without employment information

## Technical Details

### Employment Fields

- **Company Name:** Should be required (defaults to "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε")
- **Department:** Should be required
- **Position:** Should be required
- **Employee ID:** Optional field (as per existing implementation)

### Current Validation State

- **Schema:** UserProfileSchema in leaveRequest.schema.ts has validation
- **Form:** React Hook Form with Zod resolver
- **UI:** Errors may not be displayed to users

### Relevant Files

1. **`src/features/leave-request/model/leaveRequest.schema.ts`**

   - Line 3-15: UserProfileSchema with employment field validation
   - Line 11: companyName validation rule
   - Line 12: department validation rule
   - Line 13: position validation rule

2. **`src/features/leave-request/ui/EmploymentDetailsSection.tsx`**

   - Contains employment details input fields
   - Should display validation errors

3. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**

   - Line 62-85: Form setup with default values
   - Line 73: Default company name "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"

## Potential Causes

### 1. Validation Errors Not Displayed

Zod validation may be working, but error messages are not being passed to or displayed by form components.

### 2. Default Value Bypasses Validation

Company name has a default value that may mask validation issues in that field.

### 3. Submit Handler Bypasses Validation

Form submission may not be properly connected to form validation, allowing bypass of required fields.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Validation:**
   - Check required fields in submit handler
   - Show alert if missing
   - Limitations: Doesn't provide field-by-field feedback

### Medium Term (Proper Fix)

1. **Ensure Error Display:**

   - Verify validation errors are passed to Input components
   - Display error messages below each field
   - Use red color and clear messaging
   - Expected outcome: Users see which fields need correction

2. **Strengthen Field Validation:**

   **Company Name:**

   - Required: Yes
   - Min length: 2 characters
   - Pattern: Allow letters, numbers, spaces, Greek characters
   - Default: "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε" (should be editable)

   **Department:**

   - Required: Yes
   - Min length: 2 characters
   - Pattern: Allow letters, numbers, spaces, Greek characters

   **Position:**

   - Required: Yes
   - Min length: 2 characters
   - Pattern: Allow letters, numbers, spaces, Greek characters

   **Employee ID:**

   - Required: No
   - Pattern: Alphanumeric, allow common formats
   - Expected outcome: Proper validation for all fields

3. **Visual Validation Feedback:**
   - Add red border to invalid fields
   - Show asterisk (\*) for required fields
   - Display error messages in red text below fields
   - Expected outcome: Clear visual indicators of validation state

### Long Term (Architectural)

1. **Form Field Component Enhancement:**

   - Enhance Input component to handle validation display
   - Add required field indicator
   - Support multiple validation rules per field
   - Benefits: Consistent validation across all forms

2. **Validation Config Module:**
   - Create shared validation configuration
   - Define validation rules for all field types
   - Centralize error messages
   - Benefits: Maintainable, consistent validation

## Additional Notes

- Company name has a default value that should remain editable
- All employment details are important for the leave request PDF
- Validation should be in Greek (default) and English
- Consider adding department dropdown with common options
- Consider adding position dropdown with common options

## Related Issues

- [012 - Personal Details Form Validation Missing](./012-personal-details-validation-missing.issue-rep.md)

## References

- File: `src/features/leave-request/model/leaveRequest.schema.ts`
- File: `src/features/leave-request/ui/EmploymentDetailsSection.tsx`
- File: `src/features/leave-request/ui/LeaveRequestForm.tsx`
- Documentation: [TODO.md](../../tasks/TODO.md) - Issue #03

