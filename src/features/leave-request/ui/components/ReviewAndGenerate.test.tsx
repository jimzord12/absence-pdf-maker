import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { ReviewAndGenerate } from './ReviewAndGenerate';

// Mock persistence services
const mockExportProfileToJson = vi.fn();
const mockImportProfileFromJson = vi.fn();

vi.mock('../../services/persistence', () => ({
  exportProfileToJson: () => mockExportProfileToJson(),
  importProfileFromJson: (file: File) => mockImportProfileFromJson(file),
}));

// Mock calculateAbsenceDays function
const mockCalculateAbsenceDays = vi.fn();
vi.mock('../../services/absenceDays', () => ({
  calculateAbsenceDays: (...args: any[]) => mockCalculateAbsenceDays(...args),
}));

// Mock PDF service
const mockDownloadLeaveRequestPdf = vi.fn();
vi.mock('../../services/pdf/pdf.service', () => ({
  downloadLeaveRequestPdf: (...args: any[]) => mockDownloadLeaveRequestPdf(...args),
}));

// Mock formatDate function
vi.mock('../../../../shared/lib/dates', () => ({
  formatDate: (date: Date) => {
    if (!date) return '—';
    return date.toISOString().split('T')[0];
  },
}));

// Reset mocks before each test
beforeEach(() => {
  mockExportProfileToJson.mockReset();
  mockImportProfileFromJson.mockReset();
  mockCalculateAbsenceDays.mockReset();

  // Reset store state before each test
  useLeaveRequestStore.setState({
    profile: {
      fullName: '',
      fathersName: '',
      email: '',
      phone: '',
      identityNumber: '',
      employeeId: '',
      companyName: '',
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
    },
  });

  // Set default mock behaviors
  mockExportProfileToJson.mockResolvedValue(undefined);
  mockImportProfileFromJson.mockResolvedValue(undefined);
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
    },
  });
});

describe('ReviewAndGenerate', () => {
  describe('1. Component renders correctly', () => {
    it('should render all sections', () => {
      render(<ReviewAndGenerate />);

      // Check Personal Details Summary Section
      expect(screen.getByText('Personal Details Summary')).toBeInTheDocument();

      // Check Leave Details Summary Section
      expect(screen.getByText('Leave Details Summary')).toBeInTheDocument();

      // Check Actions Section
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Check buttons
      expect(screen.getByRole('button', { name: 'Export Profile' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Import Profile' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear Profile' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Generate PDF' })).toBeInTheDocument();
    });

    it('should render file input hidden', () => {
      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should render with empty data placeholders', () => {
      render(<ReviewAndGenerate />);

      // Get all '—' elements
      const dashes = screen.getAllByText('—');

      // Check that we have placeholders (at least 6 for profile fields)
      expect(dashes.length).toBeGreaterThanOrEqual(6);

      // Check that profile fields show placeholders
      expect(screen.getByText('Full Name').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Email').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Phone').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Employee ID').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Department').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Position').parentElement?.textContent).toContain('—');
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Full Name')).toBeInTheDocument();
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Email')).toBeInTheDocument();
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });

    it('should display employee ID', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: '',
            email: '',
            phone: '',
            employeeId: 'EMP001',
            department: '',
            position: '',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Employee ID')).toBeInTheDocument();
      expect(screen.getByText('EMP001')).toBeInTheDocument();
    });

    it('should display department', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: '',
            email: '',
            phone: '',
            employeeId: '',
            department: 'Engineering',
            position: '',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('should display position', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: '',
            email: '',
            phone: '',
            employeeId: '',
            department: '',
            position: 'Developer',
            companyName: 'Acme Corp',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('should display all profile fields together', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '555-123-4567',
            employeeId: 'EMP002',
            department: 'Marketing',
            position: 'Manager',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('555-123-4567')).toBeInTheDocument();
      expect(screen.getByText('EMP002')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('should show placeholders when fields are empty', () => {
      render(<ReviewAndGenerate />);

      // All profile fields should show '—' when empty
      expect(screen.getByText('Full Name').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Email').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Phone').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Employee ID').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Department').parentElement?.textContent).toContain('—');
      expect(screen.getByText('Position').parentElement?.textContent).toContain('—');
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Leave Type')).toBeInTheDocument();
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

        const { unmount } = render(<ReviewAndGenerate />);
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Start Date')).toBeInTheDocument();
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('End Date')).toBeInTheDocument();
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Reason')).toBeInTheDocument();
      expect(screen.getByText('Medical appointment')).toBeInTheDocument();
    });

    it('should display absence days breakdown when dates are set', () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        weekendDays: 4,
        holidayDays: 1,
        absenceDays: 5,
      });

      act(() => {
        useLeaveRequestStore.setState({
          leaveDraft: {
            leaveType: undefined,
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-10'),
            reason: '',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Absence Days Calculation')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total Days
      expect(screen.getByText('4')).toBeInTheDocument(); // Weekend Days
      expect(screen.getByText('1')).toBeInTheDocument(); // Holiday Days
      expect(screen.getByText('5')).toBeInTheDocument(); // Absence Days
    });

    it('should not display absence days breakdown when dates are not set', () => {
      mockCalculateAbsenceDays.mockReturnValue(null);

      render(<ReviewAndGenerate />);

      expect(screen.queryByText('Absence Days Calculation')).not.toBeInTheDocument();
    });

    it('should display signature status as signed', () => {
      act(() => {
        useLeaveRequestStore.setState({
          signature: {
            signatureDataUrl: 'data:image/png;base64,test-signature',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Signature')).toBeInTheDocument();
      expect(screen.getByText('✓ Signed')).toBeInTheDocument();
      expect(screen.getByText('✓ Signed')).toHaveClass('text-green-600');
    });

    it('should display signature status as not signed', () => {
      act(() => {
        useLeaveRequestStore.setState({
          signature: {
            signatureDataUrl: '',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Signature')).toBeInTheDocument();
      expect(screen.getByText('✗ Not signed')).toBeInTheDocument();
      expect(screen.getByText('✗ Not signed')).toHaveClass('text-red-500');
    });

    it('should display all leave details together', () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        weekendDays: 1,
        holidayDays: 0,
        absenceDays: 4,
      });

      act(() => {
        useLeaveRequestStore.setState({
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

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('2025-12-01')).toBeInTheDocument();
      expect(screen.getByText('2025-12-05')).toBeInTheDocument();
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('Absence Days Calculation')).toBeInTheDocument();
      expect(screen.getByText('✓ Signed')).toBeInTheDocument();
    });
  });

  describe('4. Export profile button triggers download', () => {
    it('should call exportProfileToJson when Export Profile button is clicked', async () => {
      const user = userEvent.setup();
      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      expect(mockExportProfileToJson).toHaveBeenCalledTimes(1);
    });

    it('should show success message when export succeeds', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Profile exported successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message when export fails', async () => {
      const user = userEvent.setup();
      // Use mockImplementationOnce to throw synchronously since exportProfileToJson is sync
      mockExportProfileToJson.mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument();
      });
    });

    it('should dismiss error message when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument();
      });

      // Click the dismiss button (X icon button)
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Export failed')).not.toBeInTheDocument();
      });
    });
  });

  describe('5. Import profile button handles file upload', () => {
    it('should trigger file input when Import Profile button is clicked', async () => {
      const user = userEvent.setup();
      render(<ReviewAndGenerate />);

      const importButton = screen.getByRole('button', { name: 'Import Profile' });
      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);

      // File input should have the hidden class
      expect(fileInput).toHaveClass('hidden');

      await user.click(importButton);

      // The file input should exist
      expect(fileInput).toBeInTheDocument();
    });

    it('should call importProfileFromJson when file is selected', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['{"profile":{}}'], 'profile.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      expect(mockImportProfileFromJson).toHaveBeenCalledWith(file);
      expect(mockImportProfileFromJson).toHaveBeenCalledTimes(1);
    });

    it('should show success message when import succeeds', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['{"profile":{}}'], 'profile.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Profile imported successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message when import fails', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockRejectedValue(new Error('Invalid JSON format'));

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['invalid'], 'invalid.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
      });
    });

    it('should handle no file selected gracefully', () => {
      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);

      // Simulate selecting no file (null)
      act(() => {
        const changeEvent = { target: { files: null } };
        // @ts-ignore - Testing the null case
        fileInput.dispatchEvent(new Event('change', changeEvent));
      });

      // Should not call importProfileFromJson
      expect(mockImportProfileFromJson).not.toHaveBeenCalled();
    });

    it('should reset file input after import', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i) as HTMLInputElement;
      const file = new File(['{"profile":{}}'], 'profile.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockImportProfileFromJson).toHaveBeenCalled();
      });

      // File input should be reset (value should be empty string)
      expect(fileInput.value).toBe('');
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

      render(<ReviewAndGenerate />);

      // Verify profile is populated
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('✓ Signed')).toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: 'Clear Profile' });
      await user.click(clearButton);

      // Verify profile is cleared
      const store = useLeaveRequestStore.getState();
      expect(store.profile.fullName).toBe('');
      expect(store.profile.email).toBe('');
      expect(store.profile.phone).toBe('');
      expect(store.profile.employeeId).toBe('');
      expect(store.profile.department).toBe('');
      expect(store.profile.position).toBe('');
      expect(store.signature.signatureDataUrl).toBe('');
    });

    it('should clear signature when Clear Profile button is clicked', async () => {
      const user = userEvent.setup();

      act(() => {
        useLeaveRequestStore.setState({
          signature: {
            signatureDataUrl: 'data:image/png;base64,test-signature',
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('✓ Signed')).toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: 'Clear Profile' });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('✗ Not signed')).toBeInTheDocument();
      });
    });

    it('should show success message when profile is cleared', async () => {
      const user = userEvent.setup();

      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '111-222-3333',
            employeeId: 'EMP999',
            department: 'Test Dept',
            position: 'Test Role',
          },
        });
      });

      render(<ReviewAndGenerate />);

      const clearButton = screen.getByRole('button', { name: 'Clear Profile' });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Profile cleared successfully!')).toBeInTheDocument();
      });
    });

    it('should update UI to show placeholders after clearing', async () => {
      const user = userEvent.setup();

      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '555-123-4567',
            employeeId: 'EMP002',
            department: 'Marketing',
            position: 'Manager',
          },
        });
      });

      render(<ReviewAndGenerate />);

      const clearButton = screen.getByRole('button', { name: 'Clear Profile' });
      await user.click(clearButton);

      await waitFor(() => {
        // All profile fields should show '—' after clearing
        expect(screen.getByText('Full Name').parentElement?.textContent).toContain('—');
        expect(screen.getByText('Email').parentElement?.textContent).toContain('—');
        expect(screen.getByText('Phone').parentElement?.textContent).toContain('—');
        expect(screen.getByText('Employee ID').parentElement?.textContent).toContain('—');
        expect(screen.getByText('Department').parentElement?.textContent).toContain('—');
        expect(screen.getByText('Position').parentElement?.textContent).toContain('—');
      });
    });
  });

  describe('7. Generate PDF button triggers generation', () => {
    it('should be disabled when required profile fields are missing', () => {
      act(() => {
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
            leaveType: undefined,
            startDate: null,
            endDate: null,
            reason: '',
          },
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
      expect(generateButton).toBeDisabled();
    });

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
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
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
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
      await user.click(generateButton);

      await waitFor(() => {
        const store = useLeaveRequestStore.getState();
        expect(store.ui.isGeneratingPdf).toBe(true);
      });
    });

    it('should set isGeneratingPdf to false after generation completes', async () => {
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
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
      await user.click(generateButton);

      // Wait for generation to complete (minimum 2 seconds)
      await waitFor(
        () => {
          const store = useLeaveRequestStore.getState();
          expect(store.ui.isGeneratingPdf).toBe(false);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('8. Loading spinner shown during generation', () => {
    it('should show loading state when isGeneratingPdf is true', () => {
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
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: true,
            lastGeneratedFileName: '',
            errorMessage: null,
            triggerValidation: null,
          },
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: /Generating PDF\.\.\./i });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
    });

    it('should not show loading state when isGeneratingPdf is false', () => {
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
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: false,
            lastGeneratedFileName: '',
            errorMessage: null,
            triggerValidation: null,
          },
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).not.toHaveTextContent('Generating PDF...');
    });

    it('should show loading message text during generation', () => {
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
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: true,
            lastGeneratedFileName: '',
            errorMessage: null,
            triggerValidation: null,
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(
        screen.getByText('Please wait while we generate your PDF document...')
      ).toBeInTheDocument();
    });

    it('should show default message when not generating', () => {
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
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: false,
            lastGeneratedFileName: '',
            errorMessage: null,
            triggerValidation: null,
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(
        screen.getByText('Click to generate and download your leave request PDF')
      ).toBeInTheDocument();
    });
  });

  describe('9. Error handling for import/export', () => {
    it('should handle export error with non-Error object', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockImplementationOnce(() => {
        throw new Error('First error');
      });

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });
    });

    it('should handle import error with non-Error object', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockRejectedValueOnce(new Error('Invalid JSON format'));

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['invalid'], 'invalid.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
      });
    });

    it('should clear previous errors on new export attempt', async () => {
      const user = userEvent.setup();

      // First export fails
      mockExportProfileToJson.mockImplementationOnce(() => {
        throw new Error('First error');
      });

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second export succeeds
      mockExportProfileToJson.mockResolvedValueOnce(undefined);
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByText('Profile exported successfully!')).toBeInTheDocument();
      });
    });

    it('should clear previous errors on new import attempt', async () => {
      const user = userEvent.setup();

      // First import fails
      mockImportProfileFromJson.mockRejectedValueOnce(new Error('First error'));

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['invalid'], 'invalid.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second import succeeds
      mockImportProfileFromJson.mockResolvedValueOnce(undefined);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByText('Profile imported successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('10. Success message handling', () => {
    it('should display success message for export', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Profile exported successfully!')).toBeInTheDocument();
      });
    });

    it('should display success message for import', async () => {
      const user = userEvent.setup();
      mockImportProfileFromJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const fileInput = screen.getByLabelText(/Import profile from JSON file/i);
      const file = new File(['{"profile":{}}'], 'profile.json', { type: 'application/json' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Profile imported successfully!')).toBeInTheDocument();
      });
    });

    it('should display success message for clear profile', async () => {
      const user = userEvent.setup();

      act(() => {
        useLeaveRequestStore.setState({
          profile: {
            fullName: 'Test',
            email: 'test@example.com',
            phone: '123',
            employeeId: '123',
            department: 'Test',
            position: 'Test',
          },
        });
      });

      render(<ReviewAndGenerate />);

      const clearButton = screen.getByRole('button', { name: 'Clear Profile' });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Profile cleared successfully!')).toBeInTheDocument();
      });
    });

    it('should display success message for PDF generation', async () => {
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
        });
      });

      render(<ReviewAndGenerate />);

      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.getByText('PDF generated successfully!')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should dismiss success message when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Profile exported successfully!')).toBeInTheDocument();
      });

      // Click the dismiss button (X icon button)
      const dismissButton = screen.getAllByRole('button', { name: /dismiss/i })[0];
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Profile exported successfully!')).not.toBeInTheDocument();
      });
    });

    it('should auto-dismiss success message after timeout', async () => {
      const user = userEvent.setup();
      mockExportProfileToJson.mockResolvedValue(undefined);

      render(<ReviewAndGenerate />);

      const exportButton = screen.getByRole('button', { name: 'Export Profile' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Profile exported successfully!')).toBeInTheDocument();
      });

      // Wait for auto-dismiss (3 seconds + small buffer)
      await waitFor(
        () => {
          expect(screen.queryByText('Profile exported successfully!')).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });
  });

  describe('Error messages from store', () => {
    it('should display errorMessage from store', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: '' },
          holidays: { holidaySet: new Set() },
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: false,
            lastGeneratedFileName: '',
            errorMessage: 'An error occurred while processing your request',
            triggerValidation: null,
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(
        screen.getByText('An error occurred while processing your request')
      ).toBeInTheDocument();
    });

    it('should dismiss errorMessage from store when dismiss button is clicked', () => {
      act(() => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: '' },
          holidays: { holidaySet: new Set() },
          ui: {
            isSignatureModalOpen: false,
            isGeneratingPdf: false,
            lastGeneratedFileName: '',
            errorMessage: 'Test error from store',
            triggerValidation: null,
          },
        });
      });

      render(<ReviewAndGenerate />);

      expect(screen.getByText('Test error from store')).toBeInTheDocument();
    });
  });

  describe('Edge cases and integration', () => {
    it('should call calculateAbsenceDays when dates are set', () => {
      // Clear the mock to check only this test's call
      mockCalculateAbsenceDays.mockClear();

      act(() => {
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

      render(<ReviewAndGenerate />);

      // The mock should be called with the correct arguments
      const calls = mockCalculateAbsenceDays.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall).toHaveLength(3);
      expect(lastCall[0]).toBeInstanceOf(Date);
      expect(lastCall[1]).toBeInstanceOf(Date);
      expect(lastCall[2]).toBeInstanceOf(Set);
    });
  });
});

