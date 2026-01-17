import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewAndGenerate } from '.';
import { renderWithI18n } from '../../../../../test-utils';
import { LeaveRequestSchema } from '../../../model/leaveRequest.schema';
import type { LeaveRequest } from '../../../model/leaveRequest.types';
import { useLeaveRequestStore } from '../../../state/leaveRequest.store';

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

describe('ReviewAndGenerate - Leave Allowance Validation', () => {
  beforeEach(() => {
    localStorage.clear();
    useLeaveRequestStore.setState({
      profile: {
        fullName: 'John Doe',
        fathersName: 'George Doe',
        email: 'john.doe@example.com',
        phone: '+306901234567',
        identityNumber: 'AB1234567',
        employeeId: 'EMP001',
        companyName: 'Test Company',
        department: 'Engineering',
        position: 'Developer',
      },
      leaveDraft: {
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
      },
      userPreferences: {
        leaveAllowance: null,
      },
      signature: {
        signatureDataUrl: 'data:image/png;base64,abc123',
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
        refreshFormField: null,
      },
    });
    vi.clearAllMocks();
  });

  describe('1. Leave Allowance field is optional', () => {
    it('should render without leave allowance set (null)', () => {
      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      expect(container.textContent).toContain('—');
    });

    it('should render without leave allowance set (null)', () => {
      useLeaveRequestStore.setState({
        userPreferences: {
          leaveAllowance: null,
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      expect(container.textContent).toContain('—');
    });

    it('should accept empty leave allowance in form submission', () => {
      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-20'),
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: null, // No allowance set
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render the allowance as "—" (no value)
      expect(container.textContent).toContain('—');
    });
  });

  describe('2. Validation only applies when leaveAllowance is not empty', () => {
    it('should NOT validate when leaveAllowance is null', async () => {
      const mockTriggerValidation = vi.fn().mockResolvedValue(true);

      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-20'),
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: null, // Not set
        },
        ui: {
          isSignatureModalOpen: false,
          isGeneratingPdf: false,
          lastGeneratedFileName: '',
          errorMessage: null,
          triggerValidation: mockTriggerValidation,
          forceFormReset: false,
          refreshFormField: null,
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render "—" for allowance (not set)
      expect(container.textContent).toContain('—');
    });

    it('should NOT validate when leaveAllowance is null', async () => {
      const mockTriggerValidation = vi.fn().mockResolvedValue(true);

      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-20'),
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: null, // Not set
        },
        ui: {
          isSignatureModalOpen: false,
          isGeneratingPdf: false,
          lastGeneratedFileName: '',
          errorMessage: null,
          triggerValidation: mockTriggerValidation,
          forceFormReset: false,
          refreshFormField: null,
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render "—" for allowance (not set)
      expect(container.textContent).toContain('—');
    });

    it('should allow exceeding absence days when leaveAllowance is null', () => {
      // User requests 10 days leave but no allowance is set
      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-24'), // 10 days
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: null, // No allowance set - should NOT validate
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render the 10 days absence
      expect(container.textContent).toContain('10');
    });
  });

  describe('3. Validation applies when leaveAllowance is provided', () => {
    it('should display allowance when value is provided', () => {
      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-20'),
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: 25, // Allowance set
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should display the allowance value
      expect(container.textContent).toContain('25');
      expect(container.textContent).toContain('days');
    });

    it('should NOT validate when absence days are within allowance', () => {
      // User has 25 days allowance, requests 5 days - should be valid
      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-19'), // 5 days
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: 25, // Allowance is sufficient
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render the absence breakdown
      expect(container.textContent).toContain('5');
    });

    it('should NOT validate when absence days equal allowance', () => {
      // User has 25 days allowance, requests exactly 25 days - should be valid
      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-02-18'), // Approx 25 days
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: 25, // Exactly the allowance
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render the absence breakdown
      expect(container.textContent).toContain('25');
    });
  });

  describe('4. Validation rejects when absence days exceed allowance', () => {
    it('should show error when absence days exceed provided allowance', () => {
      // User has 10 days allowance, requests 15 days - should show error
      useLeaveRequestStore.setState({
        leaveDraft: {
          leaveType: 'annual',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-29'), // 15 days
          reason: 'Vacation',
        },
        userPreferences: {
          leaveAllowance: 10, // Only 10 days available
        },
      });

      const { container } = renderWithI18n(
        <FormWrapper>
          <ReviewAndGenerate />
        </FormWrapper>
      );

      // Should render the absence breakdown
      expect(container.textContent).toContain('15');
    });
  });

  describe('5. Leave Allowance schema validation', () => {
    it('should accept LeaveRequest with leaveAllowance set to a number', () => {
      const validRequest = {
        profile: {
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '+306901234567',
          identityNumber: 'AB1234567',
          employeeId: '',
          companyName: 'Test Company',
          department: 'Engineering',
          position: 'Developer',
        },
        leaveType: 'annual' as const,
        leaveAllowance: 25,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        reason: 'Vacation',
        createdAt: new Date(),
      };

      const result = LeaveRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept LeaveRequest with leaveAllowance set to null', () => {
      const validRequest = {
        profile: {
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '+306901234567',
          identityNumber: 'AB1234567',
          employeeId: '',
          companyName: 'Test Company',
          department: 'Engineering',
          position: 'Developer',
        },
        leaveType: 'annual' as const,
        leaveAllowance: null,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        reason: 'Vacation',
        createdAt: new Date(),
      };

      const result = LeaveRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept LeaveRequest without leaveAllowance field', () => {
      const validRequest = {
        profile: {
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '+306901234567',
          identityNumber: 'AB1234567',
          employeeId: '',
          companyName: 'Test Company',
          department: 'Engineering',
          position: 'Developer',
        },
        leaveType: 'annual' as const,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        reason: 'Vacation',
        createdAt: new Date(),
      };

      const result = LeaveRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept leaveAllowance set to 0', () => {
      const validRequest = {
        profile: {
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '+306901234567',
          identityNumber: 'AB1234567',
          employeeId: '',
          companyName: 'Test Company',
          department: 'Engineering',
          position: 'Developer',
        },
        leaveType: 'annual' as const,
        leaveAllowance: 0,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        reason: 'Vacation',
        createdAt: new Date(),
      };

      const result = LeaveRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept positive leaveAllowance values', () => {
      const validRequest = {
        profile: {
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '+306901234567',
          identityNumber: 'AB1234567',
          employeeId: '',
          companyName: 'Test Company',
          department: 'Engineering',
          position: 'Developer',
        },
        leaveType: 'annual' as const,
        leaveAllowance: 30,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        reason: 'Vacation',
        createdAt: new Date(),
      };

      const result = LeaveRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });
});

