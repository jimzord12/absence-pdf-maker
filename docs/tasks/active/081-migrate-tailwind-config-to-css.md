# migrate-tailwind-config-to-css

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from upgrade-tailwind-v3-to-v4](../issues/open/Derived from upgrade-tailwind-v3-to-v4.md)

---

## Description

Migrate Tailwind CSS v3 configuration from JavaScript to v4 CSS-first approach using @theme directive.

## Constraints

- Must be completed after update-tailwind-dependencies
- Must preserve all existing custom theme values
- Must ensure all existing UI components work correctly after migration

## Acceptance Criteria

- tailwind.config.js content migrated to @theme block in src/index.css
- All custom colors (primary, secondary, error, success, warning, info, holiday, border) preserved
- All custom fonts, sizes, shadows, animations preserved
- Custom utilities (.sr-only, .focus-visible, .animate-stagger-*) migrated to @utility directive
- All @tailwind directives replaced with @import "tailwindcss"
- PostCSS configuration file removed
- CSS compiles without errors
- Existing UI components still render correctly

## Notes

No notes.
