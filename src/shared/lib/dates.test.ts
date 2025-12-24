import { describe, it, expect } from 'vitest';
import {
  formatDate,
  parseIsoDate,
  toIsoString,
  toIsoDay,
  isWeekend,
  isValidDateRange,
  getDaysInRange,
} from './dates';

describe('formatDate', () => {
  it('should format a valid date to YYYY-MM-DD format', () => {
    const date = new Date('2025-12-25T00:00:00.000Z');
    expect(formatDate(date)).toBe('2025-12-25');
  });

  it('should format a date with single digit month correctly', () => {
    const date = new Date('2025-01-05T00:00:00.000Z');
    expect(formatDate(date)).toBe('2025-01-05');
  });

  it('should handle leap year dates correctly', () => {
    const date = new Date('2024-02-29T00:00:00.000Z');
    expect(formatDate(date)).toBe('2024-02-29');
  });

  it('should handle end of year dates', () => {
    const date = new Date('2025-12-31T00:00:00.000Z');
    expect(formatDate(date)).toBe('2025-12-31');
  });

  it('should handle start of year dates', () => {
    const date = new Date('2025-01-01T00:00:00.000Z');
    expect(formatDate(date)).toBe('2025-01-01');
  });

  it('should return empty string for null input', () => {
    expect(formatDate(null as any)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(formatDate(undefined as any)).toBe('');
  });

  it('should return empty string for invalid Date object', () => {
    const invalidDate = new Date('invalid');
    expect(formatDate(invalidDate)).toBe('');
  });

  it('should return empty string for non-Date object', () => {
    expect(formatDate({} as any)).toBe('');
    expect(formatDate('2025-01-01' as any)).toBe('');
  });

  it('should use local date components (timezone independence)', () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    expect(formatDate(date)).toBe(`${year}-${month}-${day}`);
  });
});

describe('parseIsoDate', () => {
  it('should parse a valid ISO date string', () => {
    const result = parseIsoDate('2025-12-25');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2025);
  });

  it('should parse ISO string with time component', () => {
    const result = parseIsoDate('2025-12-25T10:30:00.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2025);
  });

  it('should return null for null input', () => {
    expect(parseIsoDate(null as any)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(parseIsoDate(undefined as any)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseIsoDate('')).toBeNull();
  });

  it('should return null for invalid ISO string', () => {
    expect(parseIsoDate('invalid-date')).toBeNull();
  });

  it('should return null for non-string input', () => {
    expect(parseIsoDate({} as any)).toBeNull();
    expect(parseIsoDate(12345 as any)).toBeNull();
  });

  it('should return null for gibberish string', () => {
    expect(parseIsoDate('not-a-date')).toBeNull();
  });

  it('should handle dates before year 1900', () => {
    const result = parseIsoDate('1899-12-31');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(1899);
  });

  it('should handle dates far in the future', () => {
    const result = parseIsoDate('2100-01-01');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2100);
  });
});

describe('toIsoString', () => {
  it('should convert a valid date to ISO YYYY-MM-DD format', () => {
    const date = new Date('2025-12-25T00:00:00.000Z');
    expect(toIsoString(date)).toBe('2025-12-25');
  });

  it('should pad single digit months and days', () => {
    const date = new Date('2025-01-05T00:00:00.000Z');
    expect(toIsoString(date)).toBe('2025-01-05');
  });

  it('should return empty string for null input', () => {
    expect(toIsoString(null as any)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(toIsoString(undefined as any)).toBe('');
  });

  it('should return empty string for invalid Date object', () => {
    const invalidDate = new Date('invalid');
    expect(toIsoString(invalidDate)).toBe('');
  });

  it('should return empty string for non-Date object', () => {
    expect(toIsoString({} as any)).toBe('');
  });

  it('should handle leap year dates', () => {
    const date = new Date('2024-02-29T00:00:00.000Z');
    expect(toIsoString(date)).toBe('2024-02-29');
  });
});

describe('toIsoDay', () => {
  it('should convert a valid date to ISO YYYY-MM-DD format', () => {
    const date = new Date('2025-12-25T00:00:00.000Z');
    expect(toIsoDay(date)).toBe('2025-12-25');
  });

  it('should pad single digit months and days', () => {
    const date = new Date('2025-01-05T00:00:00.000Z');
    expect(toIsoDay(date)).toBe('2025-01-05');
  });

  it('should return empty string for invalid date', () => {
    expect(toIsoDay(new Date('invalid'))).toBe('');
  });
});

describe('isWeekend', () => {
  it('should return true for Sunday (day 0)', () => {
    const sunday = new Date('2025-12-28T00:00:00.000Z'); // Sunday, Dec 28 2025
    expect(isWeekend(sunday)).toBe(true);
  });

  it('should return true for Saturday (day 6)', () => {
    const saturday = new Date('2025-12-27T00:00:00.000Z'); // Saturday, Dec 27 2025
    expect(isWeekend(saturday)).toBe(true);
  });

  it('should return false for Monday (day 1)', () => {
    const monday = new Date('2025-12-22T00:00:00.000Z'); // Monday, Dec 22 2025
    expect(isWeekend(monday)).toBe(false);
  });

  it('should return false for Friday (day 5)', () => {
    const friday = new Date('2025-12-26T00:00:00.000Z'); // Friday, Dec 26 2025
    expect(isWeekend(friday)).toBe(false);
  });

  it('should return false for Wednesday (day 3)', () => {
    const wednesday = new Date('2025-12-24T00:00:00.000Z'); // Wednesday, Dec 24 2025
    expect(isWeekend(wednesday)).toBe(false);
  });

  it('should return false for null input', () => {
    expect(isWeekend(null as any)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isWeekend(undefined as any)).toBe(false);
  });

  it('should return false for invalid Date object', () => {
    expect(isWeekend(new Date('invalid'))).toBe(false);
  });

  it('should return false for non-Date object', () => {
    expect(isWeekend({} as any)).toBe(false);
  });
});

describe('isValidDateRange', () => {
  it('should return true when startDate equals endDate', () => {
    const start = new Date('2025-12-25');
    const end = new Date('2025-12-25');
    expect(isValidDateRange(start, end)).toBe(true);
  });

  it('should return true when startDate is before endDate', () => {
    const start = new Date('2025-12-25');
    const end = new Date('2025-12-31');
    expect(isValidDateRange(start, end)).toBe(true);
  });

  it('should return false when startDate is after endDate', () => {
    const start = new Date('2025-12-31');
    const end = new Date('2025-12-25');
    expect(isValidDateRange(start, end)).toBe(false);
  });

  it('should return false for null startDate', () => {
    expect(isValidDateRange(null as any, new Date('2025-12-25'))).toBe(false);
  });

  it('should return false for null endDate', () => {
    expect(isValidDateRange(new Date('2025-12-25'), null as any)).toBe(false);
  });

  it('should return false for undefined startDate', () => {
    expect(isValidDateRange(undefined as any, new Date('2025-12-25'))).toBe(false);
  });

  it('should return false for undefined endDate', () => {
    expect(isValidDateRange(new Date('2025-12-25'), undefined as any)).toBe(false);
  });

  it('should return false for invalid startDate', () => {
    expect(isValidDateRange(new Date('invalid'), new Date('2025-12-25'))).toBe(false);
  });

  it('should return false for invalid endDate', () => {
    expect(isValidDateRange(new Date('2025-12-25'), new Date('invalid'))).toBe(false);
  });

  it('should compare only date portions (ignoring time)', () => {
    // Create dates with different times on the same local day
    const start = new Date(2025, 11, 25, 23, 59, 59, 999); // Dec 25, 2025 11:59:59.999 PM
    const end = new Date(2025, 11, 25, 0, 0, 0, 0);      // Dec 25, 2025 12:00:00.000 AM
    expect(isValidDateRange(start, end)).toBe(true); // Same day
  });
});

describe('getDaysInRange', () => {
  it('should return a single date when start equals end', () => {
    const start = new Date('2025-12-25');
    const end = new Date('2025-12-25');
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(1);
    expect(toIsoDay(days[0])).toBe('2025-12-25');
  });

  it('should return all dates in a multi-day range', () => {
    const start = new Date('2025-12-25');
    const end = new Date('2025-12-27');
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(3);
    expect(days.map(toIsoDay)).toEqual(['2025-12-25', '2025-12-26', '2025-12-27']);
  });

  it('should return empty array for invalid date range', () => {
    const start = new Date('2025-12-31');
    const end = new Date('2025-12-25');
    expect(getDaysInRange(start, end)).toEqual([]);
  });

  it('should return empty array for null inputs', () => {
    expect(getDaysInRange(null as any, new Date('2025-12-25'))).toEqual([]);
    expect(getDaysInRange(new Date('2025-12-25'), null as any)).toEqual([]);
  });

  it('should return empty array for invalid Date objects', () => {
    expect(getDaysInRange(new Date('invalid'), new Date('2025-12-25'))).toEqual([]);
    expect(getDaysInRange(new Date('2025-12-25'), new Date('invalid'))).toEqual([]);
  });

  it('should return new Date objects (immutable)', () => {
    const start = new Date('2025-12-25');
    const end = new Date('2025-12-25');
    const days = getDaysInRange(start, end);
    expect(days[0]).not.toBe(start); // Different reference
    expect(days[0]).not.toBe(end); // Different reference
  });

  it('should handle leap year range', () => {
    const start = new Date('2024-02-28');
    const end = new Date('2024-03-01');
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(3);
    expect(days.map(toIsoDay)).toEqual(['2024-02-28', '2024-02-29', '2024-03-01']);
  });

  it('should handle month boundary crossing', () => {
    const start = new Date('2025-01-31');
    const end = new Date('2025-02-02');
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(3);
    expect(days.map(toIsoDay)).toEqual(['2025-01-31', '2025-02-01', '2025-02-02']);
  });

  it('should handle year boundary crossing', () => {
    const start = new Date('2024-12-31');
    const end = new Date('2025-01-02');
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(3);
    expect(days.map(toIsoDay)).toEqual(['2024-12-31', '2025-01-01', '2025-01-02']);
  });

  it('should handle long date ranges', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-31');
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(31);
    expect(toIsoDay(days[0])).toBe('2025-01-01');
    expect(toIsoDay(days[30])).toBe('2025-01-31');
  });
});
