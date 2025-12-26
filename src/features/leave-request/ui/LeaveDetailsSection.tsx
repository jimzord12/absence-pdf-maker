import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { Select } from '../../../shared/ui/Select';
import { Textarea } from '../../../shared/ui/Textarea';
import { Card } from '../../../shared/ui/Card';
import { DateRangeField } from './DateRangeField';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { calculateAbsenceDays } from '../services/absenceDays';
import type { LeaveRequest } from '../model/leaveRequest.types';

interface LeaveDetailsSectionProps {
  errors?: FieldErrors<LeaveRequest>;
}

// Leave type options for the dropdown
const leaveTypeOptions = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'other', label: 'Other' },
];

/**
 * LeaveDetailsSection component
 *
 * Displays form fields for leave information:
 * - Leave Type (select dropdown)
 * - Date Range (start and end dates)
 * - Reason for leave (textarea)
 * - Calculated absence days display
 *
 * Integrates with React Hook Form for validation and state management.
 * Uses shared UI components (Select, Textarea, Card) for consistent styling.
 * Calculates and displays absence days based on selected dates (excluding weekends and holidays).
 */
export const LeaveDetailsSection: React.FC<LeaveDetailsSectionProps> = ({
  errors,
}) => {
  const methods = useFormContext<LeaveRequest>();
  const { register, watch } = methods || {};
  const holidays = useLeaveRequestStore((state) => state.holidays.holidaySet);
  const setLeaveDraft = useLeaveRequestStore((state) => state.setLeaveDraft);

  // Watch the date fields to recalculate absence days when they change
  const startDate = watch?.('startDate');
  const endDate = watch?.('endDate');
  const leaveType = watch?.('leaveType');
  const reason = watch?.('reason');

  // Update the Zustand store when leave draft changes
  useEffect(() => {
    setLeaveDraft({
      leaveType,
      startDate,
      endDate,
      reason,
    });
  }, [leaveType, startDate, endDate, reason, setLeaveDraft]);

  // Calculate absence days when dates are available
  const absenceDaysCalculation = React.useMemo(() => {
    if (startDate && endDate && startDate instanceof Date && endDate instanceof Date) {
      return calculateAbsenceDays(startDate, endDate, holidays);
    }
    return { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
  }, [startDate, endDate, holidays]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Leave Details</h2>
      <div className="space-y-4">
        <Select
          label="Leave Type"
          options={leaveTypeOptions}
          placeholder="Select leave type"
          {...register?.('leaveType')}
          error={errors?.leaveType?.message}
        />

        <DateRangeField errors={errors} />

        <Textarea
          label="Reason (Optional)"
          placeholder="Please provide a reason for your leave request..."
          rows={4}
          {...register?.('reason')}
          error={errors?.reason?.message}
        />

        {/* Display calculated absence days */}
        {startDate && endDate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Absence Calculation</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total Days:</span>
                <span className="ml-2 font-semibold">{absenceDaysCalculation.totalDays}</span>
              </div>
              <div>
                <span className="text-gray-600">Weekend Days:</span>
                <span className="ml-2 font-semibold">{absenceDaysCalculation.weekendDays}</span>
              </div>
              <div>
                <span className="text-gray-600">Holiday Days:</span>
                <span className="ml-2 font-semibold">{absenceDaysCalculation.holidayDays}</span>
              </div>
              <div>
                <span className="text-gray-600">Actual Absence:</span>
                <span className="ml-2 font-semibold text-green-600">{absenceDaysCalculation.absenceDays}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
