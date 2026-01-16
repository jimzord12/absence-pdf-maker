# 139-dark-mode-ui-ux-refinement

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Improve Dark mode contrast and refine UI elements like the PWA modal, date picker holidays, and action buttons.

## Constraints

- Follow Tailwind CSS v4 patterns (CSS-first config).
- Maintain consistency across themes.
- Use twMerge for class merging.

## Acceptance Criteria

- [x] PWA Install modal has improved spacing and non-intrusive design.
- [x] Holidays on React Date Picker are more prominent with theme-dependent light backgrounds.
- [x] Start and Finish date cells in Date Picker have sufficient contrast in Dark mode.
- [x] Primary purple color has better contrast against dark background.
- [x] Labels for PDF Language: and Language: dropdowns are visible in Dark mode.
- [x] Reset Form button moved from end of page to review-actions-heading.

## Notes

All acceptance criteria verified. Changes made:
1. PWA Install modal - Improved spacing, reduced padding, smaller buttons
2. Date Picker - Holidays use light background (#fef3c7) in dark mode for prominence
3. Primary color - Changed from #412b6b to #7c3aed for better contrast
4. Language selector labels - Changed from hardcoded text-gray-700 to theme-aware text-[color:var(--color-text-primary)]
5. Reset Form button - Moved from LeaveRequestForm bottom to ReviewAndGenerate actions section
