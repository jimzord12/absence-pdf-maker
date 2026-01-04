# Issue Report: "Λόγος" Field Value Mapping Issue

**Issue ID:** 022
**Component:** PDF Template, Form
**Date Discovered:** 2026-01-04
**Status:** Closed
**Priority:** High
**Task ID:** 069-fix-issue-022-reason-field-value-mapping

## Summary

The "Λόγος" (Reason) field in the PDF displays the default value "Προσωπικοί λόγοι" instead of the actual reason entered by the user. The actual reason appears to be incorrectly mapped to the "Αρ. Μητρώου" (Employee ID) field.

## Problem Description

### Symptom

1. User fills in the leave request form with a specific reason (e.g., "Για οικογενειακούς λόγους")
2. User clicks "Generate PDF"
3. PDF displays "Προσωπικοί λόγοι" (default) in the "Λόγος" field
4. The actual reason appears to be in the "Αρ. Μητρώου" field instead

### Investigation Details

#### 1. PDF Reason Field Implementation

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx:244-247`
- **Issue:** Default value "Προσωπικοί λόγοι" is shown when `data.reason` is empty or falsy
- **Evidence:**
  ```typescript
  <View style={styles.row}>
    <Text style={styles.label}>Λόγος:</Text>
    <Text style={styles.value}>{data.reason || 'Προσωπικοί λόγοι'}</Text>
  </View>
  ```
- **Fix Applied (if any):** None yet

#### 2. Potential Data Flow Issue

- **File:** To be investigated (form state, schema, store)
- **Root Cause:** The user's actual reason may be stored in a different field or the form is not properly mapping the reason input to `data.reason`
- **Evidence:** User reports actual reason appearing in "Αρ. Μητρώου" field
- **Possibilities:**
  1. Form input field name doesn't match data model property
  2. Field swapping between `reason` and `employeeId` in form state
  3. Schema validation incorrectly assigning values
  4. State store mutation issue

## Steps to Reproduce

1. Navigate to the leave request form
2. Fill in the form with:
   - Reason: "Για οικογενειακούς λόγους" (or any specific reason)
   - Employee ID: (leave empty or fill as applicable)
3. Click "Generate PDF"
4. Open the generated PDF
5. Observe:
   - "Λόγος" field shows: "Προσωπικοί λόγοι" (default)
   - "Αρ. Μητρώου" field shows: "Για οικογενειακούς λόγους" (the actual reason)
6. Expected behavior:
   - "Λόγος" field should show: "Για οικογενειακούς λόγοι"
   - "Αρ. Μητρώου" field should show: (empty or the actual employee ID)
7. Actual behavior: Fields are swapped or incorrectly mapped

## Technical Details

### Current Data Model

#### LeaveRequest Type

```typescript
interface LeaveRequest {
  // ... other fields
  reason?: string;  // The reason for leave request
  profile: {
    fullName: string;
    fathersName: string;
    position: string;
    identityNumber: string;
    phone: string;
    employeeId?: string;  // Employee ID (optional)
    companyName: string;
  };
  // ... other fields
}
```

### Relevant Files (To Be Investigated)

1. **`src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`**

   - Line 244-247: Reason field display (uses default fallback)
   - Line 214-219: Employee ID field (may be receiving reason value)

2. **`src/features/leave-request/ui/LeaveDetailsSection.tsx`** (likely location)
   - Form input for "Λόγος" field
   - May have incorrect field name mapping

3. **`src/features/leave-request/model/leaveRequest.schema.ts`**
   - Zod schema for leave request validation
   - Check if field names match data model

4. **`src/features/leave-request/state/leaveRequest.store.ts`**
   - Zustand store state
   - Check if `reason` and `employeeId` are properly mapped

## Potential Causes

### 1. Form Field Name Mismatch

The form input for "Λόγος" might be using the wrong field name (e.g., `employeeId` instead of `reason`).

### 2. Field Swapping in Form State

There could be a bug where the `reason` and `employeeId` values are being swapped during state updates or form submission.

### 3. Schema Validation Issue

The Zod schema might be incorrectly mapping input fields to the data model properties.

### 4. State Management Mutation

A bug in the Zustand store or form state management could be causing value misassignment.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual PDF Editing:**
   - Users edit the PDF after generation to correct the reason field
   - Pros: Immediate solution
   - Cons: Not scalable, user burden, error-prone

### Medium Term (Proper Fix)

1. **Investigate and Fix Field Mapping:**

   **Implementation steps:**
   1. Locate the "Λόγος" form input component (likely in `LeaveDetailsSection.tsx`)
   2. Verify the `name` attribute matches `reason`
   3. Check React Hook Form configuration for proper field registration
   4. Verify the data flow from form → store → PDF
   5. Test the form with a specific reason and verify PDF output

   **Potential fixes to investigate:**

   **Fix A: Correct Form Field Name**
   ```typescript
   // In the form component (example location)
   <Controller
     name="reason"  // ← Verify this is correct
     control={control}
     render={({ field }) => (
       <Textarea
         {...field}
         label="Λόγος"
         placeholder="Προσωπικοί λόγοι"
       />
     )}
   />
   ```

   **Fix B: Verify Store State Updates**
   ```typescript
   // In the store, check if reason is properly updated
   setReason: (reason: string) => set({ reason }),
   ```

   **Fix C: Check PDF Data Source**
   ```typescript
   // Verify the PDF is reading from the correct field
   <Text style={styles.value}>{data.reason || 'Προσωπικοί λόγοι'}</Text>
   ```

   **Expected outcome:**
   - User's actual reason appears in the "Λόγος" field in the PDF
   - "Αρ. Μητρώου" field displays employee ID (if provided)
   - Default fallback "Προσωπικοί λόγοι" only appears when no reason is provided

### Long Term (Architectural)

1. **Add Form Field Validation Tests:**
   - Write unit tests to verify form fields map correctly to data model
   - Add integration tests for full form → PDF flow
   - Prevent similar field mapping issues in the future

2. **Improve Type Safety:**
   - Use stricter TypeScript types to prevent field name mismatches
   - Consider using a mapping object or constants for field names

   **Benefits:**
   - Catches field mapping errors at compile time
   - Easier to maintain and refactor

## Additional Notes

- The user likes the default value "Προσωπικοί λόγοι" when no reason is provided, so this fallback behavior should be preserved
- The issue is specifically about the actual reason being misplaced, not about the default value itself
- Need to verify if this is a form-level issue, store-level issue, or PDF rendering issue
- May want to check the form input component directly to see what field name is being used

## Related Issues

- #019 - PDF Filename Format Enhancement
- #020 - PDF Template Visual Improvements
- #021 - Remove "Αρ. Μητρώου" Field from PDF

## References

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx:244-247`
- **File:** `src/features/leave-request/model/leaveRequest.types.ts`
- **Documentation:** React Hook Form documentation (field registration)
