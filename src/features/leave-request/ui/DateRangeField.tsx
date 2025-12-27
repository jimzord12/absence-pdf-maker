import React, { useMemo, useCallback, useId } from 'react';
import { DayPicker } from 'react-day-picker';
import { useFormContext, Controller } from 'react-hook-form';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { isHoliday } from '../services/holidays/holidays.service';
import { calculateAbsenceDays } from '../services/absenceDays';
import { isWeekend } from '../../../shared/lib/dates';
import { HolidaysLegend } from './HolidaysLegend';
import type { LeaveRequest } from '../model/leaveRequest.types';
import type { FieldErrors } from 'react-hook-form';

interface DateRangeFieldProps {
  errors?: FieldErrors<LeaveRequest>;
  holidaySet: Set<string>;
}

interface AbsenceSummary {
  totalDays: number;
  holidayDays: number;
  weekendDays: number;
  absenceDays: number;
}

// Define styles outside component to avoid recreation on each render
const MODIFIERS_STYLES = {
  holiday: {
    backgroundColor: 'var(--color-holiday-bg)',
    color: 'var(--color-holiday-text)',
    fontWeight: 'bold' as const,
  },
  weekend: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
} as const;

const DAY_PICKER_STYLES = {
  root: { display: 'flex', flexDirection: 'column' } as const,
  months: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } as const,
  month: { display: 'flex', flexDirection: 'column', gap: '0.5rem' } as const,
  table: { borderCollapse: 'collapse', width: '100%' } as const,
  head_row: { display: 'flex', justifyContent: 'space-between' } as const,
  head_cell: {
    fontWeight: 'bold',
    fontSize: '0.875rem',
    width: '100%',
    padding: '0.5rem 0',
  } as const,
  row: { display: 'flex', justifyContent: 'space-between' } as const,
  cell: {
    width: '100%',
    padding: '0',
    margin: '0',
  } as const,
  day: {
    width: '100%',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderRadius: '0.25rem',
  } as const,
  selected: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: 'bold',
  } as const,
  range_start: {
    backgroundColor: '#2563eb',
    color: 'white',
    borderTopLeftRadius: '0.25rem',
    borderBottomLeftRadius: '0.25rem',
  } as const,
  range_middle: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  } as const,
  range_end: {
    backgroundColor: '#2563eb',
    color: 'white',
    borderTopRightRadius: '0.25rem',
    borderBottomRightRadius: '0.25rem',
  } as const,
  today: {
    border: '2px solid #2563eb',
  } as const,
  outside: {
    color: '#9ca3af',
    opacity: 0.5,
  } as const,
  disabled: {
    color: '#9ca3af',
    cursor: 'not-allowed',
  } as const,
  hidden: {
    visibility: 'hidden',
  } as const,
  nav_button: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.25rem',
  } as const,
  dropdown: {
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    padding: '0.25rem',
    fontSize: '0.875rem',
  } as const,
  caption_label: {
    fontSize: '0.875rem',
    fontWeight: 'bold',
  } as const,
} as const;

// Footer component for absence calculation display
const Footer: React.FC<AbsenceSummary> = ({
  totalDays,
  holidayDays,
  weekendDays,
  absenceDays,
}) => {
  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" role="region" aria-live="polite">
      <p className="text-sm text-blue-900 font-medium">Date Range Summary</p>
      <div className="mt-2 space-y-1 text-sm text-blue-800">
        <div className="flex justify-between">
          <span>Total Days:</span>
          <span className="font-semibold" aria-label={`Total days in range: ${totalDays}`}>{totalDays}</span>
        </div>
        <div className="flex justify-between">
          <span>Holidays:</span>
          <span className="font-semibold" aria-label={`Holidays in range: ${holidayDays}`}>{holidayDays}</span>
        </div>
        <div className="flex justify-between">
          <span>Weekends:</span>
          <span className="font-semibold" aria-label={`Weekend days in range: ${weekendDays}`}>{weekendDays}</span>
        </div>
        <div className="flex justify-between border-t border-blue-200 pt-1">
          <span className="font-semibold">Absence Days:</span>
          <span className="font-bold text-blue-700" aria-label={`Total absence days: ${absenceDays}`}>{absenceDays}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * DateRangeField component
 *
 * Displays a calendar-based date range picker with:
 * - Start and end date selection
 * - Holiday highlighting with distinct style
 * - Weekend visual distinction
 * - Date range validation (start <= end)
 * - Automatic absence days calculation
 * - Integration with React Hook Form and Zustand store
 *
 * Uses react-day-picker for the calendar UI and integrates with
 * the holiday service and absence calculator.
 */
export const DateRangeField: React.FC<DateRangeFieldProps> = ({ errors, holidaySet }) => {
  const methods = useFormContext<LeaveRequest>();
  const setLeaveDraft = useLeaveRequestStore((state) => state.setLeaveDraft);
  const startDate = methods?.watch('startDate');
  const endDate = methods?.watch('endDate');

  // Custom day modifier for holidays
  const modifiers = useMemo(
    () => ({
      holiday: (date: Date) => isHoliday(date, holidaySet),
      weekend: (date: Date) => isWeekend(date),
    }),
    [holidaySet]
  );

  // Custom day styles for holidays and weekends
  const modifiersStyles = useMemo(() => MODIFIERS_STYLES, []);

  // Generate ID for accessibility
  const dateFieldId = useId();

  // Get selected range for the calendar
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

  // Handle date range changes
  const handleDateChange = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (!range?.from) {
        setLeaveDraft({ startDate: null, endDate: null });
        return;
      }

      const dateFrom = range.from instanceof Date ? new Date(range.from) : range.from;
      const dateTo = range.to ? new Date(range.to) : range.from;

      if (!dateFrom || !dateTo) {
        return;
      }

      // Normalize dates to midnight
      dateFrom.setHours(0, 0, 0, 0);
      dateTo.setHours(0, 0, 0, 0);

      setLeaveDraft({ startDate: dateFrom, endDate: dateTo });
    },
    [setLeaveDraft]
  );

  return (
    <div className="space-y-4">
      {methods ? (
          <Controller
            name="startDate"
            control={methods.control}
            render={() => (
              <div className="space-y-2" role="group" aria-labelledby={`${dateFieldId}-label`}>
                  <label id={`${dateFieldId}-label`} className="block text-sm font-medium text-gray-700">
                    Select Date Range
                  </label>
                  <HolidaysLegend />
                  <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm" role="region" aria-label="Calendar">
                    <DayPicker
                      mode="range"
                      selected={selectedRange}
                      onSelect={handleDateChange}
                      modifiers={modifiers}
                      modifiersStyles={modifiersStyles}
                      numberOfMonths={2}
                      captionLayout="dropdown"
                      className="rdp"
                      styles={DAY_PICKER_STYLES as any}
                    />
                  </div>
                  {(errors?.startDate?.message || errors?.endDate?.message) && (
                    <div className="space-y-1" role="alert" aria-live="polite">
                      {errors?.startDate?.message && (
                        <p className="text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                      {errors?.endDate?.message && (
                        <p className="text-sm text-red-600">{errors.endDate.message}</p>
                      )}
                    </div>
                  )}
                  {absenceDaysCalculation.absenceDays > 0 && <Footer {...absenceDaysCalculation} />}
                </div>
              );
            }}
          />
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Date Range
          </label>
          <p className="text-sm text-gray-500">Form context not available</p>
        </div>
      )}
    </div>
  );
};
