# Issue Report: Remove "Αρ. Μητρώου" Field from PDF

**Issue ID:** 021
**Component:** PDF Template
**Date Discovered:** 2026-01-04
**Status:** In Progress
**Priority:** Medium
**Task ID:** 071-fix-issue-021-remove-employee-id-from-pdf

## Summary

The PDF template includes an "Αρ. Μητρώου" (Employee ID) field that should not be displayed in the generated document.

## Problem Description

### Symptom

1. User generates a PDF after filling in the leave request form
2. PDF displays an "Αρ. Μητρώου" field in the employee details section
3. This field should not appear in the PDF at all

### Investigation Details

#### 1. Conditional Display of Employee ID

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx:214-219`
- **Issue:** The employee ID field is conditionally rendered but should be completely removed
- **Evidence:**
  ```typescript
  {data.profile.employeeId && (
    <View style={styles.row}>
      <Text style={styles.label}>Αρ. Μητρώου:</Text>
      <Text style={styles.value}>{data.profile.employeeId}</Text>
    </View>
  )}
  ```
- **Fix Applied (if any):** None yet

#### 2. Field Placement

- **Location:** In the "Στοιχεία Εργαζομένου" (Employee Details) section
- **Position:** After "Τηλ. Επικοινωνίας" (Phone) field
- **Current Behavior:** Renders when `employeeId` exists in profile data

## Steps to Reproduce

1. Navigate to the leave request form
2. Fill in all required fields including employee ID (if applicable)
3. Click "Generate PDF"
4. Open the generated PDF
5. Observe:
   - "Αρ. Μητρώου" field appears in employee details section (if employee ID was provided)
6. Expected behavior: "Αρ. Μητρώου" field should NOT appear in the PDF
7. Actual behavior: "Αρ. Μητρώου" field appears in the PDF

## Technical Details

### Current Implementation

#### Template Structure

```typescript
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Στοιχεία Εργαζομένου</Text>

  <View style={styles.row}>
    <Text style={styles.label}>Ονοματεπώνυμο:</Text>
    <Text style={styles.value}>{data.profile.fullName}</Text>
  </View>

  {/* ... other fields ... */}

  <View style={styles.row}>
    <Text style={styles.label}>Τηλ. Επικοινωνίας:</Text>
    <Text style={styles.value}>{data.profile.phone}</Text>
  </View>

  {data.profile.employeeId && (  // ← This block should be removed
    <View style={styles.row}>
      <Text style={styles.label}>Αρ. Μητρώου:</Text>
      <Text style={styles.value}>{data.profile.employeeId}</Text>
    </View>
  )}
</View>
```

### Relevant Files

1. **`src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`**

   - Line 214-219: Employee ID conditional rendering (to be removed)
   - Line 186-220: Employee Details section

2. **`src/features/leave-request/model/leaveRequest.types.ts`**

   - Contains `profile.employeeId` property (should remain in data model, just not displayed in PDF)

## Potential Causes

### 1. Business Requirement Change

The employee ID field may have been required initially but is no longer needed in the PDF output.

### 2. Data Model vs. Presentation

The `employeeId` field may still be useful in the data model for internal tracking or other purposes, but should not be visible in the PDF document.

## Suggested Solutions

### Short Term (Workaround)

1. **Leave Employee ID Empty:**
   - Users leave the employee ID field blank in the form
   - Field will not appear in PDF due to conditional rendering
   - Pros: No code changes needed
   - Cons: Still possible to accidentally fill it in

### Medium Term (Proper Fix)

1. **Remove the Field from PDF Template:**

   **Implementation steps:**
   1. Open `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`
   2. Remove lines 214-219 (the conditional employee ID block)
   3. Verify PDF still renders correctly
   4. Test with data that includes `employeeId` field populated

   **Code change:**
   ```diff
   - {data.profile.employeeId && (
   -   <View style={styles.row}>
   -     <Text style={styles.label}>Αρ. Μητρώου:</Text>
   -     <Text style={styles.value}>{data.profile.employeeId}</Text>
   -   </View>
   - )}
   ```

   **Expected outcome:**
   - Employee ID field no longer appears in PDF
   - All other fields remain unchanged
   - PDF layout adjusts automatically (no gaps or spacing issues)

### Long Term (Architectural)

1. **Review Data Model Necessity:**

   - Evaluate if `employeeId` is still needed in the data model
   - If not needed anywhere else, consider removing from schema/types
   - If still needed for other purposes (database, internal tracking), keep in model but ensure it's excluded from PDF

   **Benefits:**
   - Cleaner data model if field is truly obsolete
   - Prevents accidental inclusion in future templates

## Additional Notes

- The `employeeId` field may still be useful in the form for internal purposes
- Consider whether the employee ID should be:
  - Kept in the data model but not displayed in PDF
  - Removed entirely from the data model and form
- This change only affects the PDF template; the form input field may remain unchanged unless specified otherwise

## Related Issues

- #019 - PDF Filename Format Enhancement
- #020 - PDF Template Visual Improvements
- #022 - "Λόγος" Field Value Mapping Issue

## References

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx:214-219`
- **File:** `src/features/leave-request/model/leaveRequest.types.ts`
