# Issue Report: Remove Duplicate Fields and Set Default Company Name in Employment Details

**Issue ID:** 011
**Component:** Employment Details Section
**Date Discovered:** 2025-12-30
**Status:** Open
**Priority:** Medium

## Summary

Employment Details section contains duplicate fields (Employer ID, Employer Name) that should be removed, and the Company Name field should have a default value of "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε" to improve form usability and reduce user input.

## Problem Description

### Symptom

1. User navigates to Leave Request form
2. User sees Employer ID and Employer Name fields in Employment Details section
3. These fields contain duplicate or redundant information
4. Company Name field is empty by default
5. User must manually enter company name each time

### Investigation Details

#### 1. Duplicate Fields

- **File:** `src/features/leave-request/ui/EmploymentDetailsSection.tsx`
- **Issue:** Employer ID and Employer Name fields exist but are not needed
- **Evidence:** Form fields that duplicate information or serve no purpose
- **Fix Applied (if any):** None yet

#### 2. Missing Default Value

- **File:** `src/features/leave-request/ui/EmploymentDetailsSection.tsx` or store initialization
- **Root Cause:** Company Name field does not have a default value set
- **Evidence:** Field is empty when form loads

## Steps to Reproduce

1. Open the application and navigate to Leave Request form
2. Scroll to Employment Details section
3. Observe fields in the section
4. Expected behavior: No Employer ID or Employer Name fields, Company Name pre-filled with "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
5. Actual behavior: Employer ID and Employer Name fields present, Company Name empty

## Technical Details

### Form Structure

- **Component:** `EmploymentDetailsSection`
- **Validation:** Zod schema for form validation
- **State Management:** Zustand store with default values

### Relevant Files

1. **`src/features/leave-request/ui/EmploymentDetailsSection.tsx`**

   - Employment Details form section
   - Contains the fields to be removed/modified

2. **`src/features/leave-request/model/leaveRequest.schema.ts`**

   - Zod schema defining form fields and validation
   - Must be updated to remove deprecated fields

3. **`src/features/leave-request/state/leaveRequest.store.ts`**

   - Store initialization with default values
   - Should set default Company Name

4. **`src/features/leave-request/services/persistence.ts`**

   - Will need updates to handle field changes (covered by #008)

### Fields to Remove

```typescript
// Remove these fields from schema and UI
- employerId
- employerName
```

### Fields to Update

```typescript
// Add default value for this field
- companyName: default "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
```

## Potential Causes

### 1. Legacy Fields

Employer ID and Employer Name may be legacy fields from a previous version of the form that are no longer needed.

### 2. Manual Entry Required

Company Name field may be intentionally left empty to force users to enter it, but this causes unnecessary effort when most users are from the same company.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Entry:**
   - Users manually enter Company Name each time
   - Limitations: Unnecessary repetition, poor UX

### Medium Term (Proper Fix)

1. **Remove Duplicate Fields:**
   - Delete Employer ID and Employer Name from UI component
   - Remove from Zod schema validation
   - Expected outcome: Cleaner form without redundant fields

2. **Set Default Company Name:**
   - Add default value "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε" to Company Name field in store
   - Initialize field with this value when form loads
   - Expected outcome: Company Name pre-filled, users can edit if needed

### Long Term (Architectural)

1. **Multi-Company Support:**
   - Add company selector dropdown
   - Load company information from configuration
   - Benefits: Support multiple companies without code changes
   - Implementation: Create company configuration service

2. **Dynamic Form Configuration:**
   - Make field visibility configurable
   - Allow different field sets for different companies/departments
   - Benefits: Flexible form for different use cases

## Additional Notes

- Blocking issue #008 (Import/Export Profile Update)
- Reduces user friction by pre-filling known information
- Improves form usability and reduces input errors
- Consider if Company Name should be editable or locked after setting default

## Related Issues

- [#008 - Update Import/Export Profile](008-update-import-export-profile.md) - Blocked by this issue

## References

- File: `src/features/leave-request/ui/EmploymentDetailsSection.tsx`
- File: `src/features/leave-request/model/leaveRequest.schema.ts`
- File: `src/features/leave-request/state/leaveRequest.store.ts`
