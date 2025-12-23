// import { z } from 'zod';

// const HolidayListSchema = z.array(
//   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format')
// );

const toIsoDay = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const loadHolidays = (): Set<string> => {
  // Placeholder - will import holidays.json at build time
  return new Set<string>();
};

export const isHoliday = (date: Date, holidaySet: Set<string>): boolean => {
  return holidaySet.has(toIsoDay(date));
};

export const getHolidayDates = (holidaySet: Set<string>): Date[] => {
  return Array.from(holidaySet).map((dateStr) => new Date(dateStr));
};
