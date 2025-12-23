import { describe, it, expect } from 'vitest';
import { formatDate, parseIsoDate, toIsoString } from './dates';

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
