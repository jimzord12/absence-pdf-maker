# 074-fix-revert-timer

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Fix revert timer to only start when user hovers away, not while actively hovering

## Constraints

- Revert timer MUST NOT start while user is actively hovering over the component
- Revert timer MUST ONLY start when user hovers away (mouse leave or blur)
- If user re-hovers within the 1.5 second timer period, timer should reset/clear and NOT revert
- Maintain existing auto-revert behavior of 1.5 seconds after hover away

## Acceptance Criteria

- [x] Timer does not start while user is actively hovering (isHovered = true)
- [x] Timer starts immediately when user hovers away (isHovered = false)
- [x] If user re-hovers during 1.5s timer period, timer is cleared and component shows info again
- [x] If user does not re-hover within 1.5s, component reverts to showing profile image
- [x] Re-hover behavior triggers flip animation again from profile to info
- [x] All existing tests pass

## Notes

**Issue with previous implementation:** The implementation incorrectly started the revert timer when `shouldShowInfo` became true (which happens when user hovers). This caused the timer to run WHILE the user was actively hovering, which was wrong behavior.

**Correct behavior:** The timer should ONLY start when the user hovers away. The component should stay showing info as long as the user continues to hover or re-hovers within the 1.5 second window.

**Implementation (Completed):**
- Refactored timer logic to use single `useEffect` on `isHovered`
- When `isHovered = true`: Shows info, clears any pending revert timer (for re-hover scenario)
- When `isHovered = false`: Starts 1.5s revert timer
- If user re-hovers during 1.5s: Timer is cleared, component shows info again
- If user doesn't re-hover within 1.5s: Timer completes, component reverts to profile
- All 16 existing tests pass ✓
- TypeScript type check passes ✓
