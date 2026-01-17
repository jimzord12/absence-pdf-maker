# 145-github-pages-vite-config

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Configure Vite build system and PWA plugin settings for deployment to GitHub Pages at https://jimzord12.github.io/absence-pdf-maker/

## Constraints

Must preserve all existing Vite configuration
Must update both base option and PWA manifest paths
Must maintain backward compatibility with local development
All asset paths (JS, CSS, SVGs, fonts, icons) must be prefixed with /absence-pdf-maker/
PWA service worker scope must match deployment path
No changes to existing functionality or UI

## Acceptance Criteria

- [x] Added `base: '/absence-pdf-maker/'` to root of defineConfig in vite.config.ts
- [x] Updated PWA manifest `scope` from '/' to '/absence-pdf-maker/'
- [x] Updated PWA manifest `start_url` from '/' to '/absence-pdf-maker/'
- [x] Verified all icons in manifest still reference correct paths
- [x] Ran `npm run build` successfully without errors
- [x] Verified dist/index.html contains correct asset paths (prefixed with /absence-pdf-maker/)
- [x] Verified dist/manifest.webmanifest has correct scope and start_url values
- [x] Ran `npm run preview` and confirmed no 404 errors on assets
- [x] Checked browser console for no errors during preview
- [x] Confirmed app loads and functions correctly in preview mode

## Code Quality Baselines

### Before Changes

- **Lint errors:** 0
- **Lint warnings:** 0
- **Type errors:** 0
- **Tests passing:** 1322
- **Tests failing:** 23 (pre-existing failures, not related to this task)

### After Changes

- **Lint errors:** 0
- **Lint warnings:** 0
- **Type errors:** 0
- **Tests passing:** 1322
- **Tests failing:** 23 (same pre-existing failures)

## Screenshots

| Screenshot          | Path                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Before Changes      | `.opencode/tmp/screenshots/145-github-pages-vite-config/before-changes.png`                |
| After Changes       | `.opencode/tmp/screenshots/145-github-pages-vite-config/after-changes.png`                 |

## Regression Status

- [x] No new lint errors introduced
- [x] No new lint warnings introduced
- [x] No new type errors introduced
- [x] No new test failures introduced
- [x] Build completed successfully
- [x] Preview mode works correctly

## Notes

Implementation completed successfully. All acceptance criteria met.
