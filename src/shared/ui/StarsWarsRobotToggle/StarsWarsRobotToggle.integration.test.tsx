import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../state/theme.store';
import { StarsWarsRobotToggle } from './StarsWarsRobotToggle';

/**
 * Integration Tests for StarsWarsRobotToggle with Theme Store
 *
 * Tests that StarsWarsRobotToggle properly integrates with the theme store,
 * ThemeProvider, and document attributes for complete theme switching functionality.
 */

function ThemeToggleWrapper() {
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  return (
    <StarsWarsRobotToggle
      checked={theme === 'dark'}
      onChange={toggleTheme}
      aria-label="Toggle theme"
    />
  );
}

describe('StarsWarsRobotToggle Integration with Theme Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'light' });
    vi.restoreAllMocks();
  });

  describe('toggle reflects current theme state correctly', () => {
    it('should show unchecked state when theme is light', () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should show checked state when theme is dark', () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should update checked state when theme changes externally', () => {
      const { rerender } = render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      let checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      rerender(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      act(() => {
        useThemeStore.getState().setTheme('light');
      });

      rerender(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('clicking toggle calls store\'s toggleTheme', () => {
    it('should toggle theme from light to dark on click', async () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      expect(useThemeStore.getState().theme).toBe('light');

      const label = screen.getByLabelText('Toggle theme');
      await userEvent.click(label);

      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should toggle theme from dark to light on click', async () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      expect(useThemeStore.getState().theme).toBe('dark');

      const label = screen.getByLabelText('Toggle theme');
      await userEvent.click(label);

      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should toggle multiple times correctly', async () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const label = screen.getByLabelText('Toggle theme');

      await userEvent.click(label);
      expect(useThemeStore.getState().theme).toBe('dark');

      await userEvent.click(label);
      expect(useThemeStore.getState().theme).toBe('light');

      await userEvent.click(label);
      expect(useThemeStore.getState().theme).toBe('dark');

      await userEvent.click(label);
      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('theme attribute updates on document element', () => {
    it('should have data-theme="light" initially', () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update data-theme to dark when toggle clicked', async () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      const label = screen.getByLabelText('Toggle theme');
      await userEvent.click(label);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update data-theme back to light when toggle clicked again', async () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const label = screen.getByLabelText('Toggle theme');

      await userEvent.click(label);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      await userEvent.click(label);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should sync toggle state with data-theme attribute', async () => {
      const { rerender } = render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const label = screen.getByLabelText('Toggle theme');

      let checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      await userEvent.click(label);
      rerender(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );
      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      await userEvent.click(label);
      rerender(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );
      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('theme persistence with toggle interaction', () => {
    it('should persist theme to localStorage after toggle', async () => {
      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const label = screen.getByLabelText('Toggle theme');
      await userEvent.click(label);

      const storedData = localStorage.getItem('app-theme');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.theme).toBe('dark');
      }
    });

    it('should persist light theme when toggling back from dark', async () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <ThemeToggleWrapper />
        </ThemeProvider>
      );

      const label = screen.getByLabelText('Toggle theme');
      await userEvent.click(label);

      const storedData = localStorage.getItem('app-theme');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.theme).toBe('light');
      }
    });
  });
});
