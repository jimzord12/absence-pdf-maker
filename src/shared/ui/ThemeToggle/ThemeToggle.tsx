import { forwardRef } from 'react';
import { useThemeStore } from '../../state/theme.store';

export interface ThemeToggleProps {
  'aria-label'?: string;
  className?: string;
}

/**
 * Compact Theme Toggle Component
 *
 * A minimal, compact theme toggle for mobile devices.
 * Uses the theme store to manage dark/light mode state.
 *
 * @example
 * ```tsx
 * <ThemeToggle aria-label="Toggle dark mode" />
 * ```
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ 'aria-label': ariaLabel = 'Toggle theme', className = '' }, ref) => {
    const theme = useThemeStore(state => state.theme);
    const toggleTheme = useThemeStore(state => state.toggleTheme);
    const isDark = theme === 'dark';

    const handleClick = () => {
      toggleTheme();
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full
          transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-blue-400
          ${isDark ? 'bg-blue-600' : 'bg-gray-300'}
          ${className}
        `}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-pressed={isDark}
      >
        {/* Sun icon (light mode) */}
        <svg
          className={`absolute left-1.5 h-5 w-5 transition-all duration-300 ease-in-out ${
            isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon icon (dark mode) */}
        <svg
          className={`absolute right-1.5 h-5 w-5 transition-all duration-300 ease-in-out ${
            isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>

        {/* Toggle knob */}
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out
            ${isDark ? 'translate-x-7' : 'translate-x-0.5'}
          `}
        />
      </button>
    );
  }
);

ThemeToggle.displayName = 'ThemeToggle';
