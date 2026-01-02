import React, { useEffect } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Card, Select, Textarea } from '../../../../shared/ui';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { useLocaleStore } from '../../state/locale.store';
import { DateRangeField } from '../components/DateRangeField';

interface LeaveDetailsSectionProps {
  errors?: FieldErrors<LeaveRequest>;
}

// Leave type options for dropdown
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
 *
 * Integrates with React Hook Form for validation and state management.
 * Uses shared UI components (Select, Textarea, Card) for consistent styling.
 * The DateRangeField component now handles absence calculation display.
 */
export const LeaveDetailsSection: React.FC<LeaveDetailsSectionProps> = ({ errors }) => {
  const methods = useFormContext<LeaveRequest>();
  const { register, watch } = methods || {};
  const holidays = useLeaveRequestStore(state => state.holidays.holidaySet);
  const setLeaveDraft = useLeaveRequestStore(state => state.setLeaveDraft);
  const { locale } = useLocaleStore();

  // Watch form fields to update Zustand store when they change
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

  return (
    <section aria-labelledby="leave-details-heading">
      <Card>
        <h2 id="leave-details-heading" className="text-xl font-semibold mb-4">
          Leave Details
        </h2>
        <div className="space-y-4">
          <Select
            label="Leave Type"
            options={leaveTypeOptions}
            placeholder="Select leave type"
            {...register?.('leaveType')}
            error={errors?.leaveType?.message}
          />

          <DateRangeField errors={errors} holidaySet={holidays} locale={locale} />

          <Textarea
            label="Reason (Optional)"
            placeholder="Please provide a reason for your leave request..."
            rows={4}
            {...register?.('reason')}
            error={errors?.reason?.message}
          />
        </div>
      </Card>
    </section>
  );
};

