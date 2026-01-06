import { useLayoutEffect } from 'react';
import { useThemeStore } from '../../shared/state/theme.store';

/**
 * ThemeProvider - Applies theme to document element and prevents theme flash on page load
 *
 * - Uses useLayoutEffect to apply theme synchronously before browser paint
 * - Prevents FOUC (Flash of Unstyled Content) by setting data-theme immediately
 * - Persists theme across page reloads via Zustand persist middleware
 * - Defaults to 'light' mode (see theme.store.ts)
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useThemeStore((state) => state.theme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
};
