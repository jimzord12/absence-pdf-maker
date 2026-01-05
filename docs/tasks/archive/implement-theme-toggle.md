# implement-theme-toggle

**Priority:** high
**Blocks:** none
**Blocked By:** upgrade-tailwind-v3-to-v4, design-color-palettes-light-dark
**Issue:** N/A

---

## Description

Implement complete theme switching functionality with light/dark mode support, state management, persistence, and UI integration using the existing StarsWarsRobotToggle component.

## Constraints

- Must use StarsWarsRobotToggle component from `src/shared/ui/StarsWarsRobotToggle`
- Must implement Zustand store for theme state with persistence
- Must integrate with Tailwind CSS v4's `darkMode: 'class'` strategy
- Must use `data-theme` attribute on document element for theme switching
- Must prevent theme "flash" on page load using `useLayoutEffect`
- Must place StarsWarsRobotToggle in an accessible, visible location
- Must preserve existing light mode as default
- PDF templates remain light mode only (no changes needed)

## Acceptance Criteria

- Zustand store `src/shared/state/theme.store.ts` created with:
  - State: `theme: 'light' | 'dark'`
  - Actions: `toggleTheme()`, `setTheme()`
  - Persist middleware with key 'app-theme'
- ThemeProvider implementation completed:
  - Applies `data-theme` attribute to `<html>` element
  - Uses `useLayoutEffect` to prevent flash
  - Wraps application in ThemeProvider (already exists in main.tsx)
- Tailwind configuration updated:
  - `darkMode: 'class'` configured in v4 @theme block
- StarsWarsRobotToggle integrated:
  - Added to header/navbar component or prominent location
  - Connected to theme store
  - Correctly shows current theme state
  - Toggles between light and dark on user interaction
- All UI components updated with `dark:` variant classes:
  - Backgrounds adapt to theme
  - Text colors adapt to theme
  - Borders adapt to theme
  - Interactive states adapt to theme
- Theme switching is smooth with CSS transitions
- Theme persists across page reloads and browser sessions
- Theme toggle is keyboard accessible (already in component)
- No visual regressions in dark mode (use ZAI ui_diff_check if needed)

## Notes

### StarsWarsRobotToggle Component

The `StarsWarsRobotToggle` component is already fully implemented and tested:

**Location:** `src/shared/ui/StarsWarsRobotToggle/`

**Props Interface:**
```typescript
interface StarsWarsRobotToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  id?: string;
  name?: string;
}
```

**Usage:**
```tsx
import { StarsWarsRobotToggle } from '../../../shared/ui/StarsWarsRobotToggle';
import { useThemeStore } from '../../../shared/state/theme.store';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header>
      <StarsWarsRobotToggle
        checked={theme === 'dark'}
        onChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
    </header>
  );
}
```

**Visual Design:**
- BB-8 droid animation moving left-to-right when toggled
- Day (light) ↔ Night (dark) background transition
- Animated scenery with stars, planets, clouds
- Smooth 0.4s transitions
- Fully accessible with ARIA support

### Zustand Store Pattern

**Create:** `src/shared/state/theme.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'app-theme' }
  )
);
```

**Reference:** Follow the same pattern as `locale.store.ts` (if exists) or create from scratch.

### ThemeProvider Implementation

**File:** `src/app/providers/ThemeProvider.tsx` (already exists, currently empty placeholder)

```tsx
import { useLayoutEffect } from 'react';
import { useThemeStore } from '../shared/state/theme.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
```

**Why useLayoutEffect?**
- Runs synchronously before browser paints
- Prevents "flash" of wrong theme colors on initial load
- Better UX than useEffect (which runs after paint)

### Tailwind v4 Dark Mode Configuration

**In `src/index.css` @theme block:**

```css
@import "tailwindcss";

@theme {
  /* Enable class-based dark mode */
  --color-scheme-light: 'light';
  --color-scheme-dark: 'dark';
}
```

**Tailwind v4 handles this automatically** - no `darkMode` configuration needed like in v3. Just use `dark:` classes.

### Adding Dark Variant Classes to Existing Components

Update all UI components to use `dark:` variants:

```tsx
// Example: Card component
<Card className="bg-white dark:bg-surface-800 border-gray-200 dark:border-surface-700">
  <h2 className="text-slate-900 dark:text-slate-100">
    Title
  </h2>
  <p className="text-slate-600 dark:text-slate-300">
    Content
  </p>
</Card>

// Example: Button component
<Button className="bg-primary dark:bg-primary-700 text-white hover:bg-primary-hover dark:hover:bg-primary-600">
  Click me
</Button>
```

**Key patterns:**
- Light mode: Default Tailwind classes
- Dark mode: `dark:` prefixed classes
- Surface colors: `bg-white` ↔ `dark:bg-surface-800`
- Text colors: `text-slate-900` ↔ `dark:text-slate-100`
- Border colors: `border-gray-200` ↔ `dark:border-surface-700`

### Integration Points

**Files to update:**

1. **Create:** `src/shared/state/theme.store.ts`
2. **Implement:** `src/app/providers/ThemeProvider.tsx`
3. **Create/Update:** Header/Navbar component with StarsWarsRobotToggle
4. **Update:** All shared UI components (Button, Input, Card, Modal, etc.)
5. **Update:** Feature UI components (LeaveRequestForm, sections, etc.)

### Theme Toggle Placement Options

**Option A: Header Component**
- Create new `src/shared/ui/Header/Header.tsx`
- Add StarsWarsRobotToggle in top-right or top-left
- Wrap app in `<Header>` in main layout

**Option B: Inline in Page**
- Add StarsWarsRobotToggle directly to `LeaveRequestPage.tsx`
- Position in top-right corner
- Simple but less reusable

**Recommendation:** Create reusable Header component (Option A)

### Testing Checklist

- [ ] Theme store persists to localStorage
- [ ] Theme toggles correctly on click
- [ ] Theme attribute is applied to `<html>` element
- [ ] No flash on page load
- [ ] Dark mode colors match design palette
- [ ] Light mode remains unchanged
- [ ] Theme toggle works with keyboard navigation
- [ ] ARIA labels are correct
- [ ] All interactive states (hover, focus, active) work in both themes
- [ ] PDF generation still uses light mode (verify)
- [ ] All existing tests pass

### Accessibility Considerations

- StarsWarsRobotToggle is already accessible (ARIA labels, keyboard support)
- Ensure theme toggle doesn't create keyboard traps
- Maintain focus management during theme switch
- Test with screen readers (theme state should be announced if meaningful)

### Performance Notes

- Theme switching is instant (no full page reload)
- CSS transitions smooth color changes (0.2s by default)
- Persisted theme loads before first paint (no FOUC - Flash of Unstyled Content)

### PDF Templates

**No changes needed** - PDF templates remain light mode only as per requirements.

### System Preference Detection (Optional Enhancement)

Future enhancement could detect system preference:

```typescript
// In theme store or app initialization
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(prefersDark ? 'dark' : 'light');
```

Not required for current implementation but good to know about.
