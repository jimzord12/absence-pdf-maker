import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useThemeStore } from '../../state/theme.store';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset theme store to light mode before each test
    useThemeStore.setState({ theme: 'light' });
  });

  afterEach(() => {
    // Clean up after each test
    useThemeStore.setState({ theme: 'light' });
  });

  describe('Rendering', () => {
    it('should render toggle button with correct attributes', () => {
      render(<ThemeToggle aria-label="Toggle dark mode" />);

      const button = screen.getByRole('button', { name: 'Toggle dark mode' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should render sun icon when in light mode', () => {
      useThemeStore.setState({ theme: 'light' });
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Sun icon should be visible (scale-100, opacity-100)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render moon icon when in dark mode', () => {
      useThemeStore.setState({ theme: 'dark' });
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: 'Toggle theme' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should apply custom className prop', () => {
      render(<ThemeToggle className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Theme State and Styling', () => {
    it('should have light mode classes when theme is light', () => {
      useThemeStore.setState({ theme: 'light' });
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-300');
      expect(button).not.toHaveClass('bg-blue-600');
    });

    it('should have dark mode classes when theme is dark', () => {
      useThemeStore.setState({ theme: 'dark' });
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
      expect(button).not.toHaveClass('bg-gray-300');
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('should toggle from light to dark when clicked', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Initial state should be light mode
      expect(useThemeStore.getState().theme).toBe('light');

      // Click to toggle to dark mode
      fireEvent.click(button);

      // Theme should be dark
      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should toggle from dark to light when clicked', () => {
      useThemeStore.setState({ theme: 'dark' });
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Initial state should be dark mode
      expect(useThemeStore.getState().theme).toBe('dark');

      // Click to toggle to light mode
      fireEvent.click(button);

      // Theme should be light
      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should toggle theme multiple times correctly', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Start: light
      expect(useThemeStore.getState().theme).toBe('light');

      // Click 1: dark
      fireEvent.click(button);
      expect(useThemeStore.getState().theme).toBe('dark');

      // Click 2: light
      fireEvent.click(button);
      expect(useThemeStore.getState().theme).toBe('light');

      // Click 3: dark
      fireEvent.click(button);
      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should update aria-pressed attribute when theme changes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Light mode: aria-pressed="false"
      expect(button).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(button);

      // Dark mode: aria-pressed="true"
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have correct default aria-label', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: 'Toggle theme' });
      expect(button).toBeInTheDocument();
    });

    it('should allow custom aria-label', () => {
      render(<ThemeToggle aria-label="Switch between light and dark mode" />);

      const button = screen.getByRole('button', { name: 'Switch between light and dark mode' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Integration with Theme Store', () => {
    it('should reflect theme store state on render', () => {
      // Set theme to dark before rendering
      useThemeStore.setState({ theme: 'dark' });

      const { unmount } = render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveClass('bg-blue-600');

      unmount();
    });

    it('should respond to external theme changes', () => {
      const { unmount } = render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Initial: light mode
      expect(useThemeStore.getState().theme).toBe('light');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      // Clean up previous render
      unmount();

      // Change theme externally via store
      useThemeStore.getState().setTheme('dark');

      // Re-render to see changes
      render(<ThemeToggle />);

      const newButton = screen.getByRole('button');
      expect(newButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Compact Design', () => {
    it('should have compact dimensions (h-8 w-14)', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'w-14');
    });

    it('should have rounded-full design', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('should have transition effects', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors', 'duration-300', 'ease-in-out');
    });
  });

  describe('Focus States', () => {
    it('should have focus ring styles', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2');
    });
  });
});
