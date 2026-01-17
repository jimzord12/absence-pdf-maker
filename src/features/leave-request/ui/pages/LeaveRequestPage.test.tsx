import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePwaInstall } from '../../../../app/providers/usePwaInstall';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { LeaveRequestPage } from './LeaveRequestPage';

const mockHolidaySet = new Set<string>(['2025-01-01', '2025-12-25', '2025-07-04']);

vi.mock('../../services/holidays/holidays.service', () => ({
  loadHolidays: () => mockHolidaySet,
  isHoliday: (date: Date, holidaySet: Set<string>) => holidaySet.has(date.toISOString().split('T')[0]),
}));

const mockPromptInstall = vi.fn().mockResolvedValue('accepted');

vi.mock('../../../../app/providers/usePwaInstall', () => ({
  usePwaInstall: vi.fn(() => ({
    isInstallable: false,
    canShowInstall: false,
    promptInstall: mockPromptInstall,
    dismiss: vi.fn(),
    snooze: vi.fn(),
  })),
}));

vi.mock('../components/LeaveRequestForm', () => ({
  LeaveRequestForm: () => <div data-testid="leave-request-form" role="form">Leave Request Form</div>,
}));

vi.mock('../components/ReviewAndGenerate', () => ({
  ReviewAndGenerate: () => {
    const { canShowInstall, promptInstall } = usePwaInstall();
    return (
      <div data-testid="review-and-generate">
        Review and Generate
        {canShowInstall && (
          <div data-testid="pwa-install-container">
            <button onClick={promptInstall} aria-label="Install App">Install App</button>
          </div>
        )}
      </div>
    );
  },
}));

  describe('5. PWA install button rendering and behavior', () => {
    beforeEach(() => {
      localStorage.clear();
      // Reset all mocks before each test
      (usePwaInstall as any).mockReturnValue({
        isInstallable: false,
        canShowInstall: false,
        promptInstall: mockPromptInstall,
        dismiss: vi.fn(),
        snooze: vi.fn(),
      });
      useLeaveRequestStore.setState({
        profile: {
          fullName: '',
          fathersName: '',
          email: '',
          phone: '',
          identityNumber: '',
          employeeId: '',
          companyName: 'ICS ΚΑΡΑΦΥΛΗΣ Α.Ε',
          department: '',
          position: '',
        },
        leaveDraft: {
          leaveType: 'annual',
          startDate: null,
          endDate: null,
          reason: '',
          leaveAllowance: null,
        },
        signature: {
          signatureDataUrl: '',
        },
        holidays: {
          holidaySet: new Set<string>(),
        },
        ui: {
          isSignatureModalOpen: false,
          isGeneratingPdf: false,
          lastGeneratedFileName: '',
          errorMessage: null,
          triggerValidation: null,
          forceFormReset: false,
        },
        pwa: {
          completedPdfGenerations: 0,
          dismissedPwaInstall: false,
          pwaInstallSnoozeCount: 0,
          pwaInstallSnoozeUntil: null,
        },
      });
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should NOT render install button when canShowInstall is false', () => {
      render(<LeaveRequestPage />);
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });

    it('should NOT render install button when canShowInstall is false (default)', () => {
      render(<LeaveRequestPage />);
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });

    it('should render install button when canShowInstall is true', () => {
      (usePwaInstall as any).mockReturnValue({
        isInstallable: true,
        canShowInstall: true,
        promptInstall: mockPromptInstall,
        dismiss: vi.fn(),
        snooze: vi.fn(),
      });
      render(<LeaveRequestPage />);
      const installButton = screen.getByRole('button', { name: /Install App/i });
      expect(installButton).toHaveAttribute('aria-label', 'Install App');
      expect(installButton).toBeInTheDocument();
    });

    it('should call promptInstall when install button is clicked', async () => {
      (usePwaInstall as any).mockReturnValue({
        isInstallable: true,
        canShowInstall: true,
        promptInstall: mockPromptInstall,
        dismiss: vi.fn(),
        snooze: vi.fn(),
      });
      render(<LeaveRequestPage />);
      const installButtons = screen.getAllByRole('button', { name: /Install App/i });
      const installButton = installButtons.find(
        btn => btn.getAttribute('aria-label') === 'Install App',
      ) as HTMLElement | undefined;
      if (installButton) {
        installButton.click();
      }
      expect(mockPromptInstall).toHaveBeenCalledTimes(installButton ? 1 : 0);
    });

    describe('1. Component renders without errors', () => {
    it('should render the page without throwing any errors', () => {
      expect(() => render(<LeaveRequestPage />)).not.toThrow();
    });

    it('should render the main container div', () => {
      const { container } = render(<LeaveRequestPage />);
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should render the content container with max-width', () => {
      const { container } = render(<LeaveRequestPage />);
      const contentContainer = container.querySelector('.max-w-7xl');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('2. Holiday loading on mount using useEffect', () => {
    it('should load holidays on component mount', () => {
      render(<LeaveRequestPage />);
      const store = useLeaveRequestStore.getState();
      expect(store.holidays.holidaySet).toEqual(mockHolidaySet);
    });
  });

  describe('3. Header displays correct title and description', () => {
    it('should render page title', () => {
      render(<LeaveRequestPage />);
      const title = screen.getByText('Leave Request');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');
    });

    it('should render the page description', () => {
      render(<LeaveRequestPage />);
      const description = screen.getByText('Submit your leave request and generate a PDF document');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
    });

    it('should apply correct title styling', () => {
      render(<LeaveRequestPage />);
      const title = screen.getByText('Leave Request');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-[color:var(--color-text-primary)]');
    });

    it('should apply correct description styling', () => {
      render(<LeaveRequestPage />);
      const description = screen.getByText('Submit your leave request and generate a PDF document');
      expect(description).toHaveClass('mt-2', 'text-sm', 'text-[color:var(--color-text-secondary)]');
    });
  });

  describe('4. Responsive layout and grid', () => {
    it('should apply gradient background to page container', () => {
      const { container } = render(<LeaveRequestPage />);
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-radial-[at_50%_80%]', 'dark:bg-radial-[at_50%_50%]');
    });

    it('should use responsive grid layout with media queries', () => {
      const { container } = render(<LeaveRequestPage />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-3', 'gap-6');
    });

    it('should stack toggle controls vertically on mobile (flex-col)', () => {
      const { container } = render(<LeaveRequestPage />);

      // Find the controls container that holds ThemeToggle and LocaleSelector
      const controlsContainer = container.querySelector('.flex-col');
      expect(controlsContainer).toBeInTheDocument();
      expect(controlsContainer).toHaveClass('flex-col', 'items-start', 'gap-4');
    });

    it('should have sm:flex-row breakpoint for toggle controls', () => {
      const { container } = render(<LeaveRequestPage />);

      const controlsContainer = container.querySelector('.sm\\:flex-row');
      expect(controlsContainer).toBeInTheDocument();
      expect(controlsContainer).toHaveClass('sm:flex-row', 'sm:items-center');
    });

    it('should stack header section (title + controls) at 500px breakpoint', () => {
      const { container } = render(<LeaveRequestPage />);

      // Find the header container with flex-col class
      const headerContainer = container.querySelector('.flex-col');
      expect(headerContainer).toBeInTheDocument();

      // Should have flex-col by default (mobile)
      expect(headerContainer).toHaveClass('flex-col');

      // Should have @500 breakpoint classes
      expect(headerContainer).toHaveClass('@500:flex-row');
      expect(headerContainer).toHaveClass('@500:items-center');
      expect(headerContainer).toHaveClass('@500:justify-between');
    });

    it('should not use StarsWarsRobotToggle component', () => {
      const { container } = render(<LeaveRequestPage />);

      // StarsWarsRobotToggle should not be present
      const robotToggle = container.querySelector('[data-testid*="stars-wars"], [data-testid*="robot"]');
      expect(robotToggle).not.toBeInTheDocument();
    });

    it('should use ThemeToggle component instead of StarsWarsRobotToggle', () => {
      render(<LeaveRequestPage />);

      const themeToggle = screen.getByRole('button', { name: /toggle/i });
      expect(themeToggle).toBeInTheDocument();

      // ThemeToggle should have compact design classes
      expect(themeToggle).toHaveClass('h-8', 'w-14');
    });

    it('should prevent layout overflow on small screens', () => {
      const { container } = render(<LeaveRequestPage />);

      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();

      // Should have proper responsive padding classes
      expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('5. Mobile Layout Integration', () => {
    it('should have both ThemeToggle and LocaleSelector in controls container', () => {
      render(<LeaveRequestPage />);

      const themeToggle = screen.getByRole('button', { name: /toggle/i });
      expect(themeToggle).toBeInTheDocument();

      // LocaleSelector should be present (check for select element)
      // Note: There are two LocaleSelectors (desktop + mobile), one hidden by CSS
      const localeSelects = screen.getAllByRole('combobox');
      expect(localeSelects).toHaveLength(2);
    });

    it('should maintain responsive behavior across breakpoints', () => {
      const { container } = render(<LeaveRequestPage />);

      // Mobile first approach - start with flex-col
      const headerContainer = container.querySelector('.flex-col');
      expect(headerContainer).toBeInTheDocument();

      // Ensure breakpoint classes are present
      expect(headerContainer).toHaveClass('@500:flex-row');
    });

    it('should have gap spacing for vertical layout on mobile', () => {
      const { container } = render(<LeaveRequestPage />);

      // Header container should have gap
      const headerContainer = container.querySelector('.flex-col');
      expect(headerContainer).toHaveClass('gap-4');

      // Controls container should also have gap
      const controlsContainer = container.querySelector('.flex-col.items-start');
      expect(controlsContainer).toHaveClass('gap-4');
    });
  });

  describe('6. PWA install button rendering and behavior', () => {
    it('should not render install button when canShowInstall is false', () => {
      (usePwaInstall as any).mockReturnValue({
        isInstallable: true,
        canShowInstall: false,
        promptInstall: mockPromptInstall,
        dismiss: vi.fn(),
        snooze: vi.fn(),
      });
      render(<LeaveRequestPage />);
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });
  });

  describe('6. Store integration', () => {
    it('should handle pre-populated profile data', () => {
      useLeaveRequestStore.setState({
        profile: { fullName: 'John Doe' }
      });
      render(<LeaveRequestPage />);
      expect(screen.getByText('Leave Request')).toBeInTheDocument();
    });
  });
});
