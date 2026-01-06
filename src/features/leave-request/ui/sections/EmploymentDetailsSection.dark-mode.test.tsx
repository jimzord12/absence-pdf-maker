import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../../../shared/state/theme.store';
import { EmploymentDetailsSection } from './EmploymentDetailsSection';

describe('EmploymentDetailsSection - Dark Mode Integration', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.setAttribute('data-theme', 'light');
  });

  describe('light mode rendering', () => {
    it('should render in light mode with data-theme="light"', () => {
      render(
        <ThemeProvider>
          <EmploymentDetailsSection />
        </ThemeProvider>
      );
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should render section content in light mode', () => {
      render(
        <ThemeProvider>
          <EmploymentDetailsSection />
        </ThemeProvider>
      );
      expect(screen.getByText('Employment Details Form')).toBeInTheDocument();
    });
  });

  describe('dark mode rendering', () => {
    it('should render in dark mode with data-theme="dark"', () => {
      useThemeStore.setState({ theme: 'dark' });
      document.documentElement.setAttribute('data-theme', 'dark');

      render(
        <ThemeProvider>
          <EmploymentDetailsSection />
        </ThemeProvider>
      );
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should render section content in dark mode', () => {
      useThemeStore.setState({ theme: 'dark' });
      document.documentElement.setAttribute('data-theme', 'dark');

      render(
        <ThemeProvider>
          <EmploymentDetailsSection />
        </ThemeProvider>
      );
      expect(screen.getByText('Employment Details Form')).toBeInTheDocument();
    });
  });
});
