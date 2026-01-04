# 076-fixed-positioning

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Add fixed positioning at bottom-right corner on big screens, keep inline on mobile

## Constraints

- Use fixed positioning on desktop (large screens, e.g., lg breakpoint)
- Keep inline-block positioning on mobile and tablet
- Add responsive Tailwind classes
- Component should be visible and not overlap important content
- Consider z-index to ensure visibility

## Acceptance Criteria

- [ ] DeveloperPresence component uses `inline-block` on mobile and tablet (default behavior)
- [ ] DeveloperPresence component uses `fixed bottom-4 right-4` on desktop (lg breakpoint)
- [ ] DeveloperPresence component has appropriate z-index for visibility (lg:z-fixed)
- [ ] LeaveRequestPage wrapper removed or adjusted to not interfere with fixed positioning on desktop
- [ ] Component is visible and doesn't overlap important content on desktop
- [ ] Responsive behavior works correctly across breakpoints

## Notes

No notes.
