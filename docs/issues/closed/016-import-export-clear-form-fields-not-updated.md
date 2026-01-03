# Issue Report: Import/Export/Clear Profile - Form Fields Not Updated

**Issue ID:** 016
**Component:** Profile Data Persistence Service
**Date Discovered:** 2026-01-03
**Status:** Closed
**Priority:** High
**Task ID:** 066-fix-issue-016-import-export-clear-sync

## Summary

Clear and Import profile operations update the Read-only Summary but do not update the form fields. Additionally, Import throws errors for incomplete data instead of accepting partial data with a toast notification.

## Problem Description

### Symptom

1. User clicks "Clear" button to reset profile
2. Read-only Summary shows empty data but form fields retain previous values
3. User imports a profile JSON file
4. Read-only Summary shows imported data but form fields remain empty
5. User imports a JSON file with incomplete/invalid data
6. Application throws error instead of accepting partial data and showing notification

### Investigation Details

#### 1. Clear Operation Doesn't Reset Form Fields

- **File:** `src/features/leave-request/services/persistence.ts` and related form components
- **Issue:** Clear function only clears persisted store state, does not reset React Hook Form state
- **Evidence:** After clearing, form inputs still show old data while summary shows empty
- **Fix Applied (if any):** None yet

#### 2. Import Operation Doesn't Populate Form Fields

- **File:** `src/features/leave-request/services/persistence.ts`
- **Root Cause:** Import function updates Zustand store but does not sync with React Hook Form
- **Evidence:** Read-only Summary (which reads from store) updates, but form fields (controlled by RHF) remain empty

#### 3. Import Rejects Incomplete Data

- **File:** `src/features/leave-request/services/persistence.ts`
- **Issue:** Import validates entire profile against full schema, rejects if any field is invalid
- **Evidence:** Error thrown: "Failed to import profile: Invalid profile data: fullName: Full name is required..."
- **Expected Behavior:** Should accept partial valid data and notify user about missing/invalid fields via toast

## Steps to Reproduce

### Clear Issue:

1. Fill out form fields with personal data
2. Observe: Read-only Summary shows the data
3. Click "Clear" button to reset profile
4. Observe: Read-only Summary shows empty data, but form fields still contain previous values
5. Expected: Both summary and form fields should be cleared

### Import Issue:

1. Fill out form fields (or use existing data)
2. Export profile to JSON file
3. Clear the form/profile
4. Import the exported JSON file
5. Observe: Read-only Summary shows imported data, form fields remain empty
6. Expected: Both summary and form fields should be populated

### Incomplete Data Issue:

1. Create a JSON file with incomplete data (missing some required fields)
2. Try to import this file
3. Observe: Application throws error and rejects the import
4. Expected: Should import valid partial data and show toast notification about missing/invalid fields

Example incomplete JSON:
```json
{
  "fullName": "Dimitrios Stamatakis",
  "email": "mscres-72@uniwa.gr",
  "department": "Engineering",
  "position": "Full-Stack Dev"
  // Missing: phone, identityNumber, fathersName, etc.
}
```

## Technical Details

### State Architecture

- **Form State:** React Hook Form (`useForm` hook) with Zod validation
- **Persisted State:** Zustand store with `persist` middleware
- **UI Binding:** Form fields controlled by RHF, Summary displays data from Zustand store

### Data Flow

```
User Action → Service Function → Zustand Store Update
                                         ↓
                           (Missing Sync) → React Hook Form Reset/Update
```

### Relevant Files

1. **`src/features/leave-request/services/persistence.ts`**
   - Contains `clearProfile()` and `importProfile()` functions
   - Manages localStorage operations

2. **`src/features/leave-request/ui/components/ReviewAndGenerate.tsx`** or related component
   - Contains Import, Export, Clear buttons
   - Calls persistence service functions

3. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**
   - Main form component using React Hook Form
   - Needs to sync with store after clear/import operations

4. **`src/features/leave-request/model/leaveRequest.schema.ts`**
   - Zod schema for profile validation
   - Used for form validation and potentially for import validation

5. **`src/features/leave-request/state/leaveRequest.store.ts`**
   - Zustand store with persisted profile data

## Potential Causes

### 1. Missing Form State Sync

Clear and Import functions only update the Zustand store but do not trigger a reset or update of the React Hook Form state. The form state is managed separately and requires explicit synchronization.

### 2. Strict Schema Validation on Import

Import function validates the entire profile against the full Zod schema. This causes rejection of any JSON with missing or invalid fields, even if some data is valid and useful.

### 3. No Partial Data Handling Logic

No logic exists to handle partial data gracefully. The system expects complete, valid profiles only, which is not user-friendly for import operations.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Reset After Clear:**
   - Users must manually clear each form field after clicking Clear
   - Limitations: Poor UX, extra user effort

2. **Use Complete Profiles Only:**
   - Ensure exported profiles are always complete and valid
   - Limitations: Does not solve import of partial data issue

### Medium Term (Proper Fix)

1. **Sync Form State on Clear:**

   - Add form reset logic to clear function
   - Use `form.reset()` from React Hook Form after clearing store
   - Expected outcome: Both form and summary cleared after Clear button

2. **Sync Form State on Import:**

   - Add form update logic to import function
   - Use `form.reset(importedData)` to populate form fields
   - Expected outcome: Both form and summary populated after Import

3. **Partial Data Support for Import:**

   - Change import validation to use `safeParse()` instead of `parse()`
   - Extract valid fields from partial data
   - Show toast notification with details of missing/invalid fields
   - Write comprehensive unit tests for partial data scenarios
   - Expected outcome: Users can import partial profiles and see notification about issues

### Long Term (Architectural)

1. **Unified State Management:**

   - Consider using Zustand directly for form state instead of React Hook Form
   - Or create a sync mechanism that automatically keeps both states in sync
   - Benefits: Eliminates state synchronization issues

2. **Data Migration and Validation Service:**

   - Create dedicated service for profile import with multiple validation levels
   - Support partial imports, version migration, and data sanitization
   - Benefits: More robust import/export functionality

## Additional Notes

- High priority: Affects core user workflow for profile management
- Import partial data handling is important for user flexibility
- Should integrate with `react-toastify` (see issue #014) for notifications
- Search existing codebase for any unit tests related to import/export before writing new ones
- Consider adding a "Reset Form" button separate from "Clear Profile" if different behaviors are needed

## Related Issues

- [#014 - General Observations - Section Naming and Error Handling](014-general-observations-naming-error-handling.md) - For react-toastify integration
- [#008 - Update Import/Export Profile for New User Information](008-update-import-export-profile.md) - Related to profile schema updates

## References

- File: `src/features/leave-request/services/persistence.ts`
- File: `src/features/leave-request/ui/LeaveRequestForm.tsx`
- File: `src/features/leave-request/model/leaveRequest.schema.ts`
- Documentation: [TODO.md](../tasks/TODO.md) - Import, Export & Clear Profile section
- Library: [React Hook Form](https://react-hook-form.com/) - `reset()` and `setValue()` methods
