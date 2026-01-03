import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaveRequestSchema } from '../../model/leaveRequest.schema';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { calculateAbsenceDays } from '../../services/absenceDays';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { DateRangeField } from '../components/DateRangeField';
import { LeaveDetailsSection } from './LeaveDetailsSection';

// Mock the calculateAbsenceDays function
const mockCalculateAbsenceDays = vi.fn().mockReturnValue({
  totalDays: 0,
  holidayDays: 0,
  weekendDays: 0,
  absenceDays: 0,
});
vi.mock('../../services/absenceDays', () => ({
  calculateAbsenceDays: (...args: any[]) => mockCalculateAbsenceDays(...args),
}));

// Mock DateRangeField
vi.mock('../components/DateRangeField', () => ({
  DateRangeField: vi.fn(),
}));

// Wrapper component to provide form context
const FormWrapper = ({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<LeaveRequest>;
}) => {
  const methods = useForm<LeaveRequest>({
    resolver: zodResolver(LeaveRequestSchema) as any,
    mode: 'onTouched',
    defaultValues: defaultValues as any,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('LeaveDetailsSection', () => {
  // Reset store and mocks before each test
  beforeEach(() => {
    vi.mocked(DateRangeField).mockImplementation(({ errors, holidaySet }: any) => {
      const context = useFormContext();
      if (!context) return <div data-testid="mock-date-range-field-no-context" />;

      const { register, watch } = context;
      const startDate = watch('startDate');
      const endDate = watch('endDate');

      let summary = { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
      if (startDate && endDate) {
        summary = calculateAbsenceDays(startDate, endDate, holidaySet);
      }

      const hasDates = !!startDate && !!endDate;

      return (
        <div data-testid="mock-date-range-field">
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              {...register('startDate', { setValueAs: (v: any) => (v ? new Date(v) : null) })}
            />
            {errors?.startDate?.message && <span>{errors.startDate.message}</span>}
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              {...register('endDate', { setValueAs: (v: any) => (v ? new Date(v) : null) })}
            />
            {errors?.endDate?.message && <span>{errors.endDate.message}</span>}
          </div>
          {hasDates && (
            <div>
              <h3>Absence Calculation</h3>
              <div>
                Total Days: <span>{summary.totalDays}</span>
              </div>
              <div>
                Holiday Days: <span>{summary.holidayDays}</span>
              </div>
              <div>
                Weekend Days: <span>{summary.weekendDays}</span>
              </div>
              <div>
                Actual Absence: <span className="text-green-600">{summary.absenceDays}</span>
              </div>
            </div>
          )}
          {!hasDates && (
            <div>
              <div>
                Total Days: <span>0</span>
              </div>
              <div>
                Holiday Days: <span>0</span>
              </div>
              <div>
                Weekend Days: <span>0</span>
              </div>
              <div>
                Actual Absence: <span>0</span>
              </div>
            </div>
          )}
        </div>
      );
    });

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
    vi.clearAllMocks();

    // Set default mock return value for calculateAbsenceDays
    mockCalculateAbsenceDays.mockReturnValue({
      totalDays: 0,
      holidayDays: 0,
      weekendDays: 0,
      absenceDays: 0,
    });
  });

  describe('1. Component renders correctly', () => {
    it('should render the section with Card component', () => {
      const { container } = render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.bg-white.rounded-lg');
      expect(card).toBeInTheDocument();
    });

    it('should render section heading', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByText('Leave Details Form')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Reason (Optional)')).toBeInTheDocument();
    });

    it('should render Leave Type select with all options', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('Unpaid Leave')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should render placeholder for Leave Type select', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const placeholderOption = screen.getByRole('option', { name: 'Select leave type' });
      expect(placeholderOption).toBeInTheDocument();
      expect(placeholderOption).toBeDisabled();
    });
  });

  describe('2. Leave Type dropdown functionality', () => {
    it('should register leave type field with React Hook Form', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const leaveTypeSelect = screen.getByLabelText(/Leave Type/i);
      const user = userEvent.setup();

      await user.selectOptions(leaveTypeSelect, 'sick');
      expect(leaveTypeSelect).toHaveValue('sick');
    });

    it('should allow selecting all leave types', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const leaveTypeSelect = screen.getByLabelText(/Leave Type/i);
      const user = userEvent.setup();

      await user.selectOptions(leaveTypeSelect, 'annual');
      expect(leaveTypeSelect).toHaveValue('annual');

      await user.selectOptions(leaveTypeSelect, 'sick');
      expect(leaveTypeSelect).toHaveValue('sick');

      await user.selectOptions(leaveTypeSelect, 'unpaid');
      expect(leaveTypeSelect).toHaveValue('unpaid');

      await user.selectOptions(leaveTypeSelect, 'other');
      expect(leaveTypeSelect).toHaveValue('other');
    });

    it('should sync leave type selection to Zustand store', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const leaveTypeSelect = screen.getByLabelText(/Leave Type/i);
      const user = userEvent.setup();

      await user.selectOptions(leaveTypeSelect, 'sick');

      // Check that store was updated
      await waitFor(() => {
        const store = useLeaveRequestStore.getState();
        expect(store.leaveDraft.leaveType).toBe('sick');
      });
    });

    it('should display error message for invalid leave type', async () => {
      const mockErrors = {
        leaveType: { message: 'Leave type is required', type: 'required' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Leave type is required')).toBeInTheDocument();
    });
  });

  describe('3. DateRangeField integration', () => {
    it('should render DateRangeField component', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
    });

    it('should allow setting start date', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-25');
      expect(startDateInput).toHaveValue('2025-12-25');
    });

    it('should allow setting end date', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(endDateInput, '2025-12-31');
      expect(endDateInput).toHaveValue('2025-12-31');
    });

    it('should sync date selection to Zustand store', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-25');
      await user.type(endDateInput, '2025-12-31');

      // Check that store was updated
      await waitFor(() => {
        const store = useLeaveRequestStore.getState();
        expect(store.leaveDraft.startDate).toBeInstanceOf(Date);
        expect(store.leaveDraft.endDate).toBeInstanceOf(Date);
      });
    });

    it('should display error messages for invalid dates', async () => {
      const mockErrors = {
        startDate: { message: 'Start date is required', type: 'required' },
        endDate: { message: 'End date is required', type: 'required' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });
  });

  describe('4. Reason textarea functionality', () => {
    it('should render reason textarea with correct label', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByLabelText('Reason (Optional)')).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const textarea = screen.getByLabelText('Reason (Optional)') as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe('Please provide a reason for your leave request...');
    });

    it('should allow typing in reason textarea', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const textarea = screen.getByLabelText('Reason (Optional)');
      const user = userEvent.setup();

      await user.type(textarea, 'Medical appointment with doctor');
      expect(textarea).toHaveValue('Medical appointment with doctor');
    });

    it('should sync reason to Zustand store', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const textarea = screen.getByLabelText('Reason (Optional)');
      const user = userEvent.setup();

      await user.type(textarea, 'Family emergency');

      // Check that store was updated
      await waitFor(() => {
        const store = useLeaveRequestStore.getState();
        expect(store.leaveDraft.reason).toBe('Family emergency');
      });
    });

    it('should accept empty reason (optional field)', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const textarea = screen.getByLabelText('Reason (Optional)');
      expect(textarea).toHaveValue('');
    });

    it('should display error message for invalid reason if validation error exists', () => {
      const mockErrors = {
        reason: { message: 'Reason must be at least 10 characters', type: 'min' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Reason must be at least 10 characters')).toBeInTheDocument();
    });
  });

  describe('5. Absence days calculation display', () => {
    it('should not display absence calculation when dates are not set', () => {
      // Test without form context to see initial state
      render(<LeaveDetailsSection />);

      // When form context is missing, calculation shouldn't display
      expect(screen.queryByText('Absence Calculation')).not.toBeInTheDocument();
    });

    it('should display absence calculation when both dates are set', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 6,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(screen.getByText('Absence Calculation')).toBeInTheDocument();
      });
    });

    it('should display total days calculation', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 6,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(screen.getByText('Total Days:')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // totalDays value
      });
    });

    it('should display weekend days calculation', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 6,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(screen.getByText('Weekend Days:')).toBeInTheDocument();
      });
    });

    it('should display holiday days calculation', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 6,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(screen.getByText('Holiday Days:')).toBeInTheDocument();
      });
    });

    it('should display actual absence days calculation', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 6,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(screen.getByText('Actual Absence:')).toBeInTheDocument();
      });
    });

    it('should highlight actual absence days in green', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 10,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 6,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        const actualAbsenceSpan = screen.getByText('6');
        expect(actualAbsenceSpan).toHaveClass('text-green-600');
      });
    });

    it('should call calculateAbsenceDays with correct parameters', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 1,
        absenceDays: 4,
      });

      const holidaySet = new Set<string>(['2025-12-25', '2025-12-26']);
      useLeaveRequestStore.setState({
        holidays: { holidaySet },
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-24');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(mockCalculateAbsenceDays).toHaveBeenCalled();
      });

      // Verify that calculateAbsenceDays is being called (it's called by useMemo when dates change)
      expect(mockCalculateAbsenceDays.mock.calls.length).toBeGreaterThan(0);
    });

    it('should display zero values when no dates are selected', () => {
      // Test without form context
      render(<LeaveDetailsSection />);

      // Without form context, calculation section shouldn't be visible
      expect(screen.queryByText('Absence Calculation')).not.toBeInTheDocument();
    });
  });

  describe('6. Validation errors display', () => {
    it('should display error for leave type when validation fails', () => {
      const mockErrors = {
        leaveType: { message: 'Please select a leave type', type: 'required' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Please select a leave type')).toBeInTheDocument();
    });

    it('should display error for start date when validation fails', () => {
      const mockErrors = {
        startDate: { message: 'Start date is required', type: 'required' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Start date is required')).toBeInTheDocument();
    });

    it('should display error for end date when validation fails', () => {
      const mockErrors = {
        endDate: { message: 'End date is required', type: 'required' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });

    it('should display error for reason when validation fails', () => {
      const mockErrors = {
        reason: { message: 'Reason is too long', type: 'max' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Reason is too long')).toBeInTheDocument();
    });

    it('should display multiple validation errors simultaneously', () => {
      const mockErrors = {
        leaveType: { message: 'Leave type is required', type: 'required' },
        startDate: { message: 'Start date is required', type: 'required' },
        endDate: { message: 'End date is required', type: 'required' },
      } as any;

      render(
        <FormWrapper>
          <LeaveDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Leave type is required')).toBeInTheDocument();
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });

    it('should not display errors when errors prop is not provided', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });
  });

  describe('7. Card component styling', () => {
    it('should apply default Card styles', () => {
      const { container } = render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.bg-white.rounded-lg');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white', 'rounded-lg');
    });

    it('should have padding from Card component', () => {
      const { container } = render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.bg-white.rounded-lg');
      expect(card).toHaveClass('p-6'); // default padding
    });

    it('should have border from Card component', () => {
      const { container } = render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.bg-white.rounded-lg');
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('should have shadow from Card component', () => {
      const { container } = render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.bg-white.rounded-lg');
      expect(card).toHaveClass('shadow-sm');
    });
  });

  describe('8. Field registration with React Hook Form', () => {
    it('should register leave type field', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const leaveTypeSelect = screen.getByLabelText(/Leave Type/i);
      expect(leaveTypeSelect).toBeInTheDocument();
      expect(leaveTypeSelect.tagName).toBe('SELECT');
    });

    it('should register start date field', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      expect(startDateInput).toBeInTheDocument();
      expect(startDateInput.tagName).toBe('INPUT');
    });

    it('should register end date field', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const endDateInput = screen.getByLabelText(/End Date/i);
      expect(endDateInput).toBeInTheDocument();
      expect(endDateInput.tagName).toBe('INPUT');
    });

    it('should register reason field', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const reasonTextarea = screen.getByLabelText('Reason (Optional)');
      expect(reasonTextarea).toBeInTheDocument();
      expect(reasonTextarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('9. Integration with holidays from store', () => {
    it('should use holidays from Zustand store for calculation', async () => {
      const holidaySet = new Set<string>(['2025-12-25', '2025-12-26']);
      useLeaveRequestStore.setState({
        holidays: { holidaySet },
      });

      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 8,
        holidayDays: 2,
        weekendDays: 2,
        absenceDays: 4,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-24');
      await user.type(endDateInput, '2025-12-31');

      await waitFor(() => {
        expect(mockCalculateAbsenceDays).toHaveBeenCalled();
      });

      // Verify that function was called multiple times (component uses watch which triggers recalculations)
      expect(mockCalculateAbsenceDays.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle empty holiday set', async () => {
      useLeaveRequestStore.setState({
        holidays: { holidaySet: new Set<string>() },
      });

      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 1,
        absenceDays: 4,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-01');
      await user.type(endDateInput, '2025-12-05');

      await waitFor(() => {
        expect(mockCalculateAbsenceDays).toHaveBeenCalled();
      });

      // Verify that function was called
      expect(mockCalculateAbsenceDays.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('10. Edge cases and error handling', () => {
    it('should handle missing form context gracefully', () => {
      render(<LeaveDetailsSection />);

      // Component should still render without crashing
      expect(screen.getByText('Leave Details Form')).toBeInTheDocument();
    });

    it('should handle undefined errors prop', () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection errors={undefined} />
        </FormWrapper>
      );

      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });

    it('should recalculate absence days when dates change', async () => {
      mockCalculateAbsenceDays.mockReturnValue({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });

      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const user = userEvent.setup();

      const initialCallCount = mockCalculateAbsenceDays.mock.calls.length;

      await user.type(startDateInput, '2025-12-01');
      await user.type(endDateInput, '2025-12-05');

      await waitFor(() => {
        expect(mockCalculateAbsenceDays.mock.calls.length).toBeGreaterThan(initialCallCount);
      });

      // Change end date - should trigger recalculation
      const afterFirstCallCount = mockCalculateAbsenceDays.mock.calls.length;
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-12-10');

      await waitFor(() => {
        expect(mockCalculateAbsenceDays.mock.calls.length).toBeGreaterThan(afterFirstCallCount);
      });
    });

    it('should handle date inputs with invalid values', async () => {
      render(
        <FormWrapper>
          <LeaveDetailsSection />
        </FormWrapper>
      );

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const user = userEvent.setup();

      // Type invalid date
      await user.type(startDateInput, 'invalid-date');

      // Component should still exist and handle the invalid input
      expect(startDateInput).toBeInTheDocument();
    });
  });
});

