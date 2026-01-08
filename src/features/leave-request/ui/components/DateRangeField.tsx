import { el } from 'date-fns/locale';
import React, { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { isWeekend } from '../../../../shared/lib/dates';
import { Button } from '../../../../shared/ui/Button';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { calculateAbsenceDays } from '../../services/absenceDays';
import { isHoliday } from '../../services/holidays/holidays.service';
import type { Locale } from '../../state/locale.store';
import './DateRangeField.css';
import { HolidaysLegend } from './HolidaysLegend';

interface DateRangeFieldProps {
  errors?: FieldErrors<LeaveRequest>;
  holidaySet: Set<string>;
  locale?: Locale;
}

interface AbsenceSummary {
  totalDays: number;
  holidayDays: number;
  weekendDays: number;
  absenceDays: number;
  hasDates?: boolean;
}

// CSS class names for modifiers - styles defined in index.css for proper specificity
const MODIFIERS_CLASS_NAMES = {
  holiday: 'rdp-day--holiday',
  weekend: 'rdp-day--weekend',
} as const;

// Footer component for absence calculation display
interface FooterProps extends AbsenceSummary {
  hasDates: boolean;
  tCommon: (key: string, options?: Record<string, unknown>) => string;
  tForms: (key: string, options?: Record<string, unknown>) => string;
}

const Footer: React.FC<FooterProps> = ({
  totalDays,
  holidayDays,
  weekendDays,
  absenceDays,
  hasDates,
  tCommon,
  tForms,
}) => {
  // Helper to display value or em dash when no dates are selected
  const displayValue = (value: number) => (hasDates ? value : '—');

  return (
    <div
      className="mt-4 p-3 bg-info-50 dark:bg-info-950 border border-info-300 dark:border-info-800 rounded-lg"
      role="region"
      aria-live="polite"
    >
      <p className="text-sm text-info-900 dark:text-info-100 font-medium">
        {tCommon('labels.dateRangeSummary')}
      </p>
      <div className="mt-2 space-y-1 text-sm text-info-800 dark:text-info-200">
        <div className="flex justify-between">
          <span>{tForms('leave.absence.totalDays')}:</span>
          <span
            className="font-semibold"
            aria-label={`Total days in range: ${displayValue(totalDays)}`}
          >
            {displayValue(totalDays)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{tForms('leave.absence.holidayDays')}:</span>
          <span
            className="font-semibold"
            aria-label={`Holidays in range: ${displayValue(holidayDays)}`}
          >
            {displayValue(holidayDays)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{tForms('leave.absence.weekendDays')}:</span>
          <span
            className="font-semibold"
            aria-label={`Weekend days in range: ${displayValue(weekendDays)}`}
          >
            {displayValue(weekendDays)}
          </span>
        </div>
        <div className="flex justify-between border-t border-info-300 dark:border-info-800 pt-1">
          <span className="font-semibold">{tForms('leave.absence.absenceDays')}:</span>
          <span
            className="font-bold text-info-700 dark:text-info-300"
            aria-label={`Total absence days: ${displayValue(absenceDays)}`}
          >
            {displayValue(absenceDays)}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * DateRangeField component
 *
 * Displays a calendar-based date range picker with:
 * - Start and end date selection using react-day-picker
 * - Holiday highlighting with distinct style
 * - Weekend visual distinction
 * - Date range validation (start <= end)
 * - Automatic absence days calculation
 * - Locale-aware date formatting (Greek shows DD/MM/YYYY, English shows MM/DD/YYYY)
 *
 * Props:
 * - holidaySet: Set of holiday dates for highlighting
 * - locale: Current locale ('gr' or 'en')
 * - errors: Form validation errors
 *
 * Component uses useFormContext to access form methods (watch, setValue) for reactive updates.
 */
export const DateRangeField: React.FC<DateRangeFieldProps> = ({ errors, holidaySet, locale }) => {
  const { t: tCommon } = useTranslation('common') as {
    t: (key: string, options?: Record<string, unknown>) => string;
  };
  const { t: tForms } = useTranslation('forms') as {
    t: (key: string, options?: Record<string, unknown>) => string;
  };

  const methods = useFormContext<LeaveRequest>();
  const { watch, setValue } = methods || {
    watch: () => undefined,
    setValue: () => {
      /* no-op when form context is not available */
    },
  };

  // Generate ID for accessibility
  const dateFieldId = useId();

  // Get reactive form values via watch
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Custom day modifier for holidays
  const modifiers = useMemo(
    () => ({
      holiday: (date: Date) => isHoliday(date, holidaySet),
      weekend: (date: Date) => isWeekend(date),
    }),
    [holidaySet]
  );

  // Custom day styles for holidays and weekends
  // MODIFIERS_STYLES is already defined as a constant outside the component

  // Get selected range for calendar
  const selectedRange = useMemo(() => {
    if (!startDate || !endDate) {
      return undefined;
    }

    const start = startDate instanceof Date ? new Date(startDate) : startDate;
    const end = endDate instanceof Date ? new Date(endDate) : endDate;

    if (!start || !end) {
      return undefined;
    }

    // Normalize dates to midnight to avoid time component issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Ensure start date is before or equal to end date
    if (end < start) {
      return { from: end, to: start };
    }

    return { from: start, to: end };
  }, [startDate, endDate]);

  // Calculate absence days when dates are available
  const absenceDaysCalculation = useMemo(() => {
    if (!startDate || !endDate) {
      return { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
    }

    const start = startDate instanceof Date ? new Date(startDate) : startDate;
    const end = endDate instanceof Date ? new Date(endDate) : endDate;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
    }

    // Normalize dates to midnight for consistent calculation
    const calcStart = new Date(start);
    calcStart.setHours(0, 0, 0, 0);
    const calcEnd = new Date(end);
    calcEnd.setHours(0, 0, 0, 0);

    return calculateAbsenceDays(calcStart, calcEnd, holidaySet);
  }, [startDate, endDate, holidaySet]);

  // Handle date range selection using form's setValue for proper React re-renders
  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (import.meta.env.DEV) {
      console.log('[DateRangeField] handleSelect called with:', range);
    }

    if (!range) {
      if (import.meta.env.DEV) {
        console.log('[DateRangeField] Clearing dates via setValue');
      }
      setValue('startDate', undefined, { shouldDirty: true, shouldValidate: false });
      setValue('endDate', undefined, { shouldDirty: true, shouldValidate: false });
      return;
    }

    const { from, to } = range;

    // Normalize dates to midnight to avoid time component issues
    let startDateValue: Date | undefined = undefined;
    let endDateValue: Date | undefined = undefined;

    if (from) {
      startDateValue = new Date(from);
      startDateValue.setHours(0, 0, 0, 0);
    }

    if (to) {
      endDateValue = new Date(to);
      endDateValue.setHours(0, 0, 0, 0);
    }

    if (import.meta.env.DEV) {
      console.log('[DateRangeField] Setting dates via setValue:', {
        startDate: startDateValue,
        endDate: endDateValue,
      });
    }

    // Use setValue to update form state - this will trigger watch() to re-render
    setValue('startDate', startDateValue, { shouldDirty: true, shouldValidate: false });
    setValue('endDate', endDateValue, { shouldDirty: true, shouldValidate: false });
  };

  // Handle empty form context gracefully
  if (!methods) {
    return (
      <div className="p-4 bg-warning-50 dark:bg-warning-950 border border-warning-300 dark:border-warning-800 rounded-lg">
        <p className="text-sm text-warning-900 dark:text-warning-100">
          {tCommon('labels.formContextNotAvailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="group" aria-labelledby={`${dateFieldId}-label`}>
      <span
        id={`${dateFieldId}-label`}
        className="block text-sm font-medium text-[color:var(--color-text-primary)]"
      >
        {tCommon('labels.selectDateRange')}
      </span>
      <div className="flex justify-between gap-2">
        <HolidaysLegend />
        <Button
          variant={startDate && endDate ? 'danger' : 'secondary'}
          size="sm"
          disabled={!startDate || !endDate}
          onClick={() => {
            setValue('startDate', undefined, { shouldDirty: true, shouldValidate: false });
            setValue('endDate', undefined, { shouldDirty: true, shouldValidate: false });
          }}
          title={tCommon('labels.clearDatesTooltip')}
          aria-label={tCommon('labels.clearDatesTooltip')}
          className="flex-shrink-0"
        >
          {tCommon('labels.clearDates')}
        </Button>
      </div>
      <div
        className="p-4 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] shadow-sm"
        role="region"
        aria-label={tCommon('labels.calendar')}
      >
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={handleSelect}
          modifiers={modifiers}
          modifiersClassNames={MODIFIERS_CLASS_NAMES}
          numberOfMonths={2}
          captionLayout="dropdown"
          className="rdp"
          locale={locale === 'gr' ? el : undefined}
        />
      </div>
      {(errors?.startDate?.message || errors?.endDate?.message) && (
        <div className="space-y-1" role="alert" aria-live="polite">
          {errors?.startDate?.message && (
            <p className="text-sm text-error-600 dark:text-error-400">{errors.startDate.message}</p>
          )}
          {errors?.endDate?.message && (
            <p className="text-sm text-error-600 dark:text-error-400">{errors.endDate.message}</p>
          )}
        </div>
      )}
      <Footer {...absenceDaysCalculation} hasDates={!!startDate && !!endDate} tCommon={tCommon} tForms={tForms} />
    </div>
  );
};

