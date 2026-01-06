# create-theme-store-and-provider

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** [#Derived from implement-theme-toggle](../issues/open/Derived from implement-theme-toggle.md)

---

## Description

Create Zustand theme store with persistence and implement ThemeProvider to apply data-theme attribute to document element.

## Constraints

- Must be completed after implement-color-palettes-in-css
- Must prevent theme flash on page load
- Must preserve light mode as default

## Acceptance Criteria

- Zustand store created at src/shared/state/theme.store.ts
- Store includes: theme state ('light' | 'dark'), toggleTheme action, setTheme action
- Persist middleware configured with key 'app-theme'
- ThemeProvider implemented in src/app/providers/ThemeProvider.tsx
- ThemeProvider applies data-theme attribute to document.documentElement
- Uses useLayoutEffect to prevent theme flash
- ThemeProvider wraps application in main.tsx
- Theme defaults to 'light'
- Theme persists across page reloads and browser sessions

## Notes

No notes.
