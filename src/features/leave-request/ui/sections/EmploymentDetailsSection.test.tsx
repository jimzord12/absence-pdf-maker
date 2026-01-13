import { fireEvent, screen } from '@testing-library/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaveRequestSchema } from '../../model/leaveRequest.schema';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { renderWithI18n } from '../../../../test-utils';
import { EmploymentDetailsSection } from './EmploymentDetailsSection';

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

describe('EmploymentDetailsSection', () => {
  beforeEach(() => {
    localStorage.clear();
    useLeaveRequestStore.setState({
      profile: {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: '',
        position: '',
      },
    });
    vi.clearAllMocks();
  });

  describe('1. Component renders correctly', () => {
    it('should render the section with correct heading', () => {
      renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByText('Employment Details Form')).toBeInTheDocument();
    });

    it('should render all four input fields with correct labels', () => {
      renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();
    });

    it('should be wrapped in a Card component with correct styling', () => {
      const { container } = renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.rounded-lg');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-[color:var(--color-surface)]');
    });
  });

  describe('2. User interaction', () => {
    it('should allow typing in Employee ID field', () => {
      renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const input = screen.getByLabelText(/Employee ID/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'EMP123' } });
      expect(input.value).toBe('EMP123');
    });
  });

  describe('3. Validation styling', () => {
    it('should apply error styling when errors are provided', () => {
      const mockErrors = {
        profile: {
          employeeId: { type: 'required', message: 'Error' },
        },
      } as any;

      renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      const input = screen.getByLabelText(/Employee ID/i);
      expect(input).toHaveClass('border-[color:var(--color-error)]');
    });
  });

  describe('4. Card styling', () => {
    it('should have correct background and border styling', () => {
      const { container } = renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.rounded-lg');
      expect(card).toHaveClass('bg-[color:var(--color-surface)]');
      expect(card).toHaveClass('border-[color:var(--color-border)]');
    });
  });

  describe('5. Consistency', () => {
    it('should have labels with correct styling', () => {
      renderWithI18n(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const labels = document.querySelectorAll('label');
      labels.forEach(label => {
        expect(label).toHaveClass('text-[color:var(--color-text-primary)]');
      });
    });
  });
});
