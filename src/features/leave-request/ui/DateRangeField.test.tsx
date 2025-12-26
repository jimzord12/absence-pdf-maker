import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { DateRangeField } from './DateRangeField';
import type { LeaveRequest } from '../model/leaveRequest.types';
import userEvent from '@testing-library/user-event';

// Wrapper component to provide FormContext
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<LeaveRequest>({
    defaultValues: {
      profile: {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
      },
      leaveType: 'annual',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      createdAt: new Date(),
    } as any,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('DateRangeField', () => {
  describe('rendering', () => {
    it('should render start date input', () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    });

    it('should render end date input', () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('should render both date inputs in vertical space', () => {
      const { container } = render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const wrapper = container.querySelector('.space-y-4');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render date inputs with date type', () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');

      expect(startDateInput).toHaveAttribute('type', 'date');
      expect(endDateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('form integration', () => {
    it('should register start date field with React Hook Form', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-25');
      expect(startDateInput).toHaveValue('2025-12-25');
    });

    it('should register end date field with React Hook Form', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const endDateInput = screen.getByLabelText('End Date');
      const user = userEvent.setup();

      await user.type(endDateInput, '2025-12-31');
      expect(endDateInput).toHaveValue('2025-12-31');
    });

    it('should handle valueAsDate registration option', async () => {
      const ControlledWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const methods = useForm<LeaveRequest>({
          defaultValues: {
            profile: {
              fullName: '',
              email: '',
              phone: '',
              employeeId: '',
              department: '',
              position: '',
            },
            leaveType: 'annual',
            startDate: new Date(),
            endDate: new Date(),
            reason: '',
            createdAt: new Date(),
          } as any,
        });
        return <FormProvider {...methods}>{children}</FormProvider>;
      };

      render(
        <ControlledWrapper>
          <DateRangeField />
        </ControlledWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-25');
      expect(startDateInput).toHaveValue('2025-12-25');
    });

    it('should allow changing both date values', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      const user = userEvent.setup();

      await user.type(startDateInput, '2025-12-20');
      await user.type(endDateInput, '2025-12-25');

      expect(startDateInput).toHaveValue('2025-12-20');
      expect(endDateInput).toHaveValue('2025-12-25');
    });
  });

  describe('error handling', () => {
    it('should display error message for start date when provided', () => {
      const mockErrors = {
        startDate: { message: 'Start date is required', type: 'required' },
      } as any;

      render(
        <TestWrapper>
          <DateRangeField errors={mockErrors} />
        </TestWrapper>
      );

      expect(screen.getByText('Start date is required')).toBeInTheDocument();
    });

    it('should display error message for end date when provided', () => {
      const mockErrors = {
        endDate: { message: 'End date is required', type: 'required' },
      } as any;

      render(
        <TestWrapper>
          <DateRangeField errors={mockErrors} />
        </TestWrapper>
      );

      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });

    it('should display error messages for both dates when provided', () => {
      const mockErrors = {
        startDate: { message: 'Start date is required', type: 'required' },
        endDate: { message: 'End date is required', type: 'required' },
      } as any;

      render(
        <TestWrapper>
          <DateRangeField errors={mockErrors} />
        </TestWrapper>
      );

      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });

    it('should not display error messages when errors prop is not provided', () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });

    it('should not display error messages when errors prop is empty', () => {
      render(
        <TestWrapper>
          <DateRangeField errors={{} as any} />
        </TestWrapper>
      );

      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });
  });

  describe('label accessibility', () => {
    it('should have proper label association for start date', () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      expect(startDateInput).toBeInTheDocument();
    });

    it('should have proper label association for end date', () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const endDateInput = screen.getByLabelText('End Date');
      expect(endDateInput).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty form context gracefully', () => {
      const { container } = render(<DateRangeField />);

      // Component should still render without crashing
      expect(container).toBeInTheDocument();
    });

    it('should render when errors is undefined', () => {
      render(
        <TestWrapper>
          <DateRangeField errors={undefined} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('should allow clearing date values', async () => {
      const ControlledWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const methods = useForm<LeaveRequest>({
          defaultValues: {
            profile: {
              fullName: '',
              email: '',
              phone: '',
              employeeId: '',
              department: '',
              position: '',
            },
            leaveType: 'annual',
            startDate: new Date('2025-12-25'),
            endDate: new Date('2025-12-31'),
            reason: '',
            createdAt: new Date(),
          } as any,
        });
        return <FormProvider {...methods}>{children}</FormProvider>;
      };

      render(
        <ControlledWrapper>
          <DateRangeField />
        </ControlledWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      const user = userEvent.setup();

      await user.clear(startDateInput);
      await user.clear(endDateInput);

      expect(startDateInput).toHaveValue('');
      expect(endDateInput).toHaveValue('');
    });

    it('should handle invalid date input gracefully', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const user = userEvent.setup();

      // Type invalid date
      await user.type(startDateInput, 'invalid-date');
      // Component should still exist and handle the invalid input
      expect(startDateInput).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should be interactive for start date', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const user = userEvent.setup();

      await user.click(startDateInput);
      expect(startDateInput).toHaveFocus();
    });

    it('should be interactive for end date', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const endDateInput = screen.getByLabelText('End Date');
      const user = userEvent.setup();

      await user.click(endDateInput);
      expect(endDateInput).toHaveFocus();
    });

    it('should allow tabbing between date inputs', async () => {
      render(
        <TestWrapper>
          <DateRangeField />
        </TestWrapper>
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      const user = userEvent.setup();

      await user.click(startDateInput);
      await user.tab();

      expect(startDateInput).not.toHaveFocus();
      expect(endDateInput).toHaveFocus();
    });
  });
});
