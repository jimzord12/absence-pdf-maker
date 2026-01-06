import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../../shared/state/theme.store';

describe('Button', () => {
  describe('variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toHaveClass('bg-black', 'text-white');
    });

    it('should render primary variant when specified', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-black', 'text-white');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button', { name: 'Danger' });
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });
  });

  describe('sizes', () => {
    it('should render medium size by default', () => {
      render(<Button>Default size</Button>);
      const button = screen.getByRole('button', { name: 'Default size' });
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: 'Large' });
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      // Check for Spinner component inside button (should have role="status")
      const button = screen.getByRole('button');
      const spinner = button.querySelector('[role="status"]');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('mr-2');
      // Button should display loading text (not the sr-only text)
      expect(button).toHaveTextContent('Loading...');
    });

    it('should disable button when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not show children when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    it('should show custom loading text when provided', () => {
      render(<Button isLoading loadingText="Processing...">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Processing...');
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('should use small spinner size for sm and md buttons', () => {
      render(<Button isLoading size="sm">Button</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('[role="status"]');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should use medium spinner size for lg buttons', () => {
      render(<Button isLoading size="lg">Button</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('[role="status"]');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have disabled styling when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick handler when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick handler when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} isLoading>Loading</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('base styles', () => {
    it('should have base button styles', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center', 'font-medium', 'rounded-md', 'transition-colors');
    });

    it('should have focus ring styles', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-offset-2');
    });
  });

  describe('accessibility', () => {
    it('should support aria-label', () => {
      render(<Button aria-label="Close action" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close action');
    });

    it('should support all standard button attributes', () => {
      render(<Button type="submit" form="test-form" name="submit-btn">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('name', 'submit-btn');
    });
  });

  describe('dark mode', () => {
    beforeEach(() => {
      useThemeStore.setState({ theme: 'light' });
      document.documentElement.setAttribute('data-theme', 'light');
    });

    it('should render in light mode with default theme', () => {
      render(
        <ThemeProvider>
          <Button>Light Mode</Button>
        </ThemeProvider>
      );
      const button = screen.getByRole('button', { name: 'Light Mode' });
      expect(button).toBeInTheDocument();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should render in dark mode with data-theme="dark"', () => {
      useThemeStore.setState({ theme: 'dark' });
      document.documentElement.setAttribute('data-theme', 'dark');

      render(
        <ThemeProvider>
          <Button>Dark Mode</Button>
        </ThemeProvider>
      );
      const button = screen.getByRole('button', { name: 'Dark Mode' });
      expect(button).toBeInTheDocument();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should have dark: variant classes when theme is dark', () => {
      useThemeStore.setState({ theme: 'dark' });
      document.documentElement.setAttribute('data-theme', 'dark');

      render(
        <ThemeProvider>
          <Button variant="secondary">Secondary</Button>
        </ThemeProvider>
      );
      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('dark:bg-[color:var(--color-surface-hover)]');
      expect(button).toHaveClass('dark:text-[color:var(--color-text-primary)]');
      expect(button).toHaveClass('dark:border');
      expect(button).toHaveClass('dark:border-[color:var(--color-border)]');
    });

    it('should have dark hover classes when theme is dark', () => {
      useThemeStore.setState({ theme: 'dark' });
      document.documentElement.setAttribute('data-theme', 'dark');

      render(
        <ThemeProvider>
          <Button variant="secondary">Secondary</Button>
        </ThemeProvider>
      );
      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('dark:hover:bg-[color:var(--color-border)]');
    });

    it('should have dark hover class for primary variant', () => {
      useThemeStore.setState({ theme: 'dark' });
      document.documentElement.setAttribute('data-theme', 'dark');

      render(
        <ThemeProvider>
          <Button variant="primary">Primary</Button>
        </ThemeProvider>
      );
      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('dark:hover:bg-[color:var(--color-primary-light)]');
    });

    it('should have dark: prefix in className string', () => {
      document.documentElement.setAttribute('data-theme', 'light');

      render(
        <ThemeProvider>
          <Button>Light</Button>
        </ThemeProvider>
      );
      const button = screen.getByRole('button', { name: 'Light' });
      expect(button.className).toContain('dark:');
    });
  });
});
