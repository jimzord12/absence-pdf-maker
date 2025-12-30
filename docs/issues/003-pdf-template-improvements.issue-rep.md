# Issue Report: PDF Template Layout and Styling Improvements

**Issue ID:** 003
**Component:** PDF Generation / Template Design
**Date Discovered:** 2025-12-29
**Status:** Open
**Priority:** Medium

## Summary

The current PDF template (`default.template.ts`) has significant layout and styling issues that result in:
- Overlapping text elements (words printed on top of other words)
- Poor use of vertical space
- Inconsistent spacing between sections
- Unprofessional appearance that doesn't look like a proper leave request form
- Difficult to read and may be rejected by HR/administration

## Problem Description

### Symptom

1. User fills in form with all required data
2. User generates PDF
3. User opens PDF document
4. User observes:
   - Field labels and values overlap or are too close together
   - Layout doesn't follow standard business document conventions
   - Text appears cramped and unprofessional
   - Difficult to quickly scan and verify information

### Investigation Details

#### 1. Insufficient Vertical Spacing

- **File:** `src/features/leave-request/services/pdf/templates/default.template.ts:28-130`
- **Issue:** Fields are positioned with fixed Y offsets that don't account for:
  - Varying text heights
  - Multi-line text fields (like reason)
  - Different font sizes
- **Evidence:**
  ```typescript
  fields: [
    {
      label: 'Full Name',
      valuePath: 'profile.fullName',
      position: { x: 0, y: 0 },   // Right on top of section title
    },
    {
      label: 'Employee ID',
      valuePath: 'profile.employeeId',
      position: { x: 0, y: 8 },   // Only 8 pixels down
    },
    // ... more fields with 8px spacing
  ]
  ```
- **Problem:** 8px spacing is too tight for business documents

#### 2. No Section Separation

- **File:** `src/features/leave-request/services/pdf/templates/default.template.ts:38-108`
- **Issue:** Employee Information fields run continuously without proper grouping
- **Evidence:**
  ```typescript
  fields: [
    { label: 'Full Name', position: { x: 0, y: 0 } },
    { label: 'Employee ID', position: { x: 0, y: 8 } },
    { label: 'Email', position: { x: 0, y: 16 } },
    { label: 'Phone', position: { x: 0, y: 24 } },
    { label: 'Department', position: { x: 80, y: 0 } },   // Second column starts at Y=0
    { label: 'Position', position: { x: 80, y: 8 } },
  ]
  ```
- **Problem:** No visual separation between left and right columns, fields overlap in Y space

#### 3. Two-Column Layout Conflicts

- **File:** `src/features/leave-request/services/pdf/templates/default.template.ts:40-71`
- **Issue:** Department and Position fields in right column start at Y=0, but Email and Phone in left column go to Y=24
- **Evidence:**
  ```typescript
  Left column:  Full Name (0), Employee ID (8), Email (16), Phone (24)
  Right column: Department (0), Position (8)
  ```
- **Problem:** Creates visual misalignment where fields don't align horizontally

#### 4. Missing Section Margins

- **File:** `src/features/leave-request/services/pdf/templates/default.template.ts:72-107`
- **Issue:** Sections (Employee Information, Leave Details, Signature) don't have clear visual separation
- **Evidence:**
  ```typescript
  {
    title: 'Employee Information',
    fields: [...],
    layout: { x: 20, y: 75, width: 160 }
  },
  {
    title: 'Leave Details',
    fields: [...],
    layout: { x: 20, y: 120 }  // Only 45 pixels from previous section
  }
  ```
- **Problem:** Sections are too close, making document hard to read

#### 5. Signature Section Cramped

- **File:** `src/features/leave-request/services/pdf/templates/default.template.ts:108-127`
- **Issue:** Signature field positioned too close to other elements
- **Evidence:**
  ```typescript
  {
    label: 'Employee Signature',
    valuePath: 'signatureDataUrl',
    position: { x: 0, y: 0 },
  },
  {
    label: 'Date',
    valuePath: 'createdAt',
    position: { x: 80, y: 0 },
  }
  ```
- **Problem:** Signature image (60mm wide) and date field are too close

## Steps to Reproduce

1. Start development server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Fill in form with sample data:
   - Full Name: "Jane Smith"
   - Employee ID: "EMP789"
   - Email: "jane.smith@company.com"
   - Department: "HR"
   - Position: "Manager"
   - Leave Type: "Annual Leave"
   - Start Date: 2025-02-01
   - End Date: 2025-02-05
   - Reason: "Testing PDF layout"
4. Add signature in modal
5. Click "Generate PDF" button
6. Download and open PDF file
7. Observe:
   - Text appears cramped and hard to read
   - Labels and values overlap
   - Layout doesn't follow business document standards
   - Looks unprofessional

## Technical Details

### Current Template Structure

```typescript
export const defaultTemplate: TemplateDefinition = {
  pageSettings: {
    format: 'a4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
  },
  fonts: {
    header: 'helvetica',
    body: 'helvetica',
    label: 'helvetica',
    sizes: { small: 8, normal: 10, large: 12, title: 16 },
  },
  sections: [
    { title: 'Leave Request', fields: [], layout: { x: 80, y: 20, width: 100 } },
    { title: 'Employee Information', fields: [...], layout: { x: 20, y: 75, width: 160 } },
    { title: 'Leave Details', fields: [...], layout: { x: 20, y: 120, width: 160 } },
    { title: 'Signature', fields: [...], layout: { x: 20, y: 180, width: 160 } },
  ],
};
```

### Data Flow

```
[Form Data] → leaveRequestData → pdf.service.ts (downloadLeaveRequestPdf)
                                                    ↓
                                          generateLeaveRequestPdf(data, template)
                                                          ↓
                                                     [Creates PDF with jsPDF]
                                                           ↓
                                                    [Uses template.field.valuePath to extract and position data]
                                                                 ↓
                                                  [Text rendering at hardcoded (x, y) positions]
```

### Relevant Files

1. **`src/features/leave-request/services/pdf/templates/default.template.ts`**
   - Line 7-129: Template definition with hardcoded positions
   - Line 29-107: Employee Information fields (overlapping)
   - Line 79-106: Leave Details fields
   - Line 109-127: Signature section

2. **`src/features/leave-request/services/pdf/pdf.service.ts`**
   - Line 74-127: `renderSection()` function that uses template positions
   - Line 88-103: `getValueByPath()` helper for data extraction
   - Line 105-125: Text rendering loop using fixed positions

3. **`src/features/leave-request/services/pdf/templates/template.types.ts`**
   - Line 1-36: `TemplateDefinition` and related type definitions

## Potential Causes

### 1. Manual Layout Design

Template was designed using hardcoded pixel coordinates instead of dynamic layout calculation:
- Hardcoded `position: { x: 0, y: 8 }` for each field
- No automatic spacing calculation based on text height
- No consideration for variable content length (reason field can be multiple lines)

### 2. Limited jsPDF Knowledge

Current implementation may not leverage advanced jsPDF features:
- No automatic line height calculation
- No automatic text wrapping with position updates
- No use of jsPDF's built-in document or table features

### 3. No Professional Templates

Template was created from scratch without referencing:
- Professional leave request form examples
- HR document best practices
- Government or business form standards

## Suggested Solutions

### Short Term (Research)

1. **Research PDF Generation Libraries**
   - Investigate modern alternatives to jsPDF:
     - `react-pdf` (React-specific PDF generation)
     - `pdf-lib` (More modern API)
     - `jspdf-autotable` (Better table/layout support)
     - `@react-pdf/renderer` (React component-based PDFs)
   - Evaluate based on:
     - Layout capabilities (tables, auto-positioning, responsive design)
     - Typography support (fonts, text wrapping, styling)
     - Maintenance and community support
     - Integration ease with current codebase

2. **Research Professional Templates**
   - Search for professional leave request form templates
   - Analyze spacing, layout, and styling best practices
   - Document industry standards for HR documents

3. **Create Comparison Document**
   - Generate sample PDFs from 2-3 alternative libraries
   - Document pros and cons of each approach
   - Make recommendation with evidence

### Medium Term (Template Refactor)

1. **Calculate Dynamic Field Positions**
   - Implement helper to calculate Y position based on previous field
   - Add spacing between fields based on line height
   - Support multi-line text (reason field) with height calculation
   - **Example:**
     ```typescript
     const calculateFieldPositions = (fields, startY) => {
       let currentY = startY;
       return fields.map(field => {
         const position = { x: field.x, y: currentY };
         currentY += getLineHeight(field.value) + FIELD_SPACING;
         return { ...field, position };
       });
     };
     ```

2. **Implement Two-Column Layout Logic**
   - Group fields into logical columns
   - Calculate column positions to prevent overlap
   - Add visual separators between columns
   - **Example:**
     ```typescript
     const columns = [
       { fields: ['fullName', 'employeeId'], columnX: 20 },
       { fields: ['department', 'position'], columnX: 100 }
     ];
     ```

3. **Add Section Spacing**
   - Increase vertical space between sections (currently 45px)
   - Add horizontal divider lines between sections
   - Add more whitespace for professional appearance

4. **Improve Text Wrapping**
   - Use `doc.splitTextToSize()` for better text wrapping
   - Calculate field position dynamically based on wrapped text height
   - Handle long text gracefully

### Long Term (Architecture)

1. **Switch to Modern PDF Library**
   - Evaluate and potentially migrate from jsPDF to more modern library
   - Prioritize libraries with:
     - Built-in table support
     - React component integration
     - Better typography handling
     - Active maintenance and community

2. **Template System Redesign**
   - Create a more flexible template system that:
     - Supports different layouts (single column, two column, etc.)
     - Allows custom styling per section
     - Supports dynamic field positioning
     - Can be easily modified by developers without coordinate math

3. **Live Preview Feature**
   - Add live PDF preview in ReviewAndGenerate section
   - Users can see what PDF will look like before downloading
   - Real-time validation of content fit
   - **Benefits:**
     - Immediate feedback on layout issues
     - Reduces wasted PDF generations
     - Better user experience

## Additional Notes

- Current template works but produces unprofessional results
- Layout issues could cause PDFs to be rejected by HR/management
- User feedback indicates PDF quality is a priority issue
- Fixing template quality will significantly improve perceived application value

## Related Issues

- [#001 - PDF Generation Not Working](./001-pdf-generation-not-working.issue-rep.md) - PDF generation functionality
- [#002 - Remove Submit Button](./002-remove-submit-button.issue-rep.md) - UI cleanup related to form workflow

## References

- jsPDF Documentation: https://github.com/parallax/jsPDF
- jsPDF Autotable Plugin: https://github.com/simonbengtsson/jsPDF-AutoTable
- React PDF Libraries Comparison: https://www.npmjs.com/search?q=pdf
- PDF Generation Best Practices: https://www.smashingmagazine.com/2022/05/pdf-generation/
