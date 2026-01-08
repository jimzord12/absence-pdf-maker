import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePwaInstall } from '../../../../app/providers/usePwaInstall';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { LeaveRequestPage } from './LeaveRequestPage';

// Mock the holidays service
const mockHolidaySet = new Set<string>(['2025-01-01', '2025-12-25', '2025-07-04']);

vi.mock('../../services/holidays/holidays.service', () => ({
  loadHolidays: () => mockHolidaySet,
}));

// Mock the usePwaInstall hook
const mockPromptInstall = vi.fn().mockResolvedValue('accepted');

vi.mock('../../../../app/providers/usePwaInstall', () => ({
  usePwaInstall: vi.fn(() => ({
    isInstallable: false,
    promptInstall: mockPromptInstall,
  })),
}));

// Mock the child components
vi.mock('../components/LeaveRequestForm', () => ({
  LeaveRequestForm: () => <div data-testid="leave-request-form">Leave Request Form</div>,
}));

vi.mock('../components/ReviewAndGenerate', () => ({
  ReviewAndGenerate: () => <div data-testid="review-and-generate">Review and Generate</div>,
}));

describe('LeaveRequestPage', () => {
  // Reset store before each test
  beforeEach(() => {
    localStorage.clear();
    useLeaveRequestStore.setState({
      profile: {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
      },
      leaveDraft: {
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
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
    });
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

      // Check that holidays are stored in the store (indirectly verifying loadHolidays was called)
      const store = useLeaveRequestStore.getState();
      expect(store.holidays.holidaySet).toEqual(mockHolidaySet);
    });

    it('should store holidays in the Zustand store', () => {
      render(<LeaveRequestPage />);

      // Check that holidays are stored in the store
      const store = useLeaveRequestStore.getState();
      expect(store.holidays.holidaySet).toEqual(mockHolidaySet);
    });

    it('should load holidays on mount and verify store integration', () => {
      render(<LeaveRequestPage />);

      const store = useLeaveRequestStore.getState();
      expect(store.holidays.holidaySet.size).toBeGreaterThan(0);
    });
  });

  describe('3. Header displays correct title and description', () => {
    it('should render page title', () => {
      render(<LeaveRequestPage />);

      const title = screen.getByText('Αίτηση Άδειας');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');
    });

    it('should render the page description', () => {
      render(<LeaveRequestPage />);

      const description = screen.getByText('Υποβάλετε την αίτησή σας για άδεια και δημιουργήστε ένα έγγραφο PDF');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
    });

    it('should apply correct title styling', () => {
      render(<LeaveRequestPage />);

      const title = screen.getByText('Αίτηση Άδειας');
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('should apply correct description styling', () => {
      render(<LeaveRequestPage />);

      const description = screen.getByText('Υποβάλετε την αίτησή σας για άδεια και δημιουργήστε ένα έγγραφο PDF');
      expect(description).toHaveClass('mt-2', 'text-sm');
    });

    it('should render header section with proper spacing', () => {
      const { container } = render(<LeaveRequestPage />);

      const headerSection = container.querySelector('.mb-8');
      expect(headerSection).toBeInTheDocument();
    });
  });

  describe('4. LeaveRequestForm component is rendered', () => {
    it('should render the LeaveRequestForm component', () => {
      render(<LeaveRequestPage />);

      const leaveRequestForm = screen.getByTestId('leave-request-form');
      expect(leaveRequestForm).toBeInTheDocument();
    });

    it('should render LeaveRequestForm in the first grid column', () => {
      render(<LeaveRequestPage />);

      const formElement = screen.getByTestId('leave-request-form');
      const formContainer = formElement.parentElement;
      expect(formContainer).toHaveClass('lg:col-span-2');
    });
  });

  describe('5. ReviewAndGenerate component is rendered', () => {
    it('should render the ReviewAndGenerate component', () => {
      render(<LeaveRequestPage />);

      const reviewAndGenerate = screen.getByTestId('review-and-generate');
      expect(reviewAndGenerate).toBeInTheDocument();
    });

    it('should render ReviewAndGenerate in the second grid column', () => {
      render(<LeaveRequestPage />);

      const reviewElement = screen.getByTestId('review-and-generate');
      const reviewContainer = reviewElement.parentElement;
      expect(reviewContainer).toHaveClass('lg:col-span-1');
    });
  });

  describe('6. Responsive layout classes are applied', () => {
    it('should apply gradient background to page container', () => {
      const { container } = render(<LeaveRequestPage />);

      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-gray-50', 'to-gray-100');
    });

    it('should apply padding classes to page container', () => {
      const { container } = render(<LeaveRequestPage />);

      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('py-8', 'px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should apply max-width and centering to content container', () => {
      const { container } = render(<LeaveRequestPage />);

      const contentContainer = container.querySelector('.max-w-7xl');
      expect(contentContainer).toHaveClass('mx-auto');
    });

    it('should use responsive grid layout', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-3', 'gap-6');
    });

    it('should have single-column layout on mobile', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      // grid-cols-1 means single column on mobile
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    it('should have multi-column layout on desktop', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      // lg:grid-cols-3 means three columns on large screens and up
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should apply gap between grid items', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-6');
    });
  });

  describe('7. Store integration for loading holidays', () => {
    it('should call setHolidays action with loaded holiday set', () => {
      render(<LeaveRequestPage />);

      // Get the current state from the store
      const store = useLeaveRequestStore.getState();

      // Verify that holidays were set in the store
      expect(store.holidays.holidaySet.size).toBeGreaterThan(0);
    });

    it('should persist loaded holidays in store across renders', () => {
      render(<LeaveRequestPage />);

      const store = useLeaveRequestStore.getState();
      const holidaysAfterFirstRender = store.holidays.holidaySet;

      // Re-render the component
      render(<LeaveRequestPage />);

      const storeAfterRerender = useLeaveRequestStore.getState();
      const holidaysAfterRerender = storeAfterRerender.holidays.holidaySet;

      // Holidays should still be present
      expect(holidaysAfterRerender).toEqual(holidaysAfterFirstRender);
    });

    it('should update store holidays when component mounts', () => {
      // Clear store first
      useLeaveRequestStore.setState({
        holidays: {
          holidaySet: new Set<string>(),
        },
      });

      render(<LeaveRequestPage />);

      const store = useLeaveRequestStore.getState();
      expect(store.holidays.holidaySet.size).toBeGreaterThan(0);
      expect(store.holidays.holidaySet).toEqual(mockHolidaySet);
    });
  });

  describe('8. Component structure and hierarchy', () => {
    it('should render page header before content', () => {
      const { container } = render(<LeaveRequestPage />);

      const headerSection = container.querySelector('.mb-8');
      const gridSection = container.querySelector('.grid');

      // Both should be in the document
      expect(headerSection).toBeInTheDocument();
      expect(gridSection).toBeInTheDocument();

      // Header should come before grid
      const headerElement = headerSection?.parentElement;
      expect(headerElement?.children[0]).toBe(headerSection);
    });

    it('should render both child components within the grid', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      const leaveRequestForm = screen.getByTestId('leave-request-form');
      const reviewAndGenerate = screen.getByTestId('review-and-generate');

      // Both components should be within the grid
      expect(gridContainer).toContainElement(
        leaveRequestForm.parentElement?.parentElement as HTMLElement
      );
      expect(gridContainer).toContainElement(
        reviewAndGenerate.parentElement?.parentElement as HTMLElement
      );
    });
  });

  describe('9. Acceptance criteria verification', () => {
    it('should satisfy: Holidays loaded from service on page mount', () => {
      render(<LeaveRequestPage />);

      const store = useLeaveRequestStore.getState();
      expect(store.holidays.holidaySet.size).toBeGreaterThan(0);
      expect(store.holidays.holidaySet).toEqual(mockHolidaySet);
    });

    it('should satisfy: Page includes header with app title', () => {
      render(<LeaveRequestPage />);

      const title = screen.getByText('Αίτηση Άδειας');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');
    });

    it('should satisfy: Form rendered within page layout', () => {
      render(<LeaveRequestPage />);

      const leaveRequestForm = screen.getByTestId('leave-request-form');
      expect(leaveRequestForm).toBeInTheDocument();
    });

    it('should satisfy: Page styled with max-width and centering', () => {
      const { container } = render(<LeaveRequestPage />);

      const contentContainer = container.querySelector('.max-w-7xl');
      expect(contentContainer).toHaveClass('mx-auto', 'max-w-7xl');
    });

    it('should satisfy: Responsive single-column on mobile', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    it('should satisfy: Responsive multi-column on desktop', () => {
      const { container } = render(<LeaveRequestPage />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should satisfy: Review and generate section included', () => {
      render(<LeaveRequestPage />);

      const reviewAndGenerate = screen.getByTestId('review-and-generate');
      expect(reviewAndGenerate).toBeInTheDocument();
    });
  });

  describe('10. PWA install button rendering and behavior', () => {
    it('should not render install button when isInstallable is false', () => {
      render(<LeaveRequestPage />);

      const installButton = screen.queryByText('Εγκατάσταση Εφαρμογής');
      expect(installButton).not.toBeInTheDocument();
    });

    it('should render install button when isInstallable is true', () => {
      // Dynamically change the mock for this test
      vi.mocked(usePwaInstall).mockReturnValue({
        isInstallable: true,
        promptInstall: mockPromptInstall,
      });

      render(<LeaveRequestPage />);

      const installButton = screen.queryByText('Εγκατάσταση Εφαρμογής');
      expect(installButton).toBeInTheDocument();
    });

    it('should call promptInstall when install button is clicked', () => {
      vi.mocked(usePwaInstall).mockReturnValue({
        isInstallable: true,
        promptInstall: mockPromptInstall,
      });

      render(<LeaveRequestPage />);

      const installButton = screen.getByText('Εγκατάσταση Εφαρμογής');
      installButton.click();

      expect(mockPromptInstall).toHaveBeenCalledTimes(1);
    });

    it('should integrate usePwaInstall hook', () => {
      // This test verifies that the usePwaInstall hook is called
      // The mock is set up at the top of the file to return isInstallable: false
      render(<LeaveRequestPage />);

      // Component should render without errors
      expect(screen.getByText('Αίτηση Άδειας')).toBeInTheDocument();
      // Install button should not be shown (since isInstallable is false)
      expect(screen.queryByText('Εγκατάσταση Εφαρμογής')).not.toBeInTheDocument();
    });
  });

  describe('11. Edge cases and error handling', () => {
    it('should handle render when store has pre-existing holidays', () => {
      // Pre-populate store with holidays
      useLeaveRequestStore.setState({
        holidays: {
          holidaySet: new Set<string>(['2025-01-01', '2025-02-14']),
        },
      });

      render(<LeaveRequestPage />);

      // Component should still render without errors
      expect(screen.getByText('Αίτηση Άδειας')).toBeInTheDocument();
    });

    it('should handle store with profile data', () => {
      // Pre-populate store with profile data
      useLeaveRequestStore.setState({
        profile: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          employeeId: 'EMP001',
          department: 'Engineering',
          position: 'Developer',
        },
      });

      render(<LeaveRequestPage />);

      // Component should still render without errors
      expect(screen.getByText('Αίτηση Άδειας')).toBeInTheDocument();
    });

    it('should handle store with error message', () => {
      // Pre-populate store with error message
      useLeaveRequestStore.setState({
        ui: {
          isSignatureModalOpen: false,
          isGeneratingPdf: false,
          lastGeneratedFileName: '',
          errorMessage: 'Test error message',
          triggerValidation: null,
      forceFormReset: false,
        },
      });

      render(<LeaveRequestPage />);

      // Component should still render without errors
      expect(screen.getByText('Αίτηση Άδειας')).toBeInTheDocument();
    });
  });
});

