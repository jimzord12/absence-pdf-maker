import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import type { LeaveRequest } from '../model/leaveRequest.types';

interface EmploymentDetailsSectionProps {
  errors?: FieldErrors<LeaveRequest>;
}

/**
 * EmploymentDetailsSection component
 *
 * Displays form fields for employment information:
 * - Employee ID (text input, optional)
 * - Company Name (text input, with default value)
 * - Department (text input)
 * - Position (text input)
 *
 * Integrates with React Hook Form for validation and state management.
 * Uses shared UI components (Card, Input) for consistent styling.
 * Follows the same pattern as PersonalDetailsSection.
 */
export const EmploymentDetailsSection: React.FC<EmploymentDetailsSectionProps> = ({ errors }) => {
  // Access form context for register function if not passed directly
  // This allows the component to work both with and without FormContext
  const methods = useFormContext<LeaveRequest>();

  const { register } = methods || {};

  return (
    <section aria-labelledby="employment-details-heading">
      <Card>
        <h2 id="employment-details-heading" className="text-xl font-semibold mb-4">
          Employment Details
        </h2>
        <div className="space-y-4">
          <Input
            label="Employee ID (Optional)"
            placeholder="Leave blank if not applicable"
            inputType="text"
            {...register?.('profile.employeeId')}
            error={errors?.profile?.employeeId?.message}
          />

          <Input
            label="Company Name"
            placeholder="Enter company name"
            inputType="text"
            {...register?.('profile.companyName')}
            error={errors?.profile?.companyName?.message}
          />

          <Input
            label="Department"
            placeholder="Engineering"
            inputType="text"
            {...register?.('profile.department')}
            error={errors?.profile?.department?.message}
          />

          <Input
            label="Position"
            placeholder="Software Engineer"
            inputType="text"
            {...register?.('profile.position')}
            error={errors?.profile?.position?.message}
          />
        </div>
      </Card>
    </section>
  );
};

