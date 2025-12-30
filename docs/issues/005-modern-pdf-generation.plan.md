# Plan: Modern PDF Generation with @react-pdf/renderer

## Goal

Replace the existing `jsPDF` based PDF generation with `@react-pdf/renderer` to create a professional, modern, and stylish leave request document that matches the provided Greek template.

## Requirements

1.  **Modern Design**: Use `@react-pdf/renderer` for declarative, component-based PDF design.
2.  **Data Model Updates**: Extract and support additional fields found in the provided document image:
    - Father's Name (Πατρώνυμο)
    - Identity Number (ΑΔΤ)
    - Company Name (Επωνυμία Εταιρείας)
    - Employer Name (Όνομα Εργοδότη)
    - Leave Allowance Preference (Επιθυμώ/Δεν επιθυμώ αναλογία επιδόματος αδείας)
3.  **Greek Language Support**: Ensure fonts and encoding support Greek characters.
4.  **Signature Integration**: Include the digital signature in the PDF.

## Implementation Steps

### 1. Setup & Dependencies (Done)

- [x] Install `@react-pdf/renderer`.

### 2. Data Model Updates (Done)

- [x] Update `UserProfileSchema` in `src/features/leave-request/model/leaveRequest.schema.ts` to include:
  - `fathersName`
  - `identityNumber`
  - `companyName`
  - `employerName`
- [x] Update `LeaveRequestSchema` to include `leaveAllowance` (boolean).

### 3. PDF Component Creation (Done)

- [x] Create `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`.
  - Implement the layout matching the provided image.
  - Register fonts (Roboto) for Greek support.
  - Style components (Header, Employee Details, Request Details, Footer).

### 4. Service Layer Update (Pending)

- [ ] Refactor `src/features/leave-request/services/pdf/pdf.service.ts`.
  - Remove `jsPDF` logic.
  - Implement `generateLeaveRequestPdf` using `pdf()` from `@react-pdf/renderer`.
  - Implement `downloadLeaveRequestPdf` to handle Blob generation and download.

### 5. UI Updates (Pending)

- [ ] Update `PersonalDetailsSection.tsx`:
  - Add input fields for Father's Name, Identity Number, Company Name, Employer Name.
- [ ] Update `LeaveRequestForm.tsx` or create a new section:
  - Add checkbox/radio for "Leave Allowance Preference".
- [ ] Update `ReviewAndGenerate.tsx`:
  - Ensure it passes the correct data to the new `downloadLeaveRequestPdf` function.
  - Pass `holidays` set to the service if needed for calculation (though calculation is mostly done in store/UI, the PDF component might need raw data or pre-calculated values).

### 6. Cleanup

- [ ] Remove unused `jsPDF` templates and types.
- [ ] Uninstall `jspdf` if no longer used.

## Verification

- Generate a PDF with sample data.
- Verify Greek characters display correctly.
- Verify layout matches the requirements.
- Verify all new fields are present and correct.
