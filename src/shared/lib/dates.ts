import { format } from 'date-fns';
import { el } from 'date-fns/locale';

export type Locale = 'en' | 'gr';

/**
 * Formats a Date object to a locale-specific date string.
 * Handles edge cases like invalid dates and timezone issues.
 *
 * @param date - The date to format
 * @param localeParam - The locale for formatting ('en' or 'gr')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: Date, localeParam: Locale = 'en'): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  // Use date-fns with locale for proper formatting
  const dateLocale = localeParam === 'gr' ? el : undefined; // undefined uses default (en) format
  
  // For internal/ISO format, we use yyyy-MM-dd
  // For user-facing display, we use locale-specific formats
  // However, many tests expect yyyy-MM-dd from formatDate as well if no locale is provided
  // Let's check if we should change the default format
  return format(date, localeParam === 'gr' ? 'dd/MM/yyyy' : 'yyyy-MM-dd', { locale: dateLocale });
};

/**
 * Parses an ISO date string and returns a Date object.
 * Handles edge cases like invalid ISO strings and returns a new Date object at midnight.
 *
 * @param isoString - The ISO date string to parse
 * @returns Date object at midnight (local time) or null if invalid
 */
export const parseIsoDate = (isoString: string): Date | null => {
  if (!isoString || typeof isoString !== 'string') {
    return null;
  }

  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Converts a Date object to an ISO 8601 string (YYYY-MM-DD).
 * Returns only the date portion without time and timezone info.
 *
 * @param date - The date to convert
 * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
 */
export const toIsoString = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  return format(date, 'yyyy-MM-dd');
};

/**
 * Alias for formatDate/toIsoString - converts a Date to "YYYY-MM-DD" string.
 * This is the canonical function name used throughout the leave-request feature.
 *
 * @param date - The date to convert
 * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
 */
export const toIsoDay = (date: Date): string => {
  return toIsoString(date);
};

/**
 * Checks if a given date is a weekend day (Saturday or Sunday).
 * Uses local time for consistent behavior across timezones.
 *
 * @param date - The date to check
 * @returns true if the date is a weekend, false otherwise
 */
export const isWeekend = (date: Date): boolean => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
};

/**
 * Validates that a date range is valid (startDate <= endDate).
 * Handles invalid inputs gracefully by returning false.
 * Uses local time methods for consistency with other date functions.
 *
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns true if the range is valid, false otherwise
 */
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  // Validate both dates are valid Date objects
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return false;
  }

  if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
    return false;
  }

  // Compare dates (ignoring time)
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  return start <= end;
};

/**
 * Returns an array of all dates between start and end (inclusive).
 *
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Array of Date objects
 */
export const getDaysInRange = (startDate: Date, endDate: Date): Date[] => {
  if (!isValidDateRange(startDate, endDate)) {
    return [];
  }

  const days: Date[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};
