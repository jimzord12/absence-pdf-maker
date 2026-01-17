import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { ReviewAndGenerate } from './ReviewAndGenerate';
import { renderWithI18n } from '../../../../test-utils';

// Mock persistence services
const mockExportProfileToJson = vi.fn();
const mockImportProfileFromJson = vi.fn();

vi.mock('../../services/persistence', () => ({
  exportProfileToJson: () => mockExportProfileToJson(),
  importProfileFromJson: (file: File) => mockImportProfileFromJson(file),
}));

// Mock PDF service
const mockDownloadLeaveRequestPdf = vi.fn();
vi.mock('../../services/pdf/pdf.service', () => ({
  downloadLeaveRequestPdf: (...args: any[]) => mockDownloadLeaveRequestPdf(...args),
}));

// Mock calculateAbsenceDays function
const mockCalculateAbsenceDays = vi.fn();
vi.mock('../../services/absenceDays', () => ({
  calculateAbsenceDays: (...args: any[]) => mockCalculateAbsenceDays(...args),
}));

// Mock toast functions
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowWarning = vi.fn();
vi.mock('../../../../shared/lib/toast', () => ({
  showSuccess: (...args: any[]) => mockShowSuccess(...args),
  showError: (...args: any[]) => mockShowError(...args),
  showWarning: (...args: any[]) => mockShowWarning(...args),
}));

// Reset mocks before each test
beforeEach(() => {
  mockExportProfileToJson.mockReset();
  mockImportProfileFromJson.mockReset();
  mockCalculateAbsenceDays.mockReset();
  mockDownloadLeaveRequestPdf.mockReset();
  mockShowSuccess.mockReset();
  mockShowError.mockReset();

  // Reset store state before each test
  useLeaveRequestStore.setState({
    profile: {
      fullName: '',
      fathersName: '',
      email: '',
      phone: '',
      identityNumber: '',
      employeeId: '',
      department: '',
      position: '',
    },
    leaveDraft: {
      leaveType: undefined,
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

  // Set default mock behaviors
  mockExportProfileToJson.mockResolvedValue(undefined);
  mockImportProfileFromJson.mockResolvedValue(undefined);
  mockDownloadLeaveRequestPdf.mockResolvedValue(undefined);
  mockCalculateAbsenceDays.mockReturnValue(null);
});

afterEach(() => {
  // Clean up after each test
  useLeaveRequestStore.setState({
    profile: {},
    leaveDraft: {},
    signature: { signatureDataUrl: '' },
    holidays: { holidaySet: new Set() },
    ui: {
      isSignatureModalOpen: false,
      isGeneratingPdf: false,
      lastGeneratedFileName: '',
      errorMessage: null,
      triggerValidation: null,
      forceFormReset: false,
    },
  });
});

describe('ReviewAndGenerate', () => {
  describe('1. Component renders correctly', () => {
    it('should render all sections', async () => {
      renderWithI18n(<ReviewAndGenerate />);

      // Check Personal Details Summary Section
      expect(await screen.findByText(/Personal Details Summary/i)).toBeInTheDocument();

      // Check Leave Details Summary Section
      expect(screen.getByText(/Leave Details Summary/i)).toBeInTheDocument();

      // Check Actions Section
      expect(screen.getByText(/Actions/i)).toBeInTheDocument();

      // Check buttons
      expect(screen.getByRole('button', { name: /Export Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Import Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Clear Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate PDF/i })).toBeInTheDocument();
    });

    it('should render file input hidden', () => {
      renderWithI18n(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should render with empty data placeholders', () => {
      renderWithI18n(<ReviewAndGenerate />);

      // All profile fields should show '—' when empty
      expect(screen.getByText(/Full Name/i).parentElement?.textContent).toContain('—');
      expect(screen.getByText(/Email/i).parentElement?.textContent).toContain('—');
    });
  });

  describe('2. Profile summary displays all fields', () => {
    it('should display full name', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'John Doe',
            fathersName: 'Father Doe',
            email: '',
            phone: '',
            employeeId: '',
            department: '',
            position: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/^Full Name$/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display email', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: '',
            email: 'john@example.com',
            phone: '',
            employeeId: '',
            department: '',
            position: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/^Email$/i)).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should display phone', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: '',
            email: '',
            phone: '123-456-7890',
            identityNumber: 'AB123456',
            employeeId: '',
            department: '',
            position: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/^Phone$/i)).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });
  });

  describe('3. Leave details summary displays all information', () => {
    it('should display leave type', () => {
      act(() => {
        useLeaveRequestStore.setState({
          leaveDraft: {
            leaveType: 'annual',
            startDate: null,
            endDate: null,
            reason: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getAllByText(/Leave Type/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
    });

    it('should display leave type for all types', () => {
      const leaveTypes = [
        { type: 'annual' as const, label: 'Annual Leave' },
        { type: 'sick' as const, label: 'Sick Leave' },
        { type: 'unpaid' as const, label: 'Unpaid Leave' },
        { type: 'other' as const, label: 'Other' },
      ];

      leaveTypes.forEach(({ type, label }) => {
        act(() => {
          useLeaveRequestStore.setState({
            leaveDraft: {
              leaveType: type,
              startDate: null,
              endDate: null,
              reason: '',
            },
          });
        });

        const { unmount } = renderWithI18n(<ReviewAndGenerate />);
        expect(screen.getAllByText(/Leave Type/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    it('should display start date', () => {
      const startDate = new Date('2025-12-01');
      act(() => {
        useLeaveRequestStore.setState({
          leaveDraft: {
            leaveType: undefined,
            startDate,
            endDate: null,
            reason: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByText('2025-12-01')).toBeInTheDocument();
    });

    it('should display end date', () => {
      const endDate = new Date('2025-12-05');
      act(() => {
        useLeaveRequestStore.setState({
          leaveDraft: {
            leaveType: undefined,
            startDate: null,
            endDate,
            reason: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByText('2025-12-05')).toBeInTheDocument();
    });

    it('should display reason', () => {
      act(() => {
        useLeaveRequestStore.setState({
          leaveDraft: {
            leaveType: undefined,
            startDate: null,
            endDate: null,
            reason: 'Medical appointment',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/Reason/i)).toBeInTheDocument();
      expect(screen.getByText('Medical appointment')).toBeInTheDocument();
    });

    it('should display signature status as signed', () => {
      act(() => {
        useLeaveRequestStore.setState({
          signature: {
            signatureDataUrl: 'data:image/png;base64,test-signature',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/^Signature$/i)).toBeInTheDocument();
      expect(screen.getByText('✓ Signed')).toBeInTheDocument();
      expect(screen.getByText('✓ Signed')).toHaveClass('text-[color:var(--color-success)]');
    });

    it('should display signature status as not signed', () => {
      act(() => {
        useLeaveRequestStore.setState({
          signature: {
            signatureDataUrl: '',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      expect(screen.getByText(/^Signature$/i)).toBeInTheDocument();
      expect(screen.getByText('✗ Not signed')).toBeInTheDocument();
      expect(screen.getByText('✗ Not signed')).toHaveClass('text-[color:var(--color-error)]');
    });
  });

  describe('4. Export profile button triggers download', () => {
    it('should call exportProfileToJson when Export Profile button is clicked', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: /Export Profile/i });
      await user.click(exportButton);

      expect(mockExportProfileToJson).toHaveBeenCalledTimes(1);
    });

    it('should show success message when export succeeds', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockResolvedValue(undefined);

      renderWithI18n(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: /Export Profile/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith('Profile exported successfully!');
      });
    });
  });

  describe('5. Import profile button handles file upload', () => {
    it('should call importProfileFromJson when file is selected', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockResolvedValue(undefined);

      renderWithI18n(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['{"profile":{}}'], 'profile.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      expect(mockImportProfileFromJson).toHaveBeenCalledWith(file);
    });

    it('should show success message when import succeeds', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockResolvedValue(undefined);

      renderWithI18n(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['{"profile":{}}'], 'profile.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith('Profile imported successfully!');
      });
    });
  });

  describe('6. Clear profile button removes stored data', () => {
    it('should clear profile when Clear Profile button is clicked', async () => {
      const user = userEvent.setup();

      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'John Doe',
            fathersName: 'Father Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            identityNumber: 'AB123456',
            employeeId: 'EMP001',
            department: 'Engineering',
            position: 'Developer',
            companyName: 'Acme Corp',
          },
          signature: {
            signatureDataUrl: 'data:image/png;base64,test',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      const clearButton = screen.getByRole('button', { name: /Clear Profile/i });
      await user.click(clearButton);

      const store = useLeaveRequestStore.getState();
      expect(store.profile.fullName).toBe('');
      expect(store.signature.signatureDataUrl).toBe('');
    });
  });

  describe('7. Generate PDF button triggers generation', () => {
    it('should be enabled when required fields are present', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'John Doe',
            fathersName: 'Father Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            identityNumber: 'AB123456',
            employeeId: 'EMP001',
            department: 'Engineering',
            position: 'Developer',
            companyName: 'Acme Corp',
          },
          leaveDraft: {
            leaveType: 'annual',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-05'),
            reason: 'Vacation',
          },
          signature: {
            signatureDataUrl: 'data:image/png;base64,test',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: /Generate PDF/i });
      expect(generateButton).not.toBeDisabled();
    });

    it('should set isGeneratingPdf to true when generation starts', async () => {
      const user = userEvent.setup();

      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'John Doe',
            fathersName: 'Father Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            identityNumber: 'AB123456',
            employeeId: 'EMP001',
            department: 'Engineering',
            position: 'Developer',
            companyName: 'Acme Corp',
          },
          leaveDraft: {
            leaveType: 'annual',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-05'),
            reason: 'Vacation',
          },
          signature: {
            signatureDataUrl: 'data:image/png;base64,test',
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: /Generate PDF/i });
      await user.click(generateButton);

      await waitFor(() => {
        const store = useLeaveRequestStore.getState();
        expect(store.ui.isGeneratingPdf).toBe(true);
      });
    });
  });

  describe('8. Loading spinner shown during generation', () => {
    it('should show loading state when isGeneratingPdf is true', () => {
      act(() => {
        useLeaveRequestStore.setState({
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: true,
            lastGeneratedFileName: '',
            errorMessage: null,
            triggerValidation: null,
            forceFormReset: false,
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      const loadingMessages = screen.getAllByText(/Please wait while we generate your PDF document\.\.\./i);
      expect(loadingMessages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('10. Success message handling', () => {
    it('should display success message for PDF generation', async () => {
      const user = userEvent.setup();

      await act(async () => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'John Doe',
            fathersName: 'Father Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            identityNumber: 'AB123456',
            employeeId: 'EMP001',
            department: 'Engineering',
            position: 'Developer',
            companyName: 'Acme Corp',
          },
          leaveDraft: {
            leaveType: 'annual',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-05'),
            reason: 'Vacation',
          },
          signature: {
            signatureDataUrl: 'data:image/png;base64,test',
          },
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: false,
            lastGeneratedFileName: '',
            errorMessage: null,
            triggerValidation: null,
            forceFormReset: false,
          }
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: /Generate PDF/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(mockShowSuccess).toHaveBeenCalledWith('PDF generated successfully!');
        },
        { timeout: 6000 }
      );
    });
  });

  describe('11. Leave allowance decrement on generation', () => {
    it('should decrement leave allowance after successful PDF generation', async () => {
      const user = userEvent.setup();
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 14,
        weekendDays: 4,
        holidayDays: 2,
        absenceDays: 8,
      });

      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'John Doe',
            fathersName: 'Father Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            identityNumber: 'AB123456',
            employeeId: 'EMP001',
            department: 'Engineering',
            position: 'Developer',
            companyName: 'Acme Corp',
          },
          leaveDraft: {
            leaveType: 'annual',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-14'),
            reason: 'Vacation',
            leaveAllowance: 10,
          },
          signature: {
            signatureDataUrl: 'data:image/png;base64,test',
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
      });

      renderWithI18n(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: /Generate PDF/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          const store = useLeaveRequestStore.getState();
          expect(store.leaveDraft.leaveAllowance).toBe(2);
        },
        { timeout: 6000 }
      );
    });
  });

  describe('Error messages from store', () => {
    it('should display errorMessage from store', () => {
      act(() => {
        useLeaveRequestStore.setState({
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: false,
            lastGeneratedFileName: '',
            errorMessage: 'Test error',
            triggerValidation: null,
            forceFormReset: false,
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      const store = useLeaveRequestStore.getState();
      expect(store.ui.errorMessage).toBe('Test error');
    });
  });

  describe('Edge cases and integration', () => {
    it('should call calculateAbsenceDays when dates are set', async () => {
      mockCalculateAbsenceDays.mockClear();

      await act(async () => {
        useLeaveRequestStore.setState({
          leaveDraft: {
            leaveType: undefined,
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-05'),
            reason: '',
          },
          holidays: {
            holidaySet: new Set(['2025-12-25']),
          },
        });
      });

      renderWithI18n(<ReviewAndGenerate />);

      await waitFor(() => {
        expect(mockCalculateAbsenceDays).toHaveBeenCalled();
      });

      const calls = mockCalculateAbsenceDays.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBeInstanceOf(Date);
      expect(lastCall[1]).toBeInstanceOf(Date);
      expect(lastCall[2]).toBeInstanceOf(Set);
    });
  });
});
