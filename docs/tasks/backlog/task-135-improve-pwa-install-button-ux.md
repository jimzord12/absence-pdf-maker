# task-135-improve-pwa-install-button-ux

**Priority:** low
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Review and improve PWA Install button UX that appeared during form interaction and may be too prominent or intrusive. The "Εγκατάσταση Εφαρμογής" (Install App) button should not interrupt the user's workflow when filling out the leave request form.

## Constraints

- PWA configuration likely in `public/manifest.json` or `vite.config.ts`
- Install prompt handling likely in `src/App.tsx` or root component
- Do NOT disable PWA functionality, only improve UX
- Follow PWA install guidelines (prompt only when context-appropriate)
- Ensure button remains accessible and discoverable

## Acceptance Criteria

- [ ] PWA install button does not interrupt user workflow during form interactions
- [ ] Button is less prominent or moved to a settings menu
- [ ] Install prompt only appears after user has completed at least one form submission
- [ ] User has option to dismiss/snooze the install prompt
- [ ] Button placement and timing follow PWA best practices
- [ ] No console warnings related to beforeinstallprompt event handling

## Notes

No notes.
