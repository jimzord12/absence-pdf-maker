# upgrade-tailwind-v3-to-v4

**Priority:** high
**Blocks:** design-color-palettes-light-dark, implement-theme-toggle, add-comprehensive-tests
**Blocked By:** capture-pre-upgrade-baselines
**Issue:** N/A

---

## Description

Upgrade Tailwind CSS from v3.4.19 to latest v4 version, updating dependencies, configuration, and adapting to breaking changes while preserving all existing customizations. Add all recommended enhancements for modern developer experience.

## Constraints

- Must preserve all existing custom theme values (colors, fonts, sizes, animations, etc.)
- Must ensure all existing UI components work correctly after upgrade
- Must not break existing functionality
- Must test thoroughly before completing the task
- Browser requirements: v4 requires Safari 16.4+, Chrome 111+, Firefox 128+ (no backward compatibility needed)

## Acceptance Criteria

- All dependencies updated to Tailwind CSS v4 and @tailwindcss/vite
- Vite configuration updated to use @tailwindcss/vite plugin instead of PostCSS (Vite 7 + React 19 best practices)
- JavaScript-based tailwind.config.js migrated to CSS-based @theme directive in index.css
- All custom colors (primary, secondary, error, success, warning, info, holiday, border) preserved
- All custom fonts, sizes, shadows, animations preserved
- Custom utilities (.sr-only, .focus-visible, .animate-stagger-*) migrated to @utility directive
- All @tailwind directives updated to @import "tailwindcss"
- PostCSS configuration updated (autoprefixer removed, postcss-import removed)
- vite-plugin-svgr added and configured for importing SVGs as React components
- @tailwindcss/typography added for prose classes (markdown/text styling)
- @tailwindcss/container-queries added for container query support
- tailwind-merge and class-variance-authority (CVA) added and configured
- npm run build completes without errors
- npm run dev runs successfully
- All tests pass (npm run test)
- Visual regression test passed (compare before/after baselines using ZAI ui_diff_check)
- All existing UI components render correctly with no visual regressions
- Documentation updated (AGENTS.md, README)

## Notes

### CSS-First Configuration (@theme)

In Tailwind CSS v4, configuration moves entirely into CSS using `@theme` block. This allows defining semantic variables that change values based on `data-theme` attributes.

**Example pattern for migration:**
```css
@import "tailwindcss";

@theme {
  /* Define semantic colors mapped to CSS variables */
  --color-brand-primary: var(--primary);
  --color-brand-surface: var(--surface);
  --color-brand-text: var(--text);
}

@layer base {
  /* Default Light Theme */
  :root {
    --primary: #0f172a; /* primary */
    --surface: #ffffff;
    --text: #64748b;    /* secondary */
  }

  /* Dark Theme Overrides (if implementing) */
  [data-theme='dark'] {
    --primary: #1e293b;
    --surface: #1f2937;
    --text: #94a3b8;
  }
}
```

**Key advantages:**
- CSS v4 handles CSS variables directly; no need for `rgb()` or `hsl()` wrappers for opacity
- Semantic classes like `bg-brand-surface` map to CSS variables
- No RGB conversions needed (unlike v3)

### Vite 7 + React 19 Integration

**Recommended Vite configuration:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Replaces PostCSS; enables v4 CSS-first engine
  ],
});
```

**Note:** Remove `autoprefixer` and `postcss-import` from `postcss.config.js` - these are now handled automatically by `@tailwindcss/vite`.

### Required Enhancements (All Must Be Implemented)

#### 1. vite-plugin-svgr
Import SVGs as React components directly
- Example: `import Logo from './logo.svg?react'`
- Enhanced developer experience
- Install: `npm install -D vite-plugin-svgr`
- Add to vite.config.ts plugins

#### 2. @tailwindcss/typography
Adds `prose` classes for beautiful markdown/long-form text
- Install: `npm install -D @tailwindcss/typography`
- Add to @theme or plugins configuration
- Useful for documentation, user-generated content

#### 3. @tailwindcss/container-queries
Styles based on parent size rather than viewport
- Install: `npm install -D @tailwindcss/container-queries`
- Advanced component architecture
- Great for responsive components

#### 4. tailwind-merge
Merge Tailwind class strings without conflicts
- Install: `npm install tailwind-merge`
- Use in components with conditional classes
- Prevents class priority issues

#### 5. class-variance-authority (CVA)
Build variant-based component props with type safety
- Install: `npm install class-variance-authority`
- Works great with tailwind-merge
- "Golden standard" for component variants

### Theme State with Zustand (Reference for Future Implementation)

**Zustand Store pattern:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'app-theme' }
  )
);
```

**React Implementation with useLayoutEffect:**
```tsx
import { useLayoutEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';

export default function App() {
  const { theme, setTheme } = useThemeStore();

  // Apply theme attribute before browser repaints to prevent flash
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text transition-colors">
      {/* Content */}
    </div>
  );
}
```

**Key details:**
- Adding `transition-colors` to root container ensures smooth theme switching
- `useLayoutEffect` prevents "flash" of wrong theme colors
- For SSR, ensure initial state matches theme script injected into `<head>`

### Migration Steps Summary

1. **Capture pre-upgrade baselines**: Run `npm run capture-baselines` before any changes
2. **Run upgrade tool** (recommended): `npx @tailwindcss/upgrade` (requires Node.js 20+)
3. **Update dependencies**: `tailwindcss@next`, `@tailwindcss/vite@next`, plus all enhancement packages
4. **Update Vite config**: Replace PostCSS plugin with `@tailwindcss/vite`, add vite-plugin-svgr
5. **Migrate config**: Move `tailwind.config.js` content to `@theme` block in CSS
6. **Update CSS**: Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`
7. **Migrate custom utilities**: Change `@layer utilities` to `@utility` directive
8. **Add enhancements**: Configure typography, container-queries, install tailwind-merge & CVA
9. **Test**: Run `npm run build`, `npm run dev`, `npm run test`
10. **Capture post-upgrade baselines**: Run `npm run capture-baselines` after changes
11. **Verify**: Use ZAI ui_diff_check to compare baselines, ensure no visual regressions

### Breaking Changes to Handle

- **Renamed utilities**: `shadow-sm` → `shadow-xs`, `outline-none` → `outline-hidden`, etc.
- **Default border color**: Changed from `gray-200` to `currentColor`
- **Default ring width**: Changed from `3px` to `1px`, color from `blue-500` to `currentColor`
- **Container utility**: Configuration options (`center`, `padding`) removed; use `@utility` directive instead
- **Removed utilities**: `bg-opacity-*`, `text-opacity-*`, `flex-grow-*`, etc. (use opacity modifiers instead)

### VS Code Extension Update

Update Tailwind CSS IntelliSense to support v4 CSS-first syntax (detecting variables inside `@theme` block)
