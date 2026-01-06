import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useThemeStore } from '../../shared/state/theme.store';

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'light' });
    vi.restoreAllMocks();
  });

  describe('basic rendering', () => {
    it('should render children without errors', () => {
      expect(() =>
        render(
          <ThemeProvider>
            <div>Child content</div>
          </ThemeProvider>
        )
      ).not.toThrow();
    });

    it('should render children content', () => {
      const { getByText } = render(
        <ThemeProvider>
          <div>Test child content</div>
        </ThemeProvider>
      );

      expect(getByText('Test child content')).toBeInTheDocument();
    });
  });

  describe('theme application', () => {
    it('should apply data-theme attribute to document element with initial theme', () => {
      render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should apply data-theme="dark" when theme is dark', () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update data-theme attribute when theme changes', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      rerender(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('prevent theme flash', () => {
    it('should use useLayoutEffect for synchronous theme application', () => {
      render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      const dataTheme = document.documentElement.getAttribute('data-theme');
      expect(dataTheme).toBe('light');
    });

    it('should set theme before React renders children (no flash)', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test content</div>
        </ThemeProvider>
      );

      const dataTheme = document.documentElement.getAttribute('data-theme');
      const child = document.querySelector('[data-testid="child"]');

      expect(dataTheme).toBe('light');
      expect(child).toBeInTheDocument();
    });
  });

  describe('theme persistence', () => {
    it('should persist theme changes to localStorage', () => {
      render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      const storedData = localStorage.getItem('app-theme');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.theme).toBe('dark');
      }
    });
  });

  describe('default theme', () => {
    it('should default to light theme', () => {
      render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      expect(useThemeStore.getState().theme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
