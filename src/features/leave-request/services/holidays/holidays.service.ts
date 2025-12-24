import holidaysJson from '../../../../../data/holidays.json';

import { HolidayListSchema } from '../../model/holidays.schema';
import { toIsoDay } from '../../../../shared/lib/dates';

/**
 * Transforms holidays from "DD-MM-YYYY" format to "YYYY-MM-DD" format
 * and validates against HolidayListSchema.
 */
const transformAndValidateHolidays = (): Set<string> => {
  const rawHolidays = holidaysJson as Record<string, string>;

  const isoHolidays = Object.keys(rawHolidays).map((dateStr) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  });

  const validatedHolidays = HolidayListSchema.parse(isoHolidays);

  return new Set(validatedHolidays);
};

/**
 * Loads holidays from data/holidays.json and validates them.
 * Returns a Set of ISO date strings ("YYYY-MM-DD") for O(1) lookups.
 */
export const loadHolidays = (): Set<string> => {
  return transformAndValidateHolidays();
};

/**
 * Checks if a given date is a holiday.
 * @param date - The date to check
 * @param holidaySet - The holiday Set from loadHolidays()
 * @returns true if the date is a holiday, false otherwise
 */
export const isHoliday = (date: Date, holidaySet: Set<string>): boolean => {
  return holidaySet.has(toIsoDay(date));
};

/**
 * Gets all holiday dates as Date objects.
 * Useful for calendar highlighting.
 * @param holidaySet - The holiday Set from loadHolidays()
 * @returns Array of Date objects representing all holidays
 */
export const getHolidayDates = (holidaySet: Set<string>): Date[] => {
  return Array.from(holidaySet).map((dateStr) => new Date(dateStr));
};
