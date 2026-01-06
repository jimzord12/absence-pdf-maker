# integrate-starswars-toggle

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from implement-theme-toggle](../issues/open/Derived from implement-theme-toggle.md)

---

## Description

Integrate StarsWarsRobotToggle component into header/navbar and connect it to theme store for theme switching.

## Constraints

- Must be completed after create-theme-store-and-provider
- Must use existing StarsWarsRobotToggle component
- Must not modify StarsWarsRobotToggle internal logic

## Acceptance Criteria

- Header component created or updated to include StarsWarsRobotToggle
- StarsWarsRobotToggle connected to useThemeStore
- Toggle reflects current theme state correctly (checked when dark, unchecked when light)
- Clicking toggle calls store's toggleTheme action
- Theme attribute updates on document element when toggled
- Theme switching is smooth with CSS transitions
- Theme toggle is keyboard accessible (already in component)
- ARIA label is correct ("Toggle dark mode")
- Toggle is positioned in accessible, visible location

## Notes

No notes.
