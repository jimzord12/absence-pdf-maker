# Issue Report: PDF Filename Format Enhancement

**Issue ID:** 019
**Component:** PDF Generation
**Date Discovered:** 2026-01-04
**Status:** Closed
**Priority:** Medium
**Task ID:** 070-fix-issue-019-pdf-filename-format

## Summary

The generated PDF filename currently uses employee ID and generation date, but should include full name, date range, and company name for better identification.

## Problem Description

### Symptom

1. User generates a PDF by clicking the "Generate PDF" button
2. File is downloaded with filename: `LeaveRequest_[employeeId]_[date].pdf`
3. Filename does not provide enough context at a glance (employee name, date range, company)

### Investigation Details

#### 1. Current Filename Format

- **File:** `src/features/leave-request/services/pdf/pdf.service.ts:53-55`
- **Issue:** Filename uses `employeeId` sanitized and `today` date in ISO format
- **Evidence:**
  ```typescript
  const employeeId = data.profile.employeeId?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
  const today = new Date().toISOString().split('T')[0];
  const filename = `LeaveRequest_${employeeId}_${today}.pdf`;
  ```
- **Fix Applied (if any):** None yet

## Steps to Reproduce

1. Fill in a leave request form with:
   - Employee name: John Doe
   - Employee ID: EMP001
   - Company: Acme Corp
   - Start date: 10/01/2025
   - End date: 15/01/2025
2. Click "Generate PDF"
3. Observe:
   - Current filename: `LeaveRequest_EMP001_2025-01-10.pdf`
4. Expected behavior: `LeaveRequest_John-Doe_10-01-2025_15-01-2025_Acme-Corp.pdf`
5. Actual behavior: `LeaveRequest_EMP001_2025-01-10.pdf`

## Technical Details

### Current Data Available

- **Profile fullName:** `{string}` - Employee's full name (e.g., "John Doe")
- **Profile companyName:** `{string}` - Company name (e.g., "Acme Corp")
- **Profile employeeId:** `{string | undefined}` - Employee ID (e.g., "EMP001")
- **startDate:** `{Date | undefined}` - Leave start date
- **endDate:** `{Date | undefined}` - Leave end date

### Desired Filename Format

```
LeaveRequest_<Firstname-Lastname>_<start-date(dd-mm-yyyy)>_<end-date(dd-mm-yyyy)>_<Company-Name>.pdf
```

**Example:** `LeaveRequest_John-Doe_10-01-2025_15-01-2025_Acme-Corp.pdf`

### Required Transformations

1. **Name:** `profile.fullName` → Sanitize (replace spaces with hyphens, remove special chars)
2. **Start Date:** `startDate` → Format as `dd-MM-yyyy`
3. **End Date:** `endDate` → Format as `dd-MM-yyyy`
4. **Company:** `profile.companyName` → Sanitize (replace spaces with hyphens, remove special chars)

### Relevant Files

1. **`src/features/leave-request/services/pdf/pdf.service.ts`**

   - Line 53-55: Current filename generation logic
   - Line 14-36: `generateLeaveRequestPdf` function
   - Line 46-72: `downloadLeaveRequestPdf` function

2. **`src/features/leave-request/model/leaveRequest.types.ts`**

   - Defines `LeaveRequest` interface with `profile.fullName`, `profile.companyName`, `startDate`, `endDate`

## Potential Causes

### 1. Legacy Implementation

The current filename format was likely implemented early in development when employee ID was considered sufficient for identification.

### 2. Simplicity Over Clarity

The current approach is simpler (just sanitize one field), but provides less useful information for end users.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Renaming:**
   - Users manually rename downloaded PDFs
   - Pros: No code changes required
   - Cons: User must remember all details, error-prone, tedious

### Medium Term (Proper Fix)

1. **Update Filename Generation Logic:**
   - Modify `downloadLeaveRequestPdf` in `pdf.service.ts`
   - Extract name from `data.profile.fullName` and sanitize (spaces → hyphens, remove special chars)
   - Format `startDate` and `endDate` using `format(date, 'dd-MM-yyyy')`
   - Extract company name from `data.profile.companyName` and sanitize
   - Construct new filename: `LeaveRequest_${sanitizedName}_${formattedStartDate}_${formattedEndDate}_${sanitizedCompany}.pdf`

   **Implementation steps:**
   1. Import `format` from `date-fns`
   2. Create sanitization helper function (or reuse existing pattern)
   3. Update filename generation in `downloadLeaveRequestPdf`
   4. Test with Greek characters in names and company names

   **Expected outcome:**
   - Filenames immediately identify employee, date range, and company
   - Greek characters preserved or transliterated (depending on system compatibility)

### Long Term (Architectural)

1. **Configurable Filename Template:**
   - Allow users/admins to customize filename format
   - Store template in configuration
   - Use template engine for filename generation

   **Benefits:**
   - Flexible for different company requirements
   - No code changes needed for format adjustments

## Additional Notes

- The current implementation uses `toISOString()` which gives `YYYY-MM-DD` format, but the requirement is `DD-MM-YYYY`
- Consider Greek characters in names and company names (ensure proper handling)
- May want to transliterate Greek characters to Latin for broader file system compatibility, or ensure the system can handle UTF-8 filenames

## Related Issues

- #020 - PDF Template Visual Improvements (related to PDF generation)

## References

- **File:** `src/features/leave-request/services/pdf/pdf.service.ts`
- **File:** `src/features/leave-request/model/leaveRequest.types.ts`
- **Documentation:** `@react-pdf/renderer` documentation
