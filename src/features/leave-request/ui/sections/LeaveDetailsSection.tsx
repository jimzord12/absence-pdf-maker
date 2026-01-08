import React, { useEffect, useMemo } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Card, Select, Textarea } from '../../../../shared/ui';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { useLocaleStore } from '../../state/locale.store';
import { DateRangeField } from '../components/DateRangeField';

interface LeaveDetailsSectionProps {
  errors?: FieldErrors<LeaveRequest>;
}

/**
 * LeaveDetailsSection component
 *
 * Displays form fields for leave information (Leave Details Form):
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
  const { t } = useTranslation('forms') as { t: (key: string, options?: Record<string, unknown>) => string };

  const leaveTypeOptions = useMemo(
    () => [
      { value: 'annual', label: t('leave.types.annual') },
      { value: 'sick', label: t('leave.types.sick') },
      { value: 'unpaid', label: t('leave.types.unpaid') },
      { value: 'other', label: t('leave.types.other') },
    ],
    [t]
  );

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
        <h2 id="leave-details-heading" className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]">
          {t('leave.heading')}
        </h2>
        <div className="space-y-4">
          <Select
            label={t('leave.leaveType')}
            options={leaveTypeOptions}
            placeholder={t('leave.leaveTypePlaceholder')}
            {...register?.('leaveType')}
            error={errors?.leaveType?.message}
          />

          <DateRangeField errors={errors} holidaySet={holidays} locale={locale} />

          <Textarea
            label={t('leave.reason')}
            placeholder={t('leave.reasonPlaceholder')}
            rows={4}
            {...register?.('reason')}
            error={errors?.reason?.message}
          />
        </div>
      </Card>
    </section>
  );
};

