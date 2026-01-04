# 070-fix-issue-019-pdf-filename-format

**Priority:** Medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#019](../../issues/open/019-pdf-filename-format.md)

---

## Description

Update the PDF filename generation to include full name, date range, and company name for better identification, replacing the current format that only uses employee ID and generation date.

**Constraints:**

- Must follow project code style (AGENTS.md)
- Must use `date-fns` for date formatting
- Must sanitize strings (replace spaces with hyphens, remove special chars)
- Must handle Greek characters properly (preserve or transliterate)
- Must use format: `LeaveRequest_<Firstname-Lastname>_<start-date(dd-mm-yyyy)>_<end-date(dd-mm-yyyy)>_<Company-Name>.pdf`

**Acceptance Criteria:**

- [x] Filename includes employee's full name (sanitized)
- [x] Filename includes start date in dd-MM-yyyy format
- [x] Filename includes end date in dd-MM-yyyy format
- [x] Filename includes company name (sanitized)
- [x] Filename format follows: `LeaveRequest_<Name>_<StartDate>_<EndDate>_<Company>.pdf`
- [x] Special characters are properly removed/replaced
- [x] Greek characters in names and company names are handled correctly
- [x] No TypeScript errors
- [x] No console errors
- [x] Tests added for filename generation with various input scenarios

---

## Implementation Summary

**Status:** ✅ IMPLEMENTED

### Changes Made

1. **Updated `src/features/leave-request/services/pdf/pdf.service.ts`:**
   - Added import of `format` from `date-fns`
   - Created `sanitizeForFilename` helper function to:
     - Replace spaces with hyphens
     - Remove special characters (keeps letters, numbers, hyphens)
     - Preserve Greek characters
   - Updated `downloadLeaveRequestPdf` function to generate new filename format:
     - Extract and sanitize employee full name
     - Format start and end dates as `dd-MM-yyyy`
     - Extract and sanitize company name
     - Construct filename: `LeaveRequest_<Name>_<StartDate>_<EndDate>_<Company>.pdf`

2. **Added comprehensive tests to `src/features/leave-request/services/pdf/pdf.service.test.ts`:**
   - Test for new filename format with basic data
   - Test for special character sanitization
   - Test for Greek character preservation
   - Test for missing fullName and companyName (fallback to 'unknown')
   - Test for dates in different months and years
   - Test for single and double digit days and months

### Verification Results

✅ All 8 PDF service tests passing
✅ No TypeScript errors
✅ No new linting errors introduced
✅ All PDF generation tests still passing (43 tests)

### Example Filenames Generated

- Basic: `LeaveRequest_John-Doe_01-01-2025_05-01-2025_Acme-Corp.pdf`
- With special chars: `LeaveRequest_John-The-Rock-Doe_01-01-2025_05-01-2025_Acme-Corp-Inc.pdf`
- Greek: `LeaveRequest_Γιάννης-Παπαδόπουλος_01-01-2025_05-01-2025_Ελληνική-Εταιρεία-ΑΕ.pdf`
- Missing fields: `LeaveRequest_unknown_01-01-2025_05-01-2025_unknown.pdf`

---

## Notes

**Code Review: PASS ✅**

The reviewer identified several strengths:
- Correct Greek character handling with comprehensive regex covering both base characters (α-ω, Α-Ω) and accented variants (ά-ώ, Ά-Ώ)
- Proper sanitization strategy using two-step replacement (spaces → hyphens → special chars)
- Comprehensive test coverage with 8 tests covering all edge cases
- Excellent error handling with context preservation
- Proper TypeScript typing with no use of `any`
- Clean code organization following project standards
- No regressions - all 72 PDF tests passing

Minor suggestions for future consideration:
- Could add comment explaining Greek character coverage for future maintainers
- Could add explicit test for empty string sanitization edge case
- Could document why 'unknown' is used as fallback (ensures valid filename)

---
