# task-132-disable-i18next-debug-mode

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Disable i18next debug mode in production to stop console spam of duplicate `missingKey` warnings. Currently, every user interaction triggers dozens (sometimes hundreds) of repeated warnings like "i18next::translator: missingKey gr common forms.leave.types.annual forms.leave.types.annual", flooding the console and degrading performance.

## Constraints

- i18next configuration file likely in `src/i18n.ts` or similar
- Use environment variables (NODE_ENV or import.meta.env) to control debug mode
- Keep debug mode enabled in development (import.meta.env.DEV)
- Disable debug mode in production builds
- Do NOT remove functionality, only control logging verbosity

## Acceptance Criteria

- [ ] i18next debug mode is disabled in production build (debug: false)
- [ ] Console no longer floods with hundreds of duplicate `missingKey` warnings
- [ ] Console is clean and usable for debugging
- [ ] No performance degradation from excessive logging
- [ ] Development build still has debug mode enabled for debugging

## Notes

No notes.
