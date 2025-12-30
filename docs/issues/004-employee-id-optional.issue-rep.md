# Issue Report: Employee ID Should Be Optional Field

**Issue ID:** 004
**Component:** LeaveRequestForm / Data Model
**Date Discovered:** 2025-12-29
**Status:** Open
**Priority:** Low

## Summary

The Employee ID field is currently marked as required in the data model and validation schema, but many users' companies (including the issue reporter's company) do not use employee IDs. This creates an unnecessary barrier to entry and results in validation errors for users who don't have an employee ID to provide.

## Problem Description

### Symptom

1. User fills in all form fields (name, email, phone, dates, signature)
2. User does NOT have an employee ID from their company
3. User tries to generate PDF
4. Validation fails: "Employee ID is required" error
5. User is blocked from generating PDF even though they have all other information

### Investigation Details

#### 1. Employee ID Marked as Required

- **File:** `src/features/leave-request/model/leaveRequest.schema.ts:6-9`
- **Issue:** Employee ID has `min(1, 'Employee ID is required')` validation
- **Evidence:**
  ```typescript
  export const UserProfileSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    employeeId: z.string().min(1, 'Employee ID is required'),  // REQUIRED
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
  });
  ```

#### 2. PDF Generation Requires Employee ID

- **File:** `src/features/leave-request/services/pdf/pdf.service.ts:18-33`
- **Issue:** PDF validation requires employee ID
- **Evidence:**
  ```typescript
  const PdfDataSchema = z.object({
    profile: z.object({
      fullName: z.string(),
      employeeId: z.string(),  // REQUIRED in PDF schema
      email: z.string(),
      phone: z.string(),
      department: z.string(),
      position: z.string(),
    }),
    // ...
  });
  ```
- **Problem:** Even if employee ID is optional in form, PDF generation will fail

#### 3. Form Input Shows Required

- **File:** `src/features/leave-request/ui/EmploymentDetailsSection.tsx`
- **Issue:** Employee ID input is marked as required
- **Evidence:** Employee ID form field shows as required (likely has validation UI)

#### 4. Real-World Context

Many companies and organizations do not use traditional employee ID systems:
- Contractors and freelancers
- Small companies with informal processes
- Remote workers without company IDs
- Academic or volunteer organizations
- Companies using personal identifiers instead of employee numbers

## Steps to Reproduce

1. Start development server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Fill in form:
   - Full Name: "Contract Worker"
   - Email: "contractor@example.com"
   - Phone: "+1 (555) 123-4567"
   - Department: "Services"
   - Position: "Independent Contractor"
   - Start Date: "2025-02-01"
   - End Date: "2025-02-10"
4. **Leave Employee ID field empty**
5. Try to generate PDF
6. Expected behavior: PDF generates successfully without employee ID
7. Actual behavior: Validation error prevents PDF generation

## Technical Details

### Current Validation Flow

```
[Form Submission] → LeaveRequestSchema.validate()
                                ↓
                              [All fields checked including employeeId]
                                ↓
                              [EmployeeId.min(1) fails if empty]
                                ↓
                              [Validation error shown]
                                ↓
                        [PDF generation blocked]
```

### Data Flow Impact

```
[User form] → UserProfileSchema (requires employeeId)
                                         ↓
                              [Cannot pass validation]
                              ↓
                              [PDF service blocked]
```

### Relevant Files

1. **`src/features/leave-request/model/leaveRequest.schema.ts`**
   - Line 7: `employeeId: z.string().min(1, 'Employee ID is required')`
   - Line 38-44: Schema validation that checks for empty employee ID

2. **`src/features/leave-request/services/pdf/pdf.service.ts`**
   - Line 18-25: PDF data schema with required employee ID
   - Line 143: PDF validation will fail if employee ID is missing

3. **`src/features/leave-request/ui/EmploymentDetailsSection.tsx`**
   - Likely contains Employee ID input with required validation

4. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**
   - Line 88-104: Form default values from store
   - Uses UserProfileSchema for validation

## Potential Causes

### 1. One-Size-Fits-All Assumption

Application was designed assuming all users are traditional employees with company-provided IDs. Doesn't account for:
- Contractors/freelancers
- Users without formal employment
- Small businesses without formal ID systems

### 2. PDF Design Rigidity

PDF template may have been designed assuming complete employee information is always available, making employee ID field structurally important.

## Suggested Solutions

### Short Term (Immediate Fix)

1. **Make Employee ID Optional in Form Schema**
   - File: `src/features/leave-request/model/leaveRequest.schema.ts:7`
   - Change `z.string().min(1, 'Employee ID is required')` to `z.string().optional()`
   - Update error message to be informative if present
   - **Implementation:**
     ```typescript
     employeeId: z.string().optional('If you have an employee ID, please provide it'),
     ```
   - **Expected Outcome:** Users can submit form without employee ID

2. **Remove Employee ID from PDF Validation**
   - File: `src/features/leave-request/services/pdf/pdf.service.ts:18-25`
   - Change `employeeId: z.string()` to `employeeId: z.string().optional()`
   - Update PDF rendering to handle missing employee ID
   - **Implementation:**
     ```typescript
     profile: z.object({
       fullName: z.string(),
       employeeId: z.string().optional(),
       // ...
     }),
     ```
   - **Expected Outcome:** PDF generates successfully with or without employee ID

3. **Add Conditional Rendering in PDF Template**
   - File: `src/features/leave-request/services/pdf/templates/default.template.ts`
   - Optionally hide employee ID field from PDF if empty
   - Show placeholder or "N/A" if not provided
   - **Implementation:**
     ```typescript
     const employeeIdField = {
       label: 'Employee ID',
       valuePath: 'profile.employeeId',
       position: { x: 0, y: 8 },
       conditionalRender: (data) => !!data.profile.employeeId  // New property
     };
     ```

### Medium Term (UX Improvements)

1. **Add Field Hint/Help Text**
   - Add helper text explaining that Employee ID is optional
   - Provide examples of when it's needed vs. optional
   - **Implementation:**
     ```typescript
     <Input
       label="Employee ID (Optional)"
       placeholder="Leave blank if not applicable"
       helpText="Only required if your company uses employee IDs"
       {...register('profile.employeeId')}
     />
     ```

2. **Conditional PDF Layout**
   - If Employee ID is present, include it in standard position
   - If Employee ID is missing, adjust layout to avoid empty space
   - Optionally show "N/A" or "Not Provided" in PDF

### Long Term (Flexibility)

1. **Configurable Required Fields**
   - Make required fields configurable (could be set by company admin)
   - Different companies might have different requirements
   - Could be stored in user profile or preferences

2. **Dynamic Form Fields**
   - Allow adding/removing fields based on configuration
   - More flexible than hardcoded schema

3. **Separate Validation Contexts**
   - Different validation rules based on deployment context
   - Internal company deployment = stricter rules
   - Public/consumer deployment = flexible rules

## Additional Notes

- Issue reported by user whose company doesn't use employee IDs
- This is a common pattern in freelance/contractor tools
- Making field optional significantly expands potential user base
- PDF template should gracefully handle missing employee ID with professional appearance

## Related Issues

- [#001 - PDF Generation Not Working](./001-pdf-generation-not-working.issue-rep.md) - PDF generation that requires employee ID
- [#002 - Remove Submit Button](./002-remove-submit-button.issue-rep.md) - Form workflow improvements

## References

- Zod documentation: https://zod.dev/
- Form validation best practices: https://react-hook-form.com/get-started
- PDF form design patterns: https://uxdesign.cc/form-design/
