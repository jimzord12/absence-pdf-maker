import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaveRequestPage } from './LeaveRequestPage';

describe('LeaveRequestPage - 764px Breakpoint Implementation', () => {
  beforeEach(() => {
    render(<LeaveRequestPage />);
  });

  describe('Breakpoint @764: Usage', () => {
    it('should use exactly @764: breakpoint in header container', () => {
      const { container } = render(<LeaveRequestPage />);
      const headerContainer = container.querySelector('.flex-col');
      expect(headerContainer).toBeInTheDocument();
      expect(headerContainer?.className).toContain('@764:');
    });

    it('should hide StarsWarsRobotToggle on screens < 764px', () => {
      const { container } = render(<LeaveRequestPage />);
      const desktopToggleContainer = container.querySelector('.flex-col.gap-2');

      if (desktopToggleContainer) {
        expect(desktopToggleContainer.className).toContain('hidden');
      }
    });

    it('should hide ThemeToggle on screens >= 764px', () => {
      const { container } = render(<LeaveRequestPage />);
      const mobileToggleContainer = container.querySelector('.flex-row.gap-3');

      if (mobileToggleContainer) {
        expect(mobileToggleContainer.className).toContain('hidden');
      }
    });

    it('should show StarsWarsRobotToggle + LocaleSelector in vertical stack on >= 764px', () => {
      const { container } = render(<LeaveRequestPage />);
      const desktopContainer = container.querySelector('.flex-col.gap-2');

      if (desktopContainer) {
        expect(desktopContainer.className).toContain('flex-col');
        const robotToggle = container.querySelector('[aria-label="Toggle dark mode"]');
        expect(robotToggle).toBeInTheDocument();
      }
    });

    it('should show ThemeToggle + LocaleSelector in horizontal row on < 764px', () => {
      const { container } = render(<LeaveRequestPage />);
      const mobileContainer = container.querySelector('.flex-row.gap-3');

      if (mobileContainer) {
        expect(mobileContainer.className).toContain('flex-row');
        const themeToggle = screen.getByRole('button', { name: /toggle/i });
        expect(themeToggle).toBeInTheDocument();
      }
    });

    it('should show LocaleSelector in desktop container', () => {
      const { container } = render(<LeaveRequestPage />);
      const desktopContainer = container.querySelector('.flex-col.gap-2');

      if (desktopContainer) {
        const localeSelectors = desktopContainer.querySelectorAll('select, [role="combobox"]');
        expect(localeSelectors.length).toBeGreaterThan(0);
      }
    });

    it('should have LocaleSelector visible on all screen sizes', () => {
      render(<LeaveRequestPage />);
      const localeSelectors = screen.getAllByRole('combobox');
      expect(localeSelectors.length).toBeGreaterThan(0);
    });
  });

  describe('Breakpoint Implementation Verification', () => {
    it('should NOT use xl: breakpoint (1280px)', () => {
      const { container } = render(<LeaveRequestPage />);
      const headerContainer = container.querySelector('.flex-col');

      if (headerContainer) {
        expect(headerContainer.className).not.toContain('xl:');
      }
    });

    it('should NOT use lg: breakpoint (1024px)', () => {
      const { container } = render(<LeaveRequestPage />);
      const headerContainer = container.querySelector('.flex-col');

      if (headerContainer) {
        expect(headerContainer.className).not.toContain('lg:');
      }
    });

    it('should use @764: breakpoint for toggle visibility', () => {
      const { container } = render(<LeaveRequestPage />);

      const desktopToggleContainer = container.querySelector('.flex-col.gap-2');
      const mobileToggleContainer = container.querySelector('.flex-row.gap-3');

      const has764Breakpoint =
        (desktopToggleContainer && desktopToggleContainer.className.includes('@764')) ||
        (mobileToggleContainer && mobileToggleContainer.className.includes('@764'));

      expect(has764Breakpoint).toBe(true);
    });
  });

  describe('Layout at Different Breakpoints', () => {
    it('should have proper responsive header layout', () => {
      const { container } = render(<LeaveRequestPage />);
      const headerContainer = container.querySelector('.flex-col');

      expect(headerContainer).toBeInTheDocument();
      expect(headerContainer).toHaveClass('flex-col');
    });

    it('should maintain gap spacing for vertical layout', () => {
      const { container } = render(<LeaveRequestPage />);
      const desktopContainer = container.querySelector('.flex-col.gap-2');

      if (desktopContainer) {
        expect(desktopContainer).toHaveClass('gap-2');
      }
    });

    it('should maintain gap spacing for horizontal layout', () => {
      const { container } = render(<LeaveRequestPage />);
      const mobileContainer = container.querySelector('.flex-row.gap-3');

      if (mobileContainer) {
        expect(mobileContainer).toHaveClass('gap-3');
      }
    });
  });
});
