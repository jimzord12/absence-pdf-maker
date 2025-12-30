# Issue Report: Remove or Fix "Submit Leave Request" Button

**Issue ID:** 002
**Component:** LeaveRequestForm / UX
**Date Discovered:** 2025-12-29
**Status:** Open
**Priority:** Medium

## Summary

The "Submit Leave Request" button in LeaveRequestForm is misleading and provides no real functionality. Users can generate PDFs directly from the ReviewAndGenerate section without submitting a form. The button currently only displays an alert about signature requirements, even when a signature is already captured.

## Problem Description

### Symptom

1. User fills in all form fields including signature
2. User scrolls to "Review & Generate" section
3. User sees all values synced correctly
4. User clicks "Generate PDF" and successfully downloads PDF with signature included
5. User returns to form and sees "Submit Leave Request" button
6. If user clicks "Submit Leave Request" button, they get an alert: "Please capture your signature before submitting."
7. This is confusing because:
   - The signature was already captured and included in the PDF
   - The submit button doesn't do anything useful (doesn't save, doesn't submit anywhere)
   - PDF generation works independently of form submission

### Investigation Details

#### 1. Submit Button Functionality is Misleading

- **File:** `src/features/leave-request/ui/LeaveRequestForm.tsx:137-167`
- **Issue:** The `onSubmit` function only validates signature and shows alerts
- **Evidence:**
  ```typescript
  const onSubmit = async (data: LeaveRequest) => {
    try {
      clearErrorMessage();

      // Validate that signature is captured
      if (!data.signatureDataUrl) {
        alert('Please capture your signature before submitting.');
        return;
      }

      // ... (rest of function just logs to console and shows alert)
  ```
- **Root Cause:** The form submission workflow is not actually connected to any backend or meaningful action. PDF generation is handled separately in ReviewAndGenerate component, making "Submit Leave Request" redundant.

#### 2. Submit Button is Always Visible

- **File:** `src/features/leave-request/ui/LeaveRequestForm.tsx:346-362`
- **Issue:** "Submit Leave Request" button is always visible in form actions
- **Evidence:**
  ```typescript
  <Button
    variant="primary"
    type="submit"
    disabled={isSubmitting || !isDirty}
  >
    {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
  </Button>
  ```
- **Problem:** The button suggests a submission workflow that doesn't exist.

#### 3. Signature Validation is Unnecessary

- **File:** `src/features/leave-request/ui/LeaveRequestForm.tsx:142-146`
- **Issue:** Validation checks for `signatureDataUrl` even though PDF generation already includes it
- **Evidence:**
  ```typescript
  if (!data.signatureDataUrl) {
    alert('Please capture your signature before submitting.');
    return;
  }
  ```
- **Confusion:** User doesn't need signature to "submit" form - they need it for PDF generation, which happens independently.

## Steps to Reproduce

1. Start the development server: `npm run dev`
2. Open the application in browser at `http://localhost:5173`
3. Fill in all required form fields:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Employee ID: "EMP123"
   - Start Date: "2025-01-01"
   - End Date: "2025-01-10"
4. Click "Capture Signature" button and draw signature
5. Scroll down to "Review & Generate" section
6. Verify all form values are displayed in Review section
7. Click "Generate PDF" button
8. Expected behavior: PDF downloads with signature
9. Actual behavior: PDF downloads with signature (works!)
10. Scroll back up to form
11. Click "Submit Leave Request" button
12. Expected behavior: Nothing happens (button has no purpose)
13. Actual behavior: Alert shows "Please capture your signature before submitting."

## Technical Details

### Data Flow

```
[User fills form] → LeaveRequestForm (watch) → Zustand store → ReviewAndGenerate (select)
                                                                       ↓
                                                                 PDF generation
                                                                       ↓
                                                        [Downloads PDF with signature]
                                                             ↓
[User clicks Submit] → LeaveRequestForm (onSubmit) → Alert only
```

### Relevant Files

1. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**
   - Line 137-167: `onSubmit` function
   - Line 346-362: "Submit Leave Request" button in JSX

2. **`src/features/leave-request/ui/ReviewAndGenerate.tsx`**
   - Line 117-176: `handleGeneratePdf` function
   - Line 297-309: "Generate PDF" button in JSX

3. **`src/features/leave-request/ui/SignatureModal.tsx`**
   - Signature capture component (referenced but not analyzed in this issue)

## Potential Causes

### 1. Legacy Workflow

The application may have been designed with a traditional form submission workflow where:
- Users fill out forms
- Submit forms to backend API
- Backend processes and responds
- PDF is generated server-side

However, the current implementation generates PDFs client-side using jsPDF, making the traditional submit workflow obsolete.

### 2. Incomplete Refactoring

The "Review & Generate" section was added as a new feature but the original form submission workflow was not fully removed, creating a confusing dual workflow.

## Suggested Solutions

### Short Term (Immediate Fix)

1. **Remove "Submit Leave Request" Button Entirely**
   - Remove the button from the form actions section
   - Remove the `onSubmit` function or replace with no-op
   - Simplify form to focus on data entry and real-time sync
   - **Pros:**
     - Eliminates confusing alert message
     - Removes misleading button
     - Simplifies UI and user mental model
   - **Cons:**
     - None - button has no purpose

2. **Alternative: Add "Save Form" Functionality**
   - Keep button but make it save current state to localStorage
   - Could be useful for users who want to come back later
   - **Pros:** Provides utility without being misleading
   - **Cons:** Adds complexity to implement correctly

### Medium Term (Proper Fix)

1. **Conditional Signature Requirement in PDF Generation**
   - If "Submit Leave Request" is kept, only enable it when signature is captured
   - This validates the requirement at the right time
   - Remove signature alert if button is disabled
   - **Implementation:**
     ```typescript
     const hasSignature = !!data.signatureDataUrl;
     <Button
       type="submit"
       disabled={isSubmitting || !isDirty || !hasSignature}
     >
       {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
     </Button>
     ```

2. **Repurpose "Submit" as "Clear Form" Alternative**
   - Rename button to "Reset & Clear" or similar
   - Make it clear both form and signature
   - Keep existing "Reset Form" button as well for flexibility

### Long Term (Architectural)

1. **Form State Management Review**
   - Consider if the form should have a "submit" workflow at all
   - Currently, the app functions as a live data entry form + PDF preview/generation
   - This is actually a valid pattern, just needs UI cleanup

2. **Unified Form Actions**
   - Consolidate form actions into a clear, intentional design
   - Consider if "Submit" should map to "Save Draft" functionality for future features

## Additional Notes

- The "Submit Leave Request" button is technically a vestige from Issue #001 investigation when testing was happening
- The signature validation in `onSubmit` conflicts with the signature modal workflow
- Users who successfully generate PDFs may be confused about what "submitting" does
- Removing or repurposing this button will significantly improve user experience

## Related Issues

- [#001 - PDF Generation Not Working](./001-pdf-generation-not-working.issue-rep.md) - Related because the submit workflow was added during investigation of PDF generation issue

## References

- LeaveRequestForm implementation: `src/features/leave-request/ui/LeaveRequestForm.tsx`
- PDF generation flow: `src/features/leave-request/ui/ReviewAndGenerate.tsx`
- React Hook Form documentation: https://react-hook-form.com/
