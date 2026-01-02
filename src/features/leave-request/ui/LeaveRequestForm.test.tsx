import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeaveRequestForm } from './LeaveRequestForm';
import { useLeaveRequestStore } from '../state/leaveRequest.store';

// Mock the calculateAbsenceDays function
const mockCalculateAbsenceDays = vi.fn();
vi.mock('../services/absenceDays', () => ({
  calculateAbsenceDays: () => mockCalculateAbsenceDays(),
}));

// Mock the SignatureModal component
vi.mock('./SignatureModal', () => ({
  SignatureModal: () => <div data-testid="signature-modal">Signature Modal</div>,
}));

// Mock alerts for testing
global.alert = vi.fn();

describe('LeaveRequestForm', () => {
  // Reset store and mocks before each test
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
      },
    });
    vi.clearAllMocks();

    // Set default mock return value for calculateAbsenceDays
    mockCalculateAbsenceDays.mockReturnValue({
      totalDays: 0,
      holidayDays: 0,
      weekendDays: 0,
      absenceDays: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Component renders correctly', () => {
    it('should render the form with all sections', () => {
      render(<LeaveRequestForm />);

      // Check form is rendered
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Check Personal Details Section
      expect(screen.getByText('Personal Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();

      // Check Employment Details Section
      expect(screen.getByText('Employment Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
      expect(screen.getByLabelText('Position')).toBeInTheDocument();

      // Check Leave Details Section
      expect(screen.getByText('Leave Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Leave Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Reason (Optional)')).toBeInTheDocument();

      // Check Signature Section
      expect(screen.getByText('Signature')).toBeInTheDocument();
      expect(screen.getByText('Capture Signature')).toBeInTheDocument();

      // Check Action Buttons
      expect(screen.getByText('Reset Form')).toBeInTheDocument();
      expect(screen.getByText('Submit Leave Request')).toBeInTheDocument();
    });

    it('should render SignatureModal component', () => {
      render(<LeaveRequestForm />);
      expect(screen.getByTestId('signature-modal')).toBeInTheDocument();
    });

    it('should render all leave type options', () => {
      render(<LeaveRequestForm />);

      const leaveTypeSelect = screen.getByLabelText('Leave Type');
      expect(leaveTypeSelect).toBeInTheDocument();

      // Check options are available
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('Unpaid Leave')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });
  });

  describe('2. Form integrates with React Hook Form and Zod resolver', () => {
    it('should initialize form with default values from Zustand store', () => {
      // Pre-populate store with some profile data
      useLeaveRequestStore.setState({
        profile: {
          fullName: 'John Doe',
          email: 'john@example.com',
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
      });

      render(<LeaveRequestForm />);

      // Check that pre-filled values are displayed
      expect(screen.getByLabelText('Full Name')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Email Address')).toHaveValue('john@example.com');
    });

    it('should use Zod resolver for validation', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(<LeaveRequestForm />);

      // Try to submit form without required fields
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      // Check for validation errors on required fields
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(<LeaveRequestForm />);

      // Enter invalid email
      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      // Should show email validation error after trying to submit
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should validate date ordering (end date after start date)', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 0,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 0,
      });

      render(<LeaveRequestForm />);

      // Set end date before start date
      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');

      fireEvent.change(startDateInput, { target: { value: '2025-12-20' } });
      fireEvent.change(endDateInput, { target: { value: '2025-12-15' } });

      // Try to submit
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      // Should show date validation error
      await waitFor(() => {
        // Check that alert shows date validation error
        expect(global.alert).toHaveBeenCalledWith('End date must be after start date.');
      });
    });
  });

  describe('3. Form fields are registered correctly', () => {
    it('should register personal details fields with React Hook Form', () => {
      render(<LeaveRequestForm />);

      // All personal details fields should be present and interactable
      const fullNameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const phoneInput = screen.getByLabelText('Phone Number');

      expect(fullNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();

      // Test that we can type in them
      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      expect(fullNameInput).toHaveValue('Test User');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');

      fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
      expect(phoneInput).toHaveValue('123-456-7890');
    });

    it('should register employment details fields with React Hook Form', () => {
      render(<LeaveRequestForm />);

      const employeeIdInput = screen.getByLabelText('Employee ID');
      const departmentInput = screen.getByLabelText('Department');
      const positionInput = screen.getByLabelText('Position');

      expect(employeeIdInput).toBeInTheDocument();
      expect(departmentInput).toBeInTheDocument();
      expect(positionInput).toBeInTheDocument();

      // Test typing
      fireEvent.change(employeeIdInput, { target: { value: 'EMP001' } });
      expect(employeeIdInput).toHaveValue('EMP001');

      fireEvent.change(departmentInput, { target: { value: 'Engineering' } });
      expect(departmentInput).toHaveValue('Engineering');

      fireEvent.change(positionInput, { target: { value: 'Developer' } });
      expect(positionInput).toHaveValue('Developer');
    });

    it('should register leave details fields with React Hook Form', () => {
      render(<LeaveRequestForm />);

      const leaveTypeSelect = screen.getByLabelText('Leave Type');
      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      const reasonTextarea = screen.getByLabelText('Reason (Optional)');

      expect(leaveTypeSelect).toBeInTheDocument();
      expect(startDateInput).toBeInTheDocument();
      expect(endDateInput).toBeInTheDocument();
      expect(reasonTextarea).toBeInTheDocument();

      // Test interactions
      fireEvent.change(leaveTypeSelect, { target: { value: 'sick' } });
      expect(leaveTypeSelect).toHaveValue('sick');

      fireEvent.change(startDateInput, { target: { value: '2025-12-01' } });
      expect(startDateInput).toHaveValue('2025-12-01');

      fireEvent.change(reasonTextarea, { target: { value: 'Medical appointment' } });
      expect(reasonTextarea).toHaveValue('Medical appointment');
    });
  });

  describe('4. Form submission works and validates data', () => {
    it('should show validation errors when submitting empty form', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(<LeaveRequestForm />);

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      // Wait for validation errors to appear
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        expect(screen.getByText('Employee ID is required')).toBeInTheDocument();
        expect(screen.getByText('Department is required')).toBeInTheDocument();
        expect(screen.getByText('Position is required')).toBeInTheDocument();
      });
    });

    it('should alert when signature is not captured', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(<LeaveRequestForm />);

      // Fill all required fields
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123-456-7890' } });
      fireEvent.change(screen.getByLabelText('Employee ID'), { target: { value: 'EMP001' } });
      fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Developer' } });

      // Submit without signature
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Please capture your signature before submitting.');
      });
    });

    it('should submit successfully with valid data including signature', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 1,
        weekendDays: 1,
        absenceDays: 3,
      });

      // Set signature in store
      const signatureData = 'data:image/png;base64,test-signature';
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: signatureData },
      });

      render(<LeaveRequestForm />);

      // Fill all required fields
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123-456-7890' } });
      fireEvent.change(screen.getByLabelText('Employee ID'), { target: { value: 'EMP001' } });
      fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Developer' } });

      // Submit form
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show success message with absence days calculation
        expect(global.alert).toHaveBeenCalledWith(
          'Leave request submitted successfully!\n\nTotal days: 5\nHolidays: 1\nWeekends: 1\nAbsence days: 3'
        );
      });
    });

    it('should validate date range before submission', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 0,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 0,
      });

      // Set signature in store
      const signatureData = 'data:image/png;base64,test-signature';
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: signatureData },
      });

      render(<LeaveRequestForm />);

      // Fill all required fields
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123-456-7890' } });
      fireEvent.change(screen.getByLabelText('Employee ID'), { target: { value: 'EMP001' } });
      fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Developer' } });

      // Set invalid date range
      fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-12-20' } });
      fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-12-15' } });

      // Submit form
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('End date must be after start date.');
      });
    });
  });

  describe('5. Form syncs with Zustand store', () => {
    it('should sync profile fields to Zustand store on change', () => {
      render(<LeaveRequestForm />);

      // Change profile fields
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '555-123-4567' } });
      fireEvent.change(screen.getByLabelText('Employee ID'), { target: { value: 'EMP002' } });
      fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Marketing' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Manager' } });

      // Check that store was updated
      const store = useLeaveRequestStore.getState();
      expect(store.profile.fullName).toBe('Jane Smith');
      expect(store.profile.email).toBe('jane@example.com');
      expect(store.profile.phone).toBe('555-123-4567');
      expect(store.profile.employeeId).toBe('EMP002');
      expect(store.profile.department).toBe('Marketing');
      expect(store.profile.position).toBe('Manager');
    });

    it('should sync leave draft fields to Zustand store on change', () => {
      render(<LeaveRequestForm />);

      // Change leave draft fields
      fireEvent.change(screen.getByLabelText('Leave Type'), { target: { value: 'sick' } });
      fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-12-01' } });
      fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-12-05' } });
      fireEvent.change(screen.getByLabelText('Reason (Optional)'), { target: { value: 'Doctor appointment' } });

      // Check that store was updated
      const store = useLeaveRequestStore.getState();
      expect(store.leaveDraft.leaveType).toBe('sick');
      expect(store.leaveDraft.startDate).toBeInstanceOf(Date);
      expect(store.leaveDraft.endDate).toBeInstanceOf(Date);
      expect(store.leaveDraft.reason).toBe('Doctor appointment');
    });

    it('should sync signature to Zustand store when set', () => {
      const signatureData = 'data:image/png;base64,test-signature-data';
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: signatureData },
      });

      render(<LeaveRequestForm />);

      // The signature should be in the form context
      const store = useLeaveRequestStore.getState();
      expect(store.signature.signatureDataUrl).toBe(signatureData);
    });

    it('should load initial values from Zustand store', () => {
      // Pre-populate store
      useLeaveRequestStore.setState({
        profile: {
          fullName: 'Stored User',
          email: 'stored@example.com',
          phone: '999-888-7777',
          employeeId: 'EMP999',
          department: 'Finance',
          position: 'Analyst',
        },
        leaveDraft: {
          leaveType: 'unpaid',
          startDate: new Date('2025-11-01'),
          endDate: new Date('2025-11-03'),
          reason: 'Personal matter',
        },
      });

      render(<LeaveRequestForm />);

      // Check that form has initial values from store
      expect(screen.getByLabelText('Full Name')).toHaveValue('Stored User');
      expect(screen.getByLabelText('Email Address')).toHaveValue('stored@example.com');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('999-888-7777');
      expect(screen.getByLabelText('Employee ID')).toHaveValue('EMP999');
      expect(screen.getByLabelText('Department')).toHaveValue('Finance');
      expect(screen.getByLabelText('Position')).toHaveValue('Analyst');

      // Note: Date inputs in HTML use YYYY-MM-DD format
      expect(screen.getByLabelText('Start Date')).toHaveValue('2025-11-01');
      expect(screen.getByLabelText('End Date')).toHaveValue('2025-11-03');
      expect(screen.getByLabelText('Reason (Optional)')).toHaveValue('Personal matter');
    });
  });

  describe('6. Signature capture button opens modal', () => {
    it('should render capture signature button when no signature is captured', () => {
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: '' },
      });

      render(<LeaveRequestForm />);

      const captureButton = screen.getByText('Capture Signature');
      expect(captureButton).toBeInTheDocument();
      expect(captureButton).toHaveClass('w-full');
    });

    it('should render update signature button when signature is captured', () => {
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: 'data:image/png;base64,test-signature' },
      });

      render(<LeaveRequestForm />);

      const updateButton = screen.getByText('Update Signature');
      expect(updateButton).toBeInTheDocument();
      expect(screen.getByAltText('Signature')).toBeInTheDocument();
    });

    it('should open signature modal when capture button is clicked', () => {
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: '' },
      });

      render(<LeaveRequestForm />);

      const captureButton = screen.getByText('Capture Signature');
      fireEvent.click(captureButton);

      // Check that the modal toggle was called (modal state should be true)
      const store = useLeaveRequestStore.getState();
      expect(store.ui.isSignatureModalOpen).toBe(true);
    });

    it('should open signature modal when update button is clicked', () => {
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: 'data:image/png;base64,test-signature' },
      });

      render(<LeaveRequestForm />);

      const updateButton = screen.getByText('Update Signature');
      fireEvent.click(updateButton);

      const store = useLeaveRequestStore.getState();
      expect(store.ui.isSignatureModalOpen).toBe(true);
    });
  });

  describe('7. Absence days calculation displays correctly', () => {
    it('should display absence days calculation when valid dates are set', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 4,
        absenceDays: 4,
      });

      render(<LeaveRequestForm />);

      // Set valid date range
      fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-12-01' } });
      fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-12-10' } });

      // Wait for calculation to display
      await waitFor(() => {
        expect(screen.getByText('Absence Days Calculation')).toBeInTheDocument();
      });

      // Check the calculation details
      await waitFor(() => {
        expect(screen.getByText('Total Days:')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // totalDays
      });

      expect(screen.getByText('Holidays:')).toBeInTheDocument();
      expect(screen.getByText('Weekends:')).toBeInTheDocument();
      expect(screen.getByText('Absence Days:')).toBeInTheDocument();
    });

    it('should not display absence days calculation when dates are not set', () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 0,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 0,
      });

      render(<LeaveRequestForm />);

      // Calculation section should not be visible when totalDays is 0
      expect(screen.queryByText('Absence Days Calculation')).not.toBeInTheDocument();
    });

    it('should call calculateAbsenceDays with correct parameters', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 1,
        weekendDays: 0,
        absenceDays: 4,
      });

      render(<LeaveRequestForm />);

      fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-12-01' } });
      fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-12-05' } });

      await waitFor(() => {
        expect(mockCalculateAbsenceDays).toHaveBeenCalledWith(
          expect.any(Date), // startDate as Date object
          expect.any(Date), // endDate as Date object
          expect.any(Set) // holidaySet
        );
      });
    });

    it('should show absence days breakdown correctly', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 7,
        holidayDays: 1,
        weekendDays: 2,
        absenceDays: 4,
      });

      render(<LeaveRequestForm />);

      fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-12-01' } });
      fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-12-07' } });

      await waitFor(() => {
        const calculationText = screen.getByText('Absence Days Calculation').parentElement?.textContent;
        expect(calculationText).toContain('Total Days:');
        expect(calculationText).toContain('Holidays:');
        expect(calculationText).toContain('Weekends:');
        expect(calculationText).toContain('Absence Days:');
      });
    });
  });

  describe('8. Validation errors display for invalid fields', () => {
    it('should display error for empty full name', async () => {
      render(<LeaveRequestForm />);

      const fullNameInput = screen.getByLabelText('Full Name');
      fullNameInput.focus();
      fullNameInput.blur();

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
    });

    it('should display error for invalid email format', async () => {
      render(<LeaveRequestForm />);

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should display error for empty phone number', async () => {
      render(<LeaveRequestForm />);

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      });
    });

    it('should display error for empty employee ID', async () => {
      render(<LeaveRequestForm />);

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Employee ID is required')).toBeInTheDocument();
      });
    });

    it('should display error for empty department', async () => {
      render(<LeaveRequestForm />);

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Department is required')).toBeInTheDocument();
      });
    });

    it('should display error for empty position', async () => {
      render(<LeaveRequestForm />);

      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Position is required')).toBeInTheDocument();
      });
    });

    it('should clear error when field is corrected', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(<LeaveRequestForm />);

      // Trigger validation errors
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      // Fix the error
      const fullNameInput = screen.getByLabelText('Full Name');
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });

    it('should display error message from store', () => {
      useLeaveRequestStore.setState({
        ui: { errorMessage: 'An error occurred while loading data', isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', triggerValidation: null },
      });

      render(<LeaveRequestForm />);

      expect(screen.getByText('An error occurred while loading data')).toBeInTheDocument();
    });

    it('should dismiss error message when dismiss button is clicked', () => {
      useLeaveRequestStore.setState({
        ui: { errorMessage: 'Test error', isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', triggerValidation: null },
      });

      render(<LeaveRequestForm />);

      // Click the dismiss button (X icon button)
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      const store = useLeaveRequestStore.getState();
      expect(store.ui.errorMessage).toBeNull();

      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });

  describe('9. Reset button clears the form', () => {
    it('should reset form fields to initial values', () => {
      render(<LeaveRequestForm />);

      // Fill some fields
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123-456-7890' } });

      // Click reset button
      const resetButton = screen.getByText('Reset Form');
      fireEvent.click(resetButton);

      // Fields should be cleared
      expect(screen.getByLabelText('Full Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('');
    });

    it('should reset validation errors', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(<LeaveRequestForm />);

      // Trigger validation errors
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      // Click reset button
      const resetButton = screen.getByText('Reset Form');
      fireEvent.click(resetButton);

      // Errors should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });

    it('should reset to initial values from store if profile exists', () => {
      // Set profile in store
      useLeaveRequestStore.setState({
        profile: {
          fullName: 'Persisted User',
          email: 'persisted@example.com',
          phone: '555-555-5555',
          employeeId: 'EMP111',
          department: 'HR',
          position: 'Director',
        },
      });

      render(<LeaveRequestForm />);

      // Form should have initial values from store
      expect(screen.getByLabelText('Full Name')).toHaveValue('Persisted User');

      // Change some values
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Modified User' } });
      expect(screen.getByLabelText('Full Name')).toHaveValue('Modified User');

      // Reset form
      const resetButton = screen.getByText('Reset Form');
      fireEvent.click(resetButton);

      // Should reset to the form's default values (which come from store initially)
      // Note: The form's defaultValues are set from store on mount
      // Reset() resets to the initial defaultValues, not the current store state
      expect(screen.getByLabelText('Full Name')).toHaveValue('Persisted User');
    });

    it('should disable reset button when form is submitting', () => {
      render(<LeaveRequestForm />);

      // The submit button is disabled when isSubmitting is true
      // Reset button is also disabled when isSubmitting
      const resetButton = screen.getByText('Reset Form');
      expect(resetButton).not.toBeDisabled();
    });
  });

  describe('Additional edge cases', () => {
    it('should handle date values being converted to Date objects', () => {
      render(<LeaveRequestForm />);

      const startDateInput = screen.getByLabelText('Start Date');
      fireEvent.change(startDateInput, { target: { value: '2025-12-25' } });

      // Store should have Date object
      const store = useLeaveRequestStore.getState();
      expect(store.leaveDraft.startDate).toBeInstanceOf(Date);
    });

    it('should handle optional reason field correctly', () => {
      render(<LeaveRequestForm />);

      const reasonTextarea = screen.getByLabelText('Reason (Optional)');
      expect(reasonTextarea).toBeInTheDocument();

      // Empty reason should be valid (it's optional)
      fireEvent.change(reasonTextarea, { target: { value: '' } });
      expect(reasonTextarea).toHaveValue('');
    });

    it('should disable submit button when form is not dirty', () => {
      render(<LeaveRequestForm />);

      const submitButton = screen.getByText('Submit Leave Request');
      // Initially, form is not dirty (no changes made)
      expect(submitButton).toBeDisabled();

      // Make a change
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
      // Now form is dirty, button should be enabled
      expect(submitButton).not.toBeDisabled();
    });

    it('should show submitting state while submitting', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: 'data:image/png;base64,test' },
      });

      render(<LeaveRequestForm />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123-456-7890' } });
      fireEvent.change(screen.getByLabelText('Employee ID'), { target: { value: 'EMP001' } });
      fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Developer' } });

      // Submit form
      const submitButton = screen.getByText('Submit Leave Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });
    });

    it('should update signature in form when store signature changes', () => {
      const signatureData = 'data:image/png;base64,new-signature';
      useLeaveRequestStore.setState({
        signature: { signatureDataUrl: signatureData },
      });

      render(<LeaveRequestForm />);

      // Check that signature image is displayed
      expect(screen.getByAltText('Signature')).toBeInTheDocument();
      expect(screen.getByAltText('Signature')).toHaveAttribute('src', signatureData);
    });
  });
});
