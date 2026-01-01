# Issue Report: Personal Details Form Validation Missing

**Issue ID:** 012
**Component:** Personal Details Section Form
**Date Discovered:** 2025-12-31
**Status:** Open
**Priority:** High

## Summary

Personal Details section form lacks proper validation for all fields, including specific Greek Identity Number (ADT) validation requirements.

## Problem Description

### Symptom

1. User navigates to Personal Details section
2. User can submit form with empty or invalid fields
3. No validation errors are displayed
4. Identity Number (ADT) does not validate against Greek requirements

### Investigation Details

#### 1. Missing Field Validation

- **File:** `src/features/leave-request/ui/LeaveRequestForm.tsx`
- **Issue:** Zod schema exists but validation may not be enforced or properly connected to form
- **Evidence:** Form accepts invalid data without showing errors
- **Fix Applied (if any):** None yet

#### 2. Greek ADT Validation Missing

- **File:** `src/features/leave-request/model/leaveRequest.schema.ts`
- **Root Cause:** Identity number validation only checks for non-empty string, not Greek ADT format
- **Evidence:** Greek ADT has multiple valid formats (standard format, AMKA, etc.) that should be validated

## Steps to Reproduce

1. Navigate to Leave Request form
2. Leave Personal Details fields empty or enter invalid data
3. Try to submit the form
4. Observe: No validation errors appear, form may submit with invalid data
5. Expected behavior: Each field should show validation errors when invalid
6. Actual behavior: No validation errors displayed

## Technical Details

### Validation Framework

- **Schema Library:** Zod
- **Form Library:** React Hook Form with Zod resolver
- **Current State:** Schema defined in leaveRequest.schema.ts but may not be properly connected

### Greek Identity Number (ADT) Requirements

The Greek Identity Number (Αριθμός Δελτίου Ταυτότητας - ADT) has multiple valid formats:

1. **Standard ADT Format:**
   - 8 digits in format: LLLDDDDD
   - LLL = 3-letter uppercase Greek letters
   - DDDDD = 5 digits (4 for date, 1 for parity)

2. **AMKA Format (Social Security Number):**
   - 11 digits
   - Specific checksum validation

3. **Passport Number:**
   - 2 letters + 7 digits
   - Or other international passport formats

### Relevant Files

1. **`src/features/leave-request/model/leaveRequest.schema.ts`**

   - Line 3-15: UserProfileSchema with validation rules
   - Line 9: identityNumber validation needs Greek-specific rules

2. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**

   - Line 62-65: React Hook Form setup with Zod resolver
   - May need to verify resolver is properly connected

3. **`src/features/leave-request/ui/PersonalDetailsSection.tsx`**

   - Contains personal details input fields
   - May need error display components

## Potential Causes

### 1. Zod Resolver Not Connected

React Hook Form may not be properly connected to the Zod resolver, causing validation to be bypassed.

### 2. Validation Not Triggered on Submit

Form may be configured to validate on submit, but submission handler bypasses validation.

### 3. Error Display Components Missing

Validation may be happening but error messages are not displayed in the UI.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Validation:**
   - Add inline validation in submit handler
   - Show alert for invalid fields
   - Limitations: Doesn't provide field-by-field feedback

### Medium Term (Proper Fix)

1. **Implement Greek ADT Validation:**
   - Create utility function to validate Greek identity number formats
   - Support multiple valid formats (ADT, AMKA, Passport)
   - Add specific error messages for each format
   - Expected outcome: Only valid Greek identity numbers accepted

2. **Connect Zod Resolver:**
   - Ensure React Hook Form properly uses zodResolver
   - Set mode to 'onTouched' or 'onChange' for immediate feedback
   - Verify error display in form fields
   - Expected outcome: Validation errors displayed for all fields

3. **Add Field-Specific Validation:**
   - Full Name: min 2 characters, Greek and Latin letters
   - Father's Name: min 2 characters, Greek and Latin letters
   - Email: valid email format
   - Phone: Greek phone format (+30 or 10 digits)
   - Identity Number: Greek ADT/AMKA/Passport formats
   - Expected outcome: Comprehensive field validation

### Long Term (Architectural)

1. **Reusable Validation Utilities:**
   - Create shared validation utilities for Greek-specific formats
   - Implement in separate `src/shared/lib/validation.ts`
   - Benefits: Reusable across features, consistent validation

2. **Validation Configuration:**
   - Create validation configuration module
   - Centralize all validation rules
   - Benefits: Easier maintenance, consistent behavior

## Additional Notes

- Greek users are primary target audience, so proper ADT validation is critical
- Multiple identity number formats should be supported (ADT, AMKA, Passport)
- Validation errors should be user-friendly and in the appropriate language
- Consider adding tooltips or help text explaining valid formats

## Related Issues

- None documented yet

## References

- File: `src/features/leave-request/model/leaveRequest.schema.ts`
- File: `src/features/leave-request/ui/LeaveRequestForm.tsx`
- Documentation: [TODO.md](../../tasks/TODO.md) - Issue #02
