import { toIsoString } from '../../../shared/lib/dates';

/**
 * Calculates absence days breakdown for a given date range.
 * Excludes weekends and holidays from the actual absence count.
 *
 * @param startDate - The start date of the absence (inclusive)
 * @param endDate - The end date of the absence (inclusive)
 * @param holidaySet - Set of holiday dates in ISO format (YYYY-MM-DD)
 * @returns Object with breakdown of days by type
 */
export const calculateAbsenceDays = (
  startDate: Date,
  endDate: Date,
  holidaySet: Set<string>
): { totalDays: number; holidayDays: number; weekendDays: number; absenceDays: number } => {
  // Validate dates
  if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
    return { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
  }

  // Normalize dates to midnight to avoid time component issues
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Swap dates if end is before start
  if (end < start) {
    return { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };
  }

  let totalDays = 0;
  let holidayDays = 0;
  let weekendDays = 0;

  // Iterate through all days in range (inclusive)
  const current = new Date(start);
  while (current <= end) {
    totalDays++;

    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    }

    // Check if holiday
    if (holidaySet.has(toIsoString(current))) {
      holidayDays++;
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  // Calculate actual absence days (excluding weekends and holidays)
  const absenceDays = totalDays - weekendDays - holidayDays;

  return { totalDays, holidayDays, weekendDays, absenceDays };
};
