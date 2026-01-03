# Issue Report: PDF Generation - Offline Failure

**Issue ID:** 018
**Component:** PDF Generation Service
**Date Discovered:** 2026-01-03
**Status:** In Progress
**Priority:** Critical
**Task ID:** 068-fix-issue-018-pdf-offline-generation

## Summary

PDF generation fails when the application is used offline (without internet connection). The error message is "Failed to download PDF: Failed to fetch". This is a critical issue as the application is a PWA designed to work fully offline.

## Problem Description

### Symptom

1. User fills out the leave request form while offline
2. User clicks "Generate PDF" button
3. Error appears: "Failed to download PDF: Failed to fetch"
4. PDF is not generated or downloaded
5. Application is a PWA and should work fully offline, but PDF generation requires internet connection

### Investigation Details

#### 1. Network Dependency

- **File:** `src/features/leave-request/services/pdf/pdf.service.ts` and related PDF components
- **Issue:** PDF generation process makes network requests that fail offline
- **Evidence:** Error "Failed to fetch" indicates network request failure
- **Impact:** Critical - PWA cannot fulfill core functionality offline
- **Fix Applied (if any):** None yet

#### 2. Font Loading Issue

- **Potential Root Cause:** PDF generation may be attempting to fetch fonts from a CDN or external source
- **Evidence:** Combined with issue #007 font resolution errors, fonts may be loaded externally
- **Related:** Issue #007 mentions "Could not resolve font for Roboto" errors

## Steps to Reproduce

1. Disconnect device from internet (turn off WiFi, use airplane mode, or disconnect network)
2. Open the application (should load from PWA cache)
3. Fill out the leave request form with all required data
4. Select leave dates
5. Click "Generate PDF" button
6. Observe: Error message "Failed to download PDF: Failed to fetch"
7. Expected: PDF should be generated and downloaded successfully offline
8. Actual: PDF generation fails with network error

## Technical Details

### PDF Generation Stack

- **Library:** `@react-pdf/renderer`
- **Environment:** Browser (PWA with service worker)
- **Expected Behavior:** Fully offline-capable PDF generation

### PWA Architecture

- **Manifest:** Configured for offline capability
- **Service Worker:** Caches app resources
- **Goal:** Application should work without internet connection

### Potential Network Dependencies

1. **Font Loading:**
   - Fonts may be fetched from CDN (Google Fonts, etc.)
   - Should be bundled locally instead

2. **PDF Renderer Assets:**
   - `@react-pdf/renderer` may load assets from external URLs
   - These should be cached by service worker or bundled

3. **PDF Generation API:**
   - May be using an external PDF generation service (unlikely with `@react-pdf/renderer`)

### Relevant Files

1. **`src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`**
   - PDF document definition component
   - May contain font registration

2. **`src/features/leave-request/services/pdf/pdf.service.ts`**
   - PDF generation and download service
   - May make network requests

3. **`vite.config.ts`**
   - Build configuration
   - May need updates for bundling fonts/assets

4. **`vite-plugin-pwa` configuration** (in `vite.config.ts`)
   - PWA service worker configuration
   - Should cache PDF-related assets

5. **`public/` directory**
   - Font files may need to be placed here
   - Assets bundled with the app

## Potential Causes

### 1. External Font Loading

Fonts are being loaded from external sources (e.g., Google Fonts CDN) instead of being bundled with the application. This causes network requests during PDF generation.

### 2. Missing Service Worker Cache Entries

PDF generation assets (fonts, renderer dependencies) are not included in the service worker's precache list, so they're not available offline.

### 3. Renderer Version or Configuration

`@react-pdf/renderer` may have a configuration that requires internet connectivity for certain operations.

### 4. Asset Bundling Issue

Fonts or other assets needed for PDF generation are not being bundled correctly during the build process.

## Suggested Solutions

### Short Term (Workaround)

1. **Online PDF Generation Only:**
   - Require internet connection for PDF generation
   - Show error message when offline: "PDF generation requires internet connection"
   - Limitations: Defeats the purpose of a fully offline PWA, unacceptable for production

### Medium Term (Proper Fix)

1. **Bundle Fonts Locally:**

   - Download font files (Roboto variants) to `public/fonts/` or similar location
   - Update font registration in PDF components to use local font paths
   - Ensure fonts are included in service worker cache
   - Expected outcome: Fonts available offline, no network requests for PDF generation

2. **Update Service Worker Configuration:**

   - Add fonts and PDF-related assets to `vite.config.ts` PWA precache
   - Ensure all `@react-pdf/renderer` assets are cached
   - Test offline functionality thoroughly
   - Expected outcome: All required assets available offline

3. **Font Registration Review:**

   - Audit font loading code in PDF components
   - Ensure all font variants (regular, italic, bold, bold-italic) are registered
   - Use local file paths, not URLs
   - Expected outcome: Complete font bundle with no external dependencies

### Long Term (Architectural)

1. **Asset Management Strategy:**

   - Create centralized asset management for fonts and static resources
   - Build process automatically bundles and caches assets
   - Benefits: Consistent, maintainable asset handling

2. **Offline-First Architecture:**

   - Ensure all core functionality works offline by design
   - Implement comprehensive offline testing
   - Add network connectivity detection and graceful degradation
   - Benefits: Robust PWA with true offline capability

## Additional Notes

- **Critical priority:** PDF generation is a core feature, PWA must work fully offline
- May be related to issue #007 (font resolution errors) - both likely caused by font loading issues
- Test PDF generation with different offline scenarios: fresh load, cached app, service worker updates
- Consider adding network status indicator in UI
- Check browser console for detailed network request information during PDF generation

## Related Issues

- [#007 - PDF Generation Failure with Font Resolution Error](007-pdf-generation-failure.md) - Related to font loading issues
- Feature: [PWA capabilities](../deployment.md) - PWA is configured for offline use

## References

- File: `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`
- File: `src/features/leave-request/services/pdf/pdf.service.ts`
- File: `vite.config.ts` - PWA and asset configuration
- Documentation: [TODO.md](../tasks/TODO.md) - PDF Generation section
- Library: [@react-pdf/renderer](https://react-pdf.org/) - Font registration and asset handling
