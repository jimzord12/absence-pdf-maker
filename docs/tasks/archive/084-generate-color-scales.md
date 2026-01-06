# generate-color-scales

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from design-color-palettes-light-dark](../issues/open/Derived from design-color-palettes-light-dark.md)

---

## Description

Generate complete color scales for light and dark themes using approved base colors via uicolors.app API and validate WCAG AA compliance.

## Constraints

- Must be completed after verify-tailwind-upgrade
- Must use approved base colors (no changes)
- Must use automated tool (uicolors.app API) for generation
- Must validate accessibility with WebAIM Contrast Checker

## Acceptance Criteria

- Light theme scales generated from #1191D0 and #deeeff (primary, secondary)
- Dark theme scales generated from #412B6B and #F25912 (primary, secondary)
- Semantic colors generated (error #DC2626, success #16A34A, warning #B45309, info #2563EB)
- Complete 13-step scales created (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
- All critical text/background combinations validated for WCAG AA compliance (≥ 4.5:1)
- Color scale data saved in docs/design/colors/ directory
- Contrast ratios documented for reference

## Notes

No notes.
