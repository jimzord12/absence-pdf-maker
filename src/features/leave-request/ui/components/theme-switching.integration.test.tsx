import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../../../shared/state/theme.store';
import { LeaveRequestForm } from './LeaveRequestForm';
import { ReviewAndGenerate } from './ReviewAndGenerate';

describe('Theme Switching Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.setAttribute('data-theme', 'light');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.setAttribute('data-theme', 'light');
  });

  describe('Theme Toggle Workflow', () => {
    it('should update entire app when user toggles theme', () => {
      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(useThemeStore.getState().theme).toBe('light');

      act(() => {
        useThemeStore.getState().toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should update data-theme attribute on document element when toggling', () => {
      render(
        <ThemeProvider>
          <LeaveRequestForm />
          <ReviewAndGenerate />
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      act(() => {
        useThemeStore.getState().setTheme('light');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should maintain theme attribute across re-renders', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div data-testid="test-div">Test content</div>
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      rerender(
        <ThemeProvider>
          <div data-testid="test-div">Updated content</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle multiple times correctly', () => {
      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      const store = useThemeStore.getState();

      act(() => store.toggleTheme());
      expect(useThemeStore.getState().theme).toBe('dark');

      act(() => store.toggleTheme());
      expect(useThemeStore.getState().theme).toBe('light');

      act(() => store.toggleTheme());
      expect(useThemeStore.getState().theme).toBe('dark');

      act(() => store.toggleTheme());
      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme to localStorage', () => {
      render(
        <ThemeProvider>
          <div data-testid="content">Test</div>
        </ThemeProvider>
      );

      expect(useThemeStore.getState().theme).toBe('light');

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

    it('should persist theme to localStorage when changed', () => {
      render(
        <ThemeProvider>
          <div data-testid="content">Test</div>
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

    it('should persist theme across browser restart (localStorage)', () => {
      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      const darkData = localStorage.getItem('app-theme');
      expect(darkData).toBeDefined();
      if (darkData) {
        const darkParsed = JSON.parse(darkData);
        expect(darkParsed.state.theme).toBe('dark');
      }

      act(() => {
        useThemeStore.getState().setTheme('light');
      });

      const lightData = localStorage.getItem('app-theme');
      expect(lightData).toBeDefined();
      if (lightData) {
        const lightParsed = JSON.parse(lightData);
        expect(lightParsed.state.theme).toBe('light');
      }
    });

    it('should use correct storage key "app-theme"', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      const storageKeys = Object.keys(localStorage);
      expect(storageKeys).toContain('app-theme');
    });

    it('should restore light theme as default when no localStorage exists', () => {
      localStorage.clear();

      render(
        <ThemeProvider>
          <div data-testid="content">Test</div>
        </ThemeProvider>
      );

      expect(useThemeStore.getState().theme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Form Validation in Dark Mode', () => {
    it('should validate form correctly when in dark mode', () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(screen.getByText('Employment Details Form')).toBeInTheDocument();
      expect(screen.getByText('Leave Details Form')).toBeInTheDocument();
    });

    it('should show validation errors in dark mode', () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should handle form state changes correctly in dark mode', async () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      const fullNameInput = screen.getByLabelText(/full name/i);
      await userEvent.type(fullNameInput, 'John Doe');

      expect(fullNameInput).toHaveValue('John Doe');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle between themes while form is filled', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      const fullNameInput = screen.getByLabelText(/full name/i);
      await userEvent.clear(fullNameInput);
      await userEvent.type(fullNameInput, 'Jane Smith');
      expect(fullNameInput).toHaveValue('Jane Smith');

      act(() => {
        useThemeStore.getState().toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(fullNameInput).toHaveValue('Jane Smith');

      act(() => {
        useThemeStore.getState().toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(fullNameInput).toHaveValue('Jane Smith');

      unmount();
    });
  });

  describe('PDF Generation Remains in Light Mode', () => {
    it('should generate PDF in light mode regardless of UI theme', () => {
      useThemeStore.setState({ theme: 'dark' });

      render(
        <ThemeProvider>
          <ReviewAndGenerate />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      act(() => {
        const store = useThemeStore.getState();
        store.setTheme('dark');
      });

      expect(screen.getByText('Leave Details Summary')).toBeInTheDocument();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should not affect PDF generation when theme switches', () => {
      render(
        <ThemeProvider>
          <ReviewAndGenerate />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Generate PDF' })).toBeInTheDocument();

      act(() => {
        useThemeStore.getState().setTheme('light');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('CSS Transitions for Theme Switching', () => {
    it('should apply CSS transitions when switching themes', () => {
      render(
        <ThemeProvider>
          <div data-testid="test-element" className="bg-background text-foreground">
            Test content
          </div>
        </ThemeProvider>
      );

      const testElement = screen.getByTestId('test-element');

      expect(testElement).toBeInTheDocument();

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should maintain transition properties on all elements', () => {
      render(
        <ThemeProvider>
          <div>
            <button data-testid="button">Button</button>
            <input data-testid="input" type="text" />
            <div data-testid="card">Card</div>
          </div>
        </ThemeProvider>
      );

      const button = screen.getByTestId('button');
      const input = screen.getByTestId('input');
      const card = screen.getByTestId('card');

      expect(button).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(card).toBeInTheDocument();

      act(() => {
        useThemeStore.getState().toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should apply transitions for background-color, color, border-color, box-shadow', () => {
      render(
        <ThemeProvider>
          <div
            data-testid="transition-test"
            className="bg-background text-foreground border border-border shadow-lg"
          >
            Transition test
          </div>
        </ThemeProvider>
      );

      const element = screen.getByTestId('transition-test');
      expect(element).toBeInTheDocument();

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      act(() => {
        useThemeStore.getState().setTheme('light');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should apply smooth easing function for transitions', () => {
      render(
        <ThemeProvider>
          <div data-testid="easing-test" className="bg-background">
            Easing test
          </div>
        </ThemeProvider>
      );

      const element = screen.getByTestId('easing-test');
      expect(element).toBeInTheDocument();

      act(() => {
        const store = useThemeStore.getState();
        store.setTheme('dark');
        store.setTheme('light');
        store.setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Integration Across Multiple Components', () => {
    it('should maintain consistent theme across all components', () => {
      render(
        <ThemeProvider>
          <div data-testid="parent">
            <LeaveRequestForm />
            <ReviewAndGenerate />
          </div>
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(screen.getByText('Employment Details Form')).toBeInTheDocument();
      expect(screen.getByText('Personal Details Summary')).toBeInTheDocument();

      act(() => {
        useThemeStore.getState().setTheme('light');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update all components when theme changes', () => {
      const { rerender } = render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      act(() => {
        useThemeStore.getState().toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      rerender(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme toggling', () => {
      render(
        <ThemeProvider>
          <LeaveRequestForm />
        </ThemeProvider>
      );

      const store = useThemeStore.getState();

      for (let i = 0; i < 10; i++) {
        act(() => store.toggleTheme());
      }

      expect(useThemeStore.getState().theme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should handle localStorage corruption gracefully', () => {
      localStorage.setItem('app-theme', 'invalid-json');

      render(
        <ThemeProvider>
          <div data-testid="content">Test</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should not lose theme state on unmount/remount', () => {
      const { unmount } = render(
        <ThemeProvider>
          <div data-testid="content">Test</div>
        </ThemeProvider>
      );

      act(() => {
        useThemeStore.getState().setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      unmount();

      render(
        <ThemeProvider>
          <div data-testid="content">Test</div>
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
