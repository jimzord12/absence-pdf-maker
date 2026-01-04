# Issue Report: PDF Template Visual Improvements

**Issue ID:** 020
**Component:** PDF Template
**Date Discovered:** 2026-01-04
**Status:** In Progress
**Priority:** Medium
**Task ID:** 072-fix-issue-020-pdf-visual-improvements

## Summary

The current PDF template is functional but requires visual improvements for better aesthetics, readability, and professional appearance. Specific improvements will be added as they are discovered.

## Problem Description

### Symptom

1. User generates a PDF
2. PDF displays correctly but visual elements could be enhanced
3. Layout, spacing, typography, or styling elements may need refinement

### Investigation Details

#### 1. Current PDF Template Structure

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx:34-154`
- **Issue:** Template is functional but may not be visually optimized
- **Evidence:**
  ```typescript
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Roboto',
      fontSize: 11,
      color: '#333',
      lineHeight: 1.5,
    },
    // ... additional styles
  });
  ```
- **Fix Applied (if any):** None yet

#### 2. Current Layout Sections

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx:167-296`
- **Structure:**
  1. Header (Company name, Document title)
  2. Subject line ("ΘΕΜΑ: Χορήγηση Κανονικής Άδειας")
  3. Two-column content (Employee details, Leave details)
  4. Allowance preference section
  5. Footer with signature boxes
  6. Date section

## Steps to Reproduce

1. Fill in a complete leave request form with all fields
2. Click "Generate PDF"
3. Review the generated PDF
4. Identify areas for visual improvement
5. Expected behavior: Professional, clean, visually appealing document
6. Actual behavior: Functional but may have aesthetic issues

## Technical Details

### Current Styling Properties

#### Page Styling
- **Padding:** 40
- **Font:** Roboto
- **Font Size:** 11
- **Color:** #333 (dark gray)
- **Line Height:** 1.5

#### Header Styling
- **Title Font Size:** 24 (Document title), 16 (Company name)
- **Colors:** #333 (title), #1a73e8 (company name, accent)
- **Border:** Bottom border 2px #1a73e8

#### Section Styling
- **Title Font Size:** 12, Bold
- **Title Color:** #1a73e8
- **Border:** Bottom border 1px #eee

#### Signature Boxes
- **Width:** 45%
- **Signature Image:** 120x60px
- **Signature Line:** Border bottom 1px #333

### Relevant Files

1. **`src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`**

   - Line 34-154: StyleSheet definitions
   - Line 167-296: Component structure and layout

2. **`src/features/leave-request/services/pdf/pdf.service.ts`**

   - PDF generation and download logic

## Potential Causes

### 1. Initial Template Simplicity

The template was likely created with a focus on functionality over aesthetics during initial implementation.

### 2. Iterative Design Needs

Visual improvements are often discovered through usage and user feedback rather than anticipated during initial design.

## Suggested Improvements (To Be Updated)

**Note:** This issue will be updated with specific visual improvements as they are discovered. Below are potential areas for enhancement.

### Typography & Readability

- [ ] Review font sizes for better hierarchy
- [ ] Adjust line spacing for improved readability
- [ ] Consider bold/weight variations for emphasis
- [ ] Ensure Greek characters render correctly

### Layout & Spacing

- [ ] Review section margins and padding
- [ ] Ensure consistent spacing between elements
- [ ] Check column alignment in two-column layout
- [ ] Balance whitespace usage

### Colors & Branding

- [ ] Review color scheme for professional appearance
- [ ] Ensure contrast meets accessibility standards
- [ ] Consider company branding colors if available

### Visual Elements

- [ ] Add subtle borders or dividers between sections
- [ ] Review header design for visual impact
- [ ] Enhance signature box presentation
- [ ] Consider adding a company logo placeholder

### Mobile/Print Optimization

- [ ] Ensure proper margins for printing
- [ ] Test A4 layout for different printers
- [ ] Verify font scaling if needed

## Suggested Solutions

### Short Term (Workaround)

1. **Manual PDF Editing:**
   - Users edit generated PDFs in PDF editors
   - Pros: Immediate control
   - Cons: Not scalable, user burden

### Medium Term (Proper Fix)

1. **Update PDF Stylesheet:**
   - Modify `StyleSheet` in `LeaveRequestPdf.tsx` based on discovered improvements
   - Incrementally apply visual enhancements
   - Test with sample data

2. **Create Multiple Template Variants:**
   - Develop 2-3 template options
   - Allow users to select preferred template
   - Gather feedback and iterate

**Implementation steps:**
1. Gather specific improvement requirements (to be added to this issue)
2. Update `StyleSheet` properties in `LeaveRequestPdf.tsx`
3. Test with various data scenarios (long names, short names, etc.)
4. Validate PDF renders correctly in different viewers
5. Test printing from different browsers

**Expected outcome:**
- Professional, visually appealing PDF
- Improved readability and user experience
- Consistent with business document standards

### Long Term (Architectural)

1. **Customizable Template System:**
   - Allow users to design custom PDF templates
   - Template editor UI in the application
   - Save/load templates

   **Benefits:**
   - Maximum flexibility
   - User control over branding and design

## Additional Notes

- The PDF is generated using `@react-pdf/renderer` which has styling constraints
- All fonts must be registered (currently using Roboto from `public/fonts/`)
- PDF rendering differs from HTML/CSS - some CSS features are not available
- Consider cross-platform compatibility (Windows, macOS, Linux PDF viewers)

**To Be Updated:**
- Add specific visual issues as they are discovered
- Include screenshots or examples if available
- Reference any user feedback or requirements

## Related Issues

- #019 - PDF Filename Format Enhancement
- #021 - Remove "Αρ. Μητρώου" Field
- #022 - "Λόγος" Field Value Mapping Issue

## References

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`
- **Documentation:** `@react-pdf/renderer` documentation
