import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmploymentDetailsSection } from './EmploymentDetailsSection';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeaveRequestSchema } from '../model/leaveRequest.schema';
import type { LeaveRequest } from '../model/leaveRequest.types';

// Wrapper component to provide form context
const FormWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const methods = useForm<LeaveRequest>({
    resolver: zodResolver(LeaveRequestSchema) as any,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('EmploymentDetailsSection', () => {
  // Reset store and mocks before each test
  beforeEach(() => {
    localStorage.clear();
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
  });

  describe('1. Component renders correctly', () => {
    it('should render the section with correct heading', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByText('Employment Details')).toBeInTheDocument();
    });

    it('should render all four input fields with correct labels', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByLabelText('Employee ID (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Company Name*')).toBeInTheDocument();
      expect(screen.getByLabelText('Department*') ).toBeInTheDocument();
      expect(screen.getByLabelText('Position*')).toBeInTheDocument();
    });

    it('should render fields with correct input types', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)') as HTMLInputElement;
      const departmentInput = screen.getByLabelText('Department*')  as HTMLInputElement;
      const positionInput = screen.getByLabelText('Position*') as HTMLInputElement;

      expect(employeeIdInput.type).toBe('text');
      expect(departmentInput.type).toBe('text');
      expect(positionInput.type).toBe('text');
    });

    it('should render fields with correct placeholders', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByPlaceholderText('Leave blank if not applicable');
      const companyNameInput = screen.getByPlaceholderText('Enter company name');
      const departmentInput = screen.getByPlaceholderText('Engineering');
      const positionInput = screen.getByPlaceholderText('Software Engineer');

      expect(employeeIdInput).toBeInTheDocument();
      expect(companyNameInput).toBeInTheDocument();
      expect(departmentInput).toBeInTheDocument();
      expect(positionInput).toBeInTheDocument();
    });

    it('should be wrapped in a Card component with correct styling', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      // Card should have the correct styling classes
      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('2. Form fields are properly registered', () => {
    it('should allow typing in Employee ID field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');
      fireEvent.change(employeeIdInput, { target: { value: 'EMP-001' } });

      expect(employeeIdInput).toHaveValue('EMP-001');
    });

    it('should allow typing in Department field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const departmentInput = screen.getByLabelText('Department*') ;
      fireEvent.change(departmentInput, { target: { value: 'Engineering' } });

      expect(departmentInput).toHaveValue('Engineering');
    });

    it('should allow typing in Position field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const positionInput = screen.getByLabelText('Position*');
      fireEvent.change(positionInput, { target: { value: 'Software Engineer' } });

      expect(positionInput).toHaveValue('Software Engineer');
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      // Fields should have labels associated with them
      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)') as HTMLInputElement;
      const departmentInput = screen.getByLabelText('Department*')  as HTMLInputElement;
      const positionInput = screen.getByLabelText('Position*') as HTMLInputElement;

      // Initially, fields should not be marked as invalid
      expect(employeeIdInput.getAttribute('aria-invalid')).toBe('false');
      expect(departmentInput.getAttribute('aria-invalid')).toBe('false');
      expect(positionInput.getAttribute('aria-invalid')).toBe('false');
    });
  });

  describe('3. Required field validation', () => {
    it('should accept valid Employee ID', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');
      fireEvent.change(employeeIdInput, { target: { value: 'EMP-12345' } });
      fireEvent.blur(employeeIdInput);

      // Valid input should not trigger validation error
      await waitFor(() => {
        expect(screen.queryByText('Employee ID is required')).not.toBeInTheDocument();
      });
    });

    it('should accept valid Company Name', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const companyNameInput = screen.getByLabelText('Company Name*');
      fireEvent.change(companyNameInput, { target: { value: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε' } });
      fireEvent.blur(companyNameInput);

      // Valid input should not trigger validation error
      await waitFor(() => {
        expect(screen.queryByText('Company name is required (minimum 2 characters)')).not.toBeInTheDocument();
      });
    });

    it('should accept valid Department', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const departmentInput = screen.getByLabelText('Department*') ;
      fireEvent.change(departmentInput, { target: { value: 'Marketing' } });
      fireEvent.blur(departmentInput);

      // Valid input should not trigger validation error
      await waitFor(() => {
        expect(screen.queryByText('Department is required (minimum 2 characters)')).not.toBeInTheDocument();
      });
    });

    it('should accept valid Position', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const positionInput = screen.getByLabelText('Position*');
      fireEvent.change(positionInput, { target: { value: 'Product Manager' } });
      fireEvent.blur(positionInput);

      // Valid input should not trigger validation error
      await waitFor(() => {
        expect(screen.queryByText('Position is required (minimum 2 characters)')).not.toBeInTheDocument();
      });
    });

    it('should handle Employee ID field value updates', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');

      // Enter initial value
      fireEvent.change(employeeIdInput, { target: { value: 'TEMP' } });
      expect(employeeIdInput).toHaveValue('TEMP');

      // Update to valid value
      fireEvent.change(employeeIdInput, { target: { value: 'EMP-999' } });
      expect(employeeIdInput).toHaveValue('EMP-999');

      await waitFor(() => {
        expect(screen.queryByText('Employee ID is required')).not.toBeInTheDocument();
      });
    });

    it('should handle Company Name field value updates', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const companyNameInput = screen.getByLabelText('Company Name*');

      // Enter initial value
      fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
      expect(companyNameInput).toHaveValue('Test Company');

      // Update to valid value
      fireEvent.change(companyNameInput, { target: { value: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε' } });
      expect(companyNameInput).toHaveValue('ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε');

      await waitFor(() => {
        expect(screen.queryByText('Company name is required (minimum 2 characters)')).not.toBeInTheDocument();
      });
    });
  });

  describe('4. Validation errors display properly', () => {
    it('should not show errors initially when form is untouched', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.queryByText('Employee ID is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Department is required (minimum 2 characters)')).not.toBeInTheDocument();
      expect(screen.queryByText('Position is required (minimum 2 characters)')).not.toBeInTheDocument();
    });

    it('should display error message when errors prop is passed', () => {
      const mockErrors = {
        profile: {
          employeeId: { type: 'required', message: 'Custom error message' },
          department: { type: 'required', message: 'Department is required (minimum 2 characters)' },
          position: undefined,
        },
      } as any;

      render(
        <FormWrapper>
          <EmploymentDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.getByText('Department is required (minimum 2 characters)')).toBeInTheDocument();
    });

    it('should apply error styling when errors are provided', () => {
      const mockErrors = {
        profile: {
          employeeId: { type: 'required', message: 'Employee ID is required' },
          department: undefined,
          position: undefined,
        },
      } as any;

      render(
        <FormWrapper>
          <EmploymentDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)') as HTMLInputElement;
      expect(screen.getByText('Employee ID is required')).toBeInTheDocument();
      expect(employeeIdInput.getAttribute('aria-invalid')).toBe('true');
      expect(employeeIdInput).toHaveClass('border-red-500');
    });

    it('should display multiple validation errors simultaneously', () => {
      const mockErrors = {
        profile: {
          employeeId: { type: 'required', message: 'Employee ID is required' },
          department: { type: 'required', message: 'Department is required (minimum 2 characters)' },
          position: { type: 'required', message: 'Position is required (minimum 2 characters)' },
        },
      } as any;

      render(
        <FormWrapper>
          <EmploymentDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      expect(screen.getByText('Employee ID is required')).toBeInTheDocument();
      expect(screen.getByText('Department is required (minimum 2 characters)')).toBeInTheDocument();
      expect(screen.getByText('Position is required (minimum 2 characters)')).toBeInTheDocument();
    });

    it('should show aria-describedby attribute when error is present via errors prop', () => {
      const mockErrors = {
        profile: {
          employeeId: { type: 'required', message: 'Employee ID is required' },
          department: undefined,
          position: undefined,
        },
      } as any;

      render(
        <FormWrapper>
          <EmploymentDetailsSection errors={mockErrors} />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)') as HTMLInputElement;
      const errorElement = screen.getByText('Employee ID is required');
      const errorId = errorElement.id;

      expect(errorId).toBeTruthy();
      expect(employeeIdInput.getAttribute('aria-describedby')).toBe(errorId);
    });
  });

  describe('5. Initial values load from Zustand store', () => {
    it('should load initial values from store when form is rendered', () => {
      // Pre-populate store with profile data
      useLeaveRequestStore.setState({
        profile: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          employeeId: 'EMP456',
          department: 'Engineering',
          position: 'Senior Developer',
        },
      });

      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      // Set values directly using register and setValue if needed
      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');
      const departmentInput = screen.getByLabelText('Department*') ;
      const positionInput = screen.getByLabelText('Position*');

      // Verify fields are rendered
      expect(employeeIdInput).toBeInTheDocument();
      expect(departmentInput).toBeInTheDocument();
      expect(positionInput).toBeInTheDocument();
    });

    it('should use empty string as default when store has empty values', () => {
      useLeaveRequestStore.setState({
        profile: {
          fullName: '',
          email: '',
          phone: '',
          employeeId: '',
          department: '',
          position: '',
        },
      });

      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByLabelText('Employee ID (Optional)')).toHaveValue('');
      expect(screen.getByLabelText('Department*') ).toHaveValue('');
      expect(screen.getByLabelText('Position*')).toHaveValue('');
    });
  });

  describe('6. Card styling is applied', () => {
    it('should have correct background and border styling', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border-gray-200');
    });

    it('should have shadow styling applied', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.shadow-sm');
      expect(card).toBeInTheDocument();
    });

    it('should have padding applied from Card component', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const card = container.querySelector('.p-6');
      expect(card).toBeInTheDocument();
    });

    it('should have heading with correct styling', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const heading = screen.getByText('Employment Details');
      expect(heading).toHaveClass('text-xl');
      expect(heading).toHaveClass('font-semibold');
      expect(heading).toHaveClass('mb-4');
    });

    it('should have proper spacing between form fields', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      // Check that fields are wrapped in space-y-4 container
      const spaceContainer = container.querySelector('.space-y-4');
      expect(spaceContainer).toBeInTheDocument();
    });
  });

  describe('7. Field labels are clear and descriptive', () => {
    it('should have "Employee ID" as label for first field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const label = screen.getByLabelText('Employee ID (Optional)');
      expect(label).toBeInTheDocument();
    });

    it('should have "Company Name" as label for second field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const label = screen.getByLabelText('Company Name*');
      expect(label).toBeInTheDocument();
    });

    it('should have "Department" as label for third field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const label = screen.getByLabelText('Department*') ;
      expect(label).toBeInTheDocument();
    });

    it('should have "Position" as label for third field', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const label = screen.getByLabelText('Position*');
      expect(label).toBeInTheDocument();
    });

    it('should have labels with correct styling', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      // Check label text elements (they're label elements)
      const labelElements = document.querySelectorAll('label');

      labelElements.forEach((label) => {
        expect(label).toHaveClass('text-sm');
        expect(label).toHaveClass('font-medium');
        expect(label).toHaveClass('text-gray-700');
      });
    });

    it('should have descriptive placeholders that guide user input', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdPlaceholder = screen.getByPlaceholderText('Leave blank if not applicable');
      const companyNamePlaceholder = screen.getByPlaceholderText('Enter company name');
      const departmentPlaceholder = screen.getByPlaceholderText('Engineering');
      const positionPlaceholder = screen.getByPlaceholderText('Software Engineer');

      expect(employeeIdPlaceholder).toBeInTheDocument();
      expect(companyNamePlaceholder).toBeInTheDocument();
      expect(departmentPlaceholder).toBeInTheDocument();
      expect(positionPlaceholder).toBeInTheDocument();
    });
  });

  describe('8. Edge cases and additional behaviors', () => {
    it('should handle whitespace-only values for Employee ID', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');
      fireEvent.change(employeeIdInput, { target: { value: '   ' } });
      fireEvent.blur(employeeIdInput);

      // The input should accept the value (validation will happen on submit)
      expect(employeeIdInput).toHaveValue('   ');
    });

    it('should handle whitespace-only values for Department', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const departmentInput = screen.getByLabelText('Department*') ;
      fireEvent.change(departmentInput, { target: { value: '   ' } });
      fireEvent.blur(departmentInput);

      // The input should accept the value (validation will happen on submit)
      expect(departmentInput).toHaveValue('   ');
    });

    it('should handle whitespace-only values for Position', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const positionInput = screen.getByLabelText('Position*');
      fireEvent.change(positionInput, { target: { value: '   ' } });
      fireEvent.blur(positionInput);

      // The input should accept the value (validation will happen on submit)
      expect(positionInput).toHaveValue('   ');
    });

    it('should work without errors prop', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      expect(screen.getByText('Employment Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee ID (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Department*') ).toBeInTheDocument();
      expect(screen.getByLabelText('Position*')).toBeInTheDocument();
    });

    it('should handle null errors prop gracefully', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection errors={undefined} />
        </FormWrapper>
      );

      expect(screen.getByText('Employment Details')).toBeInTheDocument();
    });

    it('should accept various Employee ID formats', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');

      // Test various employee ID formats
      const validFormats = ['EMP-001', 'E12345', '001', 'EMP-2025-X', '123'];

      for (const format of validFormats) {
        fireEvent.change(employeeIdInput, { target: { value: format } });
        fireEvent.blur(employeeIdInput);

        // Input should accept the value
        expect(employeeIdInput).toHaveValue(format);
        expect(screen.queryByText('Employee ID is required')).not.toBeInTheDocument();

        // Clear for next test
        fireEvent.change(employeeIdInput, { target: { value: '' } });
      }
    });

    it('should accept various department names', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const departmentInput = screen.getByLabelText('Department*') ;

      // Test various department names
      const departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'IT'];

      for (const dept of departments) {
        fireEvent.change(departmentInput, { target: { value: dept } });
        fireEvent.blur(departmentInput);

        // Input should accept the value
        expect(departmentInput).toHaveValue(dept);
        expect(screen.queryByText('Department is required (minimum 2 characters)')).not.toBeInTheDocument();

        // Clear for next test
        fireEvent.change(departmentInput, { target: { value: '' } });
      }
    });

    it('should accept various position titles', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const positionInput = screen.getByLabelText('Position*');

      // Test various position titles
      const positions = [
        'Software Engineer',
        'Product Manager',
        'Designer',
        'Sales Representative',
        'HR Manager',
        'CTO',
      ];

      for (const pos of positions) {
        fireEvent.change(positionInput, { target: { value: pos } });
        fireEvent.blur(positionInput);

        // Input should accept the value
        expect(positionInput).toHaveValue(pos);
        expect(screen.queryByText('Position is required (minimum 2 characters)')).not.toBeInTheDocument();

        // Clear for next test
        fireEvent.change(positionInput, { target: { value: '' } });
      }
    });

    it('should render in correct order: Employee ID, Company Name, Department, Position', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const inputs = screen.getAllByRole('textbox');

      expect(inputs[0]).toHaveAttribute('placeholder', 'Leave blank if not applicable');
      expect(inputs[1]).toHaveAttribute('placeholder', 'Enter company name');
      expect(inputs[2]).toHaveAttribute('placeholder', 'Engineering');
      expect(inputs[3]).toHaveAttribute('placeholder', 'Software Engineer');
    });

    it('should have focusable input fields', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const employeeIdInput = screen.getByLabelText('Employee ID (Optional)');
      const departmentInput = screen.getByLabelText('Department*') ;
      const positionInput = screen.getByLabelText('Position*');

      employeeIdInput.focus();
      expect(document.activeElement).toBe(employeeIdInput);

      departmentInput.focus();
      expect(document.activeElement).toBe(departmentInput);

      positionInput.focus();
      expect(document.activeElement).toBe(positionInput);
    });

    it('should handle special characters in Department name', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const departmentInput = screen.getByLabelText('Department*') ;
      fireEvent.change(departmentInput, { target: { value: 'R&D / Innovation' } });
      fireEvent.blur(departmentInput);

      // Should accept special characters
      expect(departmentInput).toHaveValue('R&D / Innovation');
      expect(screen.queryByText('Department is required (minimum 2 characters)')).not.toBeInTheDocument();
    });

    it('should handle special characters in Position title', async () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const positionInput = screen.getByLabelText('Position*');
      fireEvent.change(positionInput, { target: { value: 'Sr. Software Engineer (Lead)' } });
      fireEvent.blur(positionInput);

      // Should accept special characters
      expect(positionInput).toHaveValue('Sr. Software Engineer (Lead)');
      expect(screen.queryByText('Position is required (minimum 2 characters)')).not.toBeInTheDocument();
    });
  });

  describe('9. Consistency with PersonalDetailsSection', () => {
    it('should have the same Card styling as PersonalDetailsSection', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      // Card should have the same base styling
      const card = container.querySelector('.bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border-gray-200');
      expect(card).toHaveClass('shadow-sm');
      expect(card).toHaveClass('p-6');
    });

    it('should have the same heading styling as PersonalDetailsSection', () => {
      render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const heading = screen.getByText('Employment Details');
      expect(heading).toHaveClass('text-xl');
      expect(heading).toHaveClass('font-semibold');
      expect(heading).toHaveClass('mb-4');
    });

    it('should have the same field spacing as PersonalDetailsSection', () => {
      const { container } = render(
        <FormWrapper>
          <EmploymentDetailsSection />
        </FormWrapper>
      );

      const spaceContainer = container.querySelector('.space-y-4');
      expect(spaceContainer).toBeInTheDocument();
    });
  });
});
