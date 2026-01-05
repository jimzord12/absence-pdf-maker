# verify-tailwind-upgrade

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from upgrade-tailwind-v3-to-v4](../issues/open/Derived from upgrade-tailwind-v3-to-v4.md)

---

## Description

Verify Tailwind v3 to v4 upgrade by running build, dev, tests, capturing post-upgrade baselines, and running visual regression tests.

## Constraints

- Must be completed after add-tailwind-enhancements
- Must fix any issues found during verification
- Must ensure no visual regressions before marking complete

## Acceptance Criteria

- npm run build completes without errors
- npm run dev runs successfully
- npm run test passes all existing tests
- Post-upgrade baselines captured in docs/baselines/post-upgrade/
- Visual regression tests pass using ZAI ui_diff_check (compare before/after)
- All existing UI components render correctly with no visual regressions
- Documentation updated (AGENTS.md, README) with v4 changes
- Tailwind v4 VS Code extension updated

## Notes

No notes.
