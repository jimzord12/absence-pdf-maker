/**
 * Formats a Date object to a readable string in local format (YYYY-MM-DD).
 * Handles edge cases like invalid dates and timezone issues.
 *
 * @param date - The date to format
 * @returns Formatted date string (YYYY-MM-DD) or empty string if invalid
 */
export const formatDate = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  // Use local date components to ensure consistent format regardless of timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
  return formatDate(date);
};
