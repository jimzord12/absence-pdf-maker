# 144-light-theme-radial-gradient-background

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Replace the current plain white linear gradient background with a more visually appealing white-to-light-blue radial gradient for the light theme mode. The current implementation uses `bg-gradient-to-br` with both colors being white, which is too bright and lacks visual depth.

## Constraints

- Only modify light theme mode; dark theme must remain unchanged
- Use Tailwind CSS radial gradient utilities
- Maintain existing CSS custom properties (var(--color-background), etc.)
- Ensure gradient looks professional and not distracting
- Background must work well with existing content and cards
- No changes to theme state management or toggle functionality

## Acceptance Criteria

- [x] Light theme background uses a radial gradient from white to light blue
- [x] Dark theme background remains unchanged (linear gradient from #0f172a to #1e293b)
- [x] Gradient is visually pleasing and not overwhelming
- [x] Theme toggle functionality still works correctly
- [x] All text remains readable with new background
- [x] No console errors related to CSS/styling
- [x] Existing tests for theme switching still pass
- [x] Playwright screenshot comparison shows expected visual change for light mode only

## Notes

Implementation:
- Changed `bg-gradient-to-br from-[color:var(--color-background)] to-[color:var(--color-surface)]` to `bg-radial from-white to-blue-50` for light theme
- Added `dark:bg-gradient-to-br dark:from-[color:var(--color-background)] dark:to-[color:var(--color-surface)]` to preserve dark theme
- Updated test to check for `bg-radial` class instead of `bg-gradient-to-br`
- All tests pass (1328 passed)
- No console errors in browser
- Gradient creates subtle depth without being overwhelming
- Text readability maintained across both themes
