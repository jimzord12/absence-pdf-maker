import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import type { LeaveRequest } from '../model/leaveRequest.types';
import { Input } from '../../../shared/ui/Input';

interface DateRangeFieldProps {
  errors?: FieldErrors<LeaveRequest>;
}

/**
 * DateRangeField component
 *
 * Displays form fields for selecting leave date range:
 * - Start Date (date input)
 * - End Date (date input)
 *
 * Integrates with React Hook Form for validation and state management.
 * Uses shared UI components (Input) for consistent styling.
 */
export const DateRangeField: React.FC<DateRangeFieldProps> = ({ errors }) => {
  const methods = useFormContext<LeaveRequest>();
  const { register } = methods || {};

  return (
    <div className="space-y-4">
      <Input
        label="Start Date"
        inputType="date"
        {...register?.('startDate', { valueAsDate: true })}
        error={errors?.startDate?.message}
      />

      <Input
        label="End Date"
        inputType="date"
        {...register?.('endDate', { valueAsDate: true })}
        error={errors?.endDate?.message}
      />
    </div>
  );
};
