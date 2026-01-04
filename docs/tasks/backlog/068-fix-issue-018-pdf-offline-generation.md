# 068-fix-issue-018-pdf-offline-generation

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#018](../issues/open/018.md)

---

## Description

Fix PDF generation to work fully offline. Currently PDF generation fails with "Failed to fetch" error when the application is used offline, which is critical for a PWA designed to work without internet connection.

## Constraints

- Must bundle fonts locally (download to `public/fonts/`)
- Must update font registration in PDF components to use local file paths
- Must add fonts to service worker precache in vite.config.ts
- Must ensure all @react-pdf/renderer assets are available offline
- Must test PDF generation thoroughly in offline mode
- Must maintain Greek character support (Roboto fonts)
- Must pass lint and typecheck
- CRITICAL: PDF generation is core feature that MUST work offline

## Acceptance Criteria

- [ ] Roboto font files (regular, italic, bold, bold-italic) downloaded to public/fonts/
- [ ] Font registration in LeaveRequestPdf.tsx uses local file paths (e.g., /fonts/Roboto-Regular.ttf)
- [ ] No external font URLs (e.g., Google Fonts CDN) in PDF code
- [ ] Fonts added to vite-plugin-pwa precache list in vite.config.ts
- [ ] PDF generation works completely offline
- [ ] PDF generation works in different offline scenarios:
  - [ ] Fresh app load offline
  - [ ] Cached app offline
  - [ ] After service worker update
- [ ] Greek characters display correctly in PDF
- [ ] PDF generation produces same output online and offline
- [ ] No network requests during PDF generation (verify in browser network tab)
- [ ] Error handling for offline mode is graceful
- [ ] Tests for offline PDF generation
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] "Failed to fetch" error resolved
- [ ] Font resolution errors resolved

## Notes

No notes.
