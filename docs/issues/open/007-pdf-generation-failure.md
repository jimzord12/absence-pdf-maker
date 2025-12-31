# Issue Report: PDF Generation Failure with Font Resolution Error

**Issue ID:** 007
**Component:** PDF Generation Service
**Date Discovered:** 2025-12-30
**Status:** Open
**Priority:** High

## Summary

PDF generation fails with a font resolution error for Roboto font, and console warnings indicate invalid text elements and undefined Buffer object.

## Problem Description

### Symptom

1. User fills out the leave request form
2. User clicks to generate PDF
3. Error appears: "Failed to download PDF: Could not resolve font for Roboto, fontWeight 400, fontStyle italic"
4. Console warnings display invalid text children and undefined Buffer

### Investigation Details

#### 1. Font Resolution Error

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`
- **Issue:** Roboto font variants are not properly registered
- **Evidence:** Error message: "Could not resolve font for Roboto, fontWeight 400, fontStyle italic"
- **Fix Applied (if any):** None yet

#### 2. Invalid Text Element Warning

- **File:** `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx` or related PDF components
- **Root Cause:** Space characters or whitespace rendered outside `<Text>` components
- **Evidence:** Console warning: "Invalid ' ' string child outside <Text> component"

#### 3. Buffer Undefined Warning

- **File:** Build configuration or PDF rendering
- **Root Cause:** polyfill missing for Buffer in the browser environment
- **Evidence:** Console warning: "installHook.js:1 Buffer is not defined"

## Steps to Reproduce

1. Open the application and navigate to Leave Request form
2. Fill in all required form fields
3. Select leave dates
4. Click "Generate PDF" button
5. Observe: Error message appears and PDF is not generated
6. Expected behavior: PDF should be generated successfully
7. Actual behavior: Error message "Failed to download PDF: Could not resolve font for Roboto, fontWeight 400, fontStyle italic"

## Technical Details

### PDF Generation Stack

- **Library:** `@react-pdf/renderer`
- **Font:** Roboto
- **Environment:** Browser (requires Buffer polyfill)

### Relevant Files

1. **`src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`**

   - PDF document definition component
   - May contain font registration and text rendering

2. **`src/features/leave-request/services/pdf/pdf.service.ts`**

   - PDF generation service logic
   - Handles PDF creation and download

3. **`vite.config.ts`**

   - May need configuration for Buffer polyfill

### Error Flow

```
User clicks Generate PDF
  → PDF service initiates generation
  → @react-pdf/renderer attempts to render document
  → Font resolution fails (Roboto italic not registered)
  → Error thrown and caught
  → User sees error message
```

## Potential Causes

### 1. Missing Font Variants

Roboto font may be registered without all required variants (particularly italic styles), causing font resolution to fail.

### 2. Whitespace Rendering

React PDF requires all text to be wrapped in `<Text>` components, including whitespace. Space characters outside these components trigger warnings.

### 3. Missing Buffer Polyfill

Node.js Buffer object is not available in browser environments. `@react-pdf/renderer` or its dependencies may require this polyfill.

## Suggested Solutions

### Short Term (Workaround)

1. **Register All Font Variants:**
   - Register Roboto font with all required weights and styles (regular, italic, bold, bold-italic)
   - Limitations: Requires font files and proper registration code

### Medium Term (Proper Fix)

1. **Font Registration:**
   - Import and register all Roboto font variants in the PDF service
   - Ensure weights 400, 700 and styles normal, italic are available
   - Expected outcome: PDF generation succeeds with proper font rendering

2. **Text Element Cleanup:**
   - Audit PDF components for whitespace outside `<Text>` elements
   - Wrap all text content properly
   - Expected outcome: No invalid text warnings in console

3. **Buffer Polyfill:**
   - Add Buffer polyfill to Vite configuration or dependencies
   - Configure proper polyfill in `vite.config.ts`
   - Expected outcome: No "Buffer is not defined" warnings

### Long Term (Architectural)

1. **Font Management:**
   - Centralize font registration in a dedicated font service
   - Support dynamic font loading for different locales
   - Benefits: Easier maintenance and extensibility

## Additional Notes

- High priority as PDF generation is a core feature
- Multiple errors indicate comprehensive review of PDF generation needed
- Greek character support requires proper font configuration (related to feature: add-gr-locale-and-lang-support)

## Related Issues

- [#003 - PDF Template Improvements](003-pdf-template-improvements.md) - May be related to PDF structure
- Feature: [add-gr-locale-and-lang-support](docs/features/add-gr-locale-and-lang-support/feature.md) - Font support for Greek characters

## References

- File: `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`
- File: `src/features/leave-request/services/pdf/pdf.service.ts`
- Documentation: @react-pdf/renderer font registration
