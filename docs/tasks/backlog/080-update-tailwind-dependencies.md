# update-tailwind-dependencies

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from upgrade-tailwind-v3-to-v4](../issues/open/Derived from upgrade-tailwind-v3-to-v4.md)

---

## Description

Update Tailwind CSS dependencies from v3.4.19 to v4 and update Vite configuration to use @tailwindcss/vite plugin.

## Constraints

- Must be completed after capture-pre-upgrade-baselines
- Must preserve all existing functionality
- Must not break existing build

## Acceptance Criteria

- tailwindcss@next installed
- @tailwindcss/vite@next installed
- postcss removed from dependencies
- autoprefixer removed from dependencies
- postcss-import removed from dependencies
- vite.config.ts updated to use @tailwindcss/vite plugin
- PostCSS configuration removed or commented out
- npm install completes without errors
- package.json is clean and consistent

## Notes

No notes.
