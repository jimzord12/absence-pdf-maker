# add-comprehensive-tests

**Priority:** medium
**Blocks:** none
**Blocked By:** upgrade-tailwind-v3-to-v4, implement-theme-toggle, design-color-palettes-light-dark
**Issue:** N/A

---

## Description

Add comprehensive test coverage for the new theme functionality, color palettes, and ensure existing tests remain robust after Tailwind v3→v4 upgrade. Includes unit tests, integration tests, and E2E tests using Playwright.

## Constraints

- Must add tests for theme store, ThemeProvider, and theme toggle
- Must add tests for color palette utilities (if any)
- Must verify all existing tests still pass after Tailwind upgrade
- Must add integration tests for theme switching workflows
- Must add E2E tests for critical user flows with theme switching
- Use Vitest for unit/integration tests, Playwright for E2E tests
- Must test both light and dark modes
- Must test accessibility (keyboard navigation, ARIA, screen readers)

## Acceptance Criteria

### Theme Store Tests

- `theme.store.test.ts` created with tests for:
  - Initial state is 'light'
  - `toggleTheme` switches between 'light' and 'dark'
  - `setTheme` sets theme correctly
  - Persist middleware saves to localStorage
  - Persist middleware loads from localStorage on mount

### ThemeProvider Tests

- `ThemeProvider.test.tsx` created with tests for:
  - Applies `data-theme` attribute to document element
  - Updates attribute when theme changes
  - Renders children without errors
  - Uses `useLayoutEffect` (verify timing)

### StarsWarsRobotToggle Integration Tests

- Integration test for theme toggle component with theme store:
  - Toggle reflects current theme state correctly
  - Clicking toggle calls store's `toggleTheme`
  - Theme attribute updates on document element
  - Dark mode classes apply to components

### Color Palette Tests

- If color utilities/helpers are created, test:
  - Light theme colors match specifications
  - Dark theme colors match specifications
  - All semantic colors are defined
  - No duplicate or missing color values

### Component Tests for Dark Mode

- All UI components have dark mode variant tests:
  - Button: `dark:` classes render correctly
  - Input: `dark:` classes render correctly
  - Card: `dark:` classes render correctly
  - Modal: `dark:` classes render correctly
  - Alert: `dark:` classes render correctly
  - All other shared UI components

### Integration Tests

- Theme switching workflow tests:
  - User toggles theme → entire app updates
  - Theme persists across page reload
  - Theme persists across browser restart (via localStorage)
  - PDF generation remains in light mode regardless of theme

### E2E Tests (Playwright)

- Critical user flows with theme switching:
  - User loads app → defaults to light mode
  - User toggles to dark mode → entire UI updates
  - User fills form in dark mode → validation works
  - User toggles back to light mode → UI returns to light
  - User refreshes page → persisted theme loads

### Visual Regression Tests

- After theme implementation:
  - Capture baselines for light mode
  - Capture baselines for dark mode
  - Verify no visual regressions with ZAI ui_diff_check

### Accessibility Tests

- Theme toggle accessibility:
  - Keyboard users can toggle theme (Tab to focus, Enter/Space to activate)
  - Screen reader announces theme change (if meaningful)
  - Focus is not lost during theme switch
  - Color contrast ratios meet WCAG AA in both themes

### Existing Test Coverage

- All existing tests still pass after Tailwind v4 upgrade
- No tests broken by v4 breaking changes
- Update any tests affected by renamed utilities (shadow-sm → shadow-xs, outline-none → outline-hidden)

## Notes

### Test Files Structure

Create tests following existing pattern:

```
src/shared/state/theme.store.test.ts
src/app/providers/ThemeProvider.test.tsx
src/shared/ui/StarsWarsRobotToggle/StarsWarsRobotToggle.integration.test.tsx
src/features/leave-request/ui/...theme.integration.test.tsx
tests/e2e/theme-switching.spec.ts  (if Playwright tests are separate)
```

### Testing Theme Store

**File:** `src/shared/state/theme.store.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from './theme.store';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize with light theme', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.theme).toBe('light');
  });

  it('should toggle between light and dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('should set theme to specific value', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorage.getItem('app-theme')).toBeDefined();
    // Note: Zustand persist stores data, verify structure if needed
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('app-theme', JSON.stringify({ state: { theme: 'dark' } }));

    const { result } = renderHook(() => useThemeStore());
    expect(result.current.theme).toBe('dark');
  });
});
```

### Testing ThemeProvider

**File:** `src/app/providers/ThemeProvider.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useThemeStore } from '../../shared/state/theme.store';

const TestComponent = () => {
  const { theme } = useThemeStore();
  return <div data-testid="theme-display">{theme}</div>;
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Child content</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should apply data-theme attribute to document', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should update data-theme attribute when theme changes', () => {
    const { result } = renderHook(() => useThemeStore());

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

### Testing Dark Mode Components

**Example:** Button component dark mode test

```typescript
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button dark mode', () => {
  it('should apply dark mode classes', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const { container } = render(
      <Button className="bg-white dark:bg-surface-800">
        Click me
      </Button>
    );

    expect(container.firstChild).toHaveClass('dark:bg-surface-800');
  });
});
```

### Testing Theme Toggle Integration

**Integration test:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { StarsWarsRobotToggle } from '../../../shared/ui/StarsWarsRobotToggle';
import { useThemeStore } from '../../../shared/state/theme.store';

const TestWrapper = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <StarsWarsRobotToggle
        checked={theme === 'dark'}
        onChange={toggleTheme}
        aria-label="Toggle theme"
      />
    </div>
  );
};

describe('Theme Toggle Integration', () => {
  it('should reflect initial theme state', () => {
    render(<TestWrapper />);
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should toggle theme when clicked', () => {
    render(<TestWrapper />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });
});
```

### E2E Tests with Playwright

**File:** `tests/e2e/theme-switching.spec.ts` (or in playwright.config location)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load with light mode by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('section[aria-labelledby="personal-details-heading"]');

    const html = await page.locator('html').getAttribute('data-theme');
    expect(html).toBe('light');
  });

  test('should toggle to dark mode', async ({ page }) => {
    await page.goto('/');

    // Find and click the theme toggle
    const toggle = page.getByRole('checkbox', { name: 'Toggle theme' });
    await toggle.click();

    // Wait for theme update
    await page.waitForFunction(() =>
      document.documentElement.getAttribute('data-theme') === 'dark'
    );

    const html = await page.locator('html').getAttribute('data-theme');
    expect(html).toBe('dark');
  });

  test('should persist theme across page reload', async ({ page }) => {
    await page.goto('/');

    // Toggle to dark mode
    const toggle = page.getByRole('checkbox', { name: 'Toggle theme' });
    await toggle.click();
    await page.waitForFunction(() =>
      document.documentElement.getAttribute('data-theme') === 'dark'
    );

    // Reload page
    await page.reload();

    // Verify dark mode persists
    const html = await page.locator('html').getAttribute('data-theme');
    expect(html).toBe('dark');
  });

  test('should fill form in dark mode', async ({ page }) => {
    await page.goto('/');

    // Toggle to dark mode
    const toggle = page.getByRole('checkbox', { name: 'Toggle theme' });
    await toggle.click();
    await page.waitForFunction(() =>
      document.documentElement.getAttribute('data-theme') === 'dark'
    );

    // Fill form fields
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');

    // Verify fields have dark mode styling
    const firstName = page.getByLabel('First Name');
    const classes = await firstName.getAttribute('class');
    expect(classes).toContain('dark:');
  });
});
```

### Accessibility Testing

Use Playwright's accessibility features:

```typescript
test('should be accessible in dark mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Toggle theme' }).click();

  // Run accessibility audit
  const snapshot = await page.accessibility.snapshot();
  expect(snapshot).toEqual(expect.objectContaining({
    // Check for no violations
  }));
});
```

### Test Coverage Goals

Aim for:

- **Theme store**: 100% coverage (state, actions, persist)
- **ThemeProvider**: 100% coverage (attribute application, updates)
- **Theme toggle**: 100% coverage (integration with store)
- **Component dark modes**: 80%+ coverage (all shared UI components)
- **Integration workflows**: Key user paths (toggle, persist, form filling)
- **E2E**: Critical flows (load, toggle, fill form, persist)

### Fixing Broken Tests from Tailwind v4 Upgrade

After the Tailwind v3→v4 upgrade, some tests may break due to:

1. **Renamed utilities**: Update test expectations
   - `shadow-sm` → `shadow-xs`
   - `outline-none` → `outline-hidden`

2. **Class list changes**: Update snapshots if needed
   - New utility classes from v4
   - Removed utilities (bg-opacity-*, text-opacity-*, flex-grow-*)

3. **Dark mode variants**: Add tests for dark mode classes
   - Verify `dark:` classes are present in DOM
   - Test theme-dependent behavior

### Visual Regression Testing

After implementing theme functionality:

```bash
# Capture light mode baselines
npm run dev  # Ensure light mode
npm run capture-baselines
mv docs/baselines/*.png docs/baselines/light/

# Capture dark mode baselines
# (Manually toggle to dark mode or set localStorage)
npm run capture-baselines
mv docs/baselines/*.png docs/baselines/dark/

# Compare
# Use ZAI ui_diff_check for detailed analysis
```

### Test Scripts

Add to `package.json` if needed:

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:integration": "vitest --config=vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

### Coverage Thresholds

Set coverage thresholds in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
});
```

Install coverage provider:
```bash
npm install -D @vitest/coverage-v8
```
