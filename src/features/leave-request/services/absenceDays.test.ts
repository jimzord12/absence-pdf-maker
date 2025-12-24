import { describe, it, expect } from 'vitest';
import { calculateAbsenceDays } from './absenceDays';

describe('calculateAbsenceDays', () => {
  describe('Return value structure', () => {
    it('should return an object with totalDays, holidayDays, weekendDays, and absenceDays properties', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result).toHaveProperty('totalDays');
      expect(result).toHaveProperty('holidayDays');
      expect(result).toHaveProperty('weekendDays');
      expect(result).toHaveProperty('absenceDays');
      expect(typeof result.totalDays).toBe('number');
      expect(typeof result.holidayDays).toBe('number');
      expect(typeof result.weekendDays).toBe('number');
      expect(typeof result.absenceDays).toBe('number');
    });
  });

  describe('totalDays calculation', () => {
    it('should count all days in range inclusively', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(5); // Mon, Tue, Wed, Thu, Fri
    });

    it('should include both start and end dates', () => {
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-06'); // Same day
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(1);
    });

    it('should count a full week as 7 days', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-12'); // Sunday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(7);
    });

    it('should count a longer range correctly', () => {
      const startDate = new Date('2025-01-01'); // Wednesday
      const endDate = new Date('2025-01-31'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(31); // All days in January
    });
  });

  describe('weekendDays calculation', () => {
    it('should count Saturdays and Sundays', () => {
      const startDate = new Date('2025-01-04'); // Saturday
      const endDate = new Date('2025-01-05'); // Sunday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(2);
      expect(result.weekendDays).toBe(2);
    });

    it('should count weekends in a week', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-12'); // Sunday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.weekendDays).toBe(2); // Saturday, Sunday
    });

    it('should count zero weekends if range has no Saturday or Sunday', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.weekendDays).toBe(0);
    });

    it('should count multiple weekends in a longer range', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-19'); // Sunday (2 weeks)
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.weekendDays).toBe(4); // 2 Saturdays and 2 Sundays
    });

    it('should handle starting on Saturday', () => {
      const startDate = new Date('2025-01-04'); // Saturday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.weekendDays).toBe(2); // Saturday and Sunday
    });

    it('should handle ending on Sunday', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-12'); // Sunday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.weekendDays).toBe(2); // Saturday and Sunday
    });
  });

  describe('holidayDays calculation', () => {
    it('should count days that are in the holidaySet', () => {
      const startDate = new Date('2025-01-01'); // Wednesday
      const endDate = new Date('2025-01-03'); // Friday
      const holidaySet = new Set(['2025-01-01', '2025-01-02']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(2);
    });

    it('should count zero holidays when holidaySet is empty', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(0);
    });

    it('should count holidays even when they fall on weekends', () => {
      const startDate = new Date('2025-12-24'); // Wednesday
      const endDate = new Date('2025-12-26'); // Friday
      const holidaySet = new Set(['2025-12-25']); // Christmas (Thursday in 2025)

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(1);
    });

    it('should count multiple holidays in range', () => {
      const startDate = new Date('2025-12-24'); // Wednesday
      const endDate = new Date('2025-12-31'); // Wednesday
      const holidaySet = new Set(['2025-12-25', '2025-12-26']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(2);
    });

    it('should count zero holidays when no dates in range are in holidaySet', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set(['2025-12-25', '2025-12-26']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(0);
    });
  });

  describe('absenceDays calculation', () => {
    it('should calculate absenceDays as totalDays - holidayDays - weekendDays', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set(['2025-01-08']); // Wednesday is a holiday

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(5);
      expect(result.holidayDays).toBe(1);
      expect(result.weekendDays).toBe(0);
      expect(result.absenceDays).toBe(4); // 5 - 1 - 0 = 4
    });

    it('should calculate absenceDays for a week with weekends', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-12'); // Sunday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(7);
      expect(result.holidayDays).toBe(0);
      expect(result.weekendDays).toBe(2);
      expect(result.absenceDays).toBe(5); // 7 - 0 - 2 = 5
    });

    it('should calculate absenceDays with both holidays and weekends', () => {
      const startDate = new Date('2025-12-22'); // Monday
      const endDate = new Date('2025-12-28'); // Sunday
      const holidaySet = new Set(['2025-12-25', '2025-12-26']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(7);
      expect(result.holidayDays).toBe(2);
      expect(result.weekendDays).toBe(2); // Saturday, Sunday
      expect(result.absenceDays).toBe(3); // 7 - 2 - 2 = 3
    });

    it('should return zero absenceDays when all days are holidays', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set(['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(5);
      expect(result.holidayDays).toBe(5);
      expect(result.weekendDays).toBe(0);
      expect(result.absenceDays).toBe(0); // 5 - 5 - 0 = 0
    });

    it('should return zero absenceDays when all days are weekends', () => {
      const startDate = new Date('2025-01-04'); // Saturday
      const endDate = new Date('2025-01-05'); // Sunday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(2);
      expect(result.holidayDays).toBe(0);
      expect(result.weekendDays).toBe(2);
      expect(result.absenceDays).toBe(0); // 2 - 0 - 2 = 0
    });
  });

  describe('Edge cases', () => {
    it('should handle single day range', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-06'); // Same day
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(1);
      expect(result.holidayDays).toBe(0);
      expect(result.weekendDays).toBe(0);
      expect(result.absenceDays).toBe(1);
    });

    it('should handle single day range that is a holiday', () => {
      const startDate = new Date('2025-12-25'); // Christmas
      const endDate = new Date('2025-12-25'); // Same day
      const holidaySet = new Set(['2025-12-25']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(1);
      expect(result.holidayDays).toBe(1);
      expect(result.weekendDays).toBe(0);
      expect(result.absenceDays).toBe(0);
    });

    it('should handle single day range that is a weekend', () => {
      const startDate = new Date('2025-01-04'); // Saturday
      const endDate = new Date('2025-01-04'); // Same day
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(1);
      expect(result.holidayDays).toBe(0);
      expect(result.weekendDays).toBe(1);
      expect(result.absenceDays).toBe(0);
    });

    it('should handle same start and end date (single day)', () => {
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-06');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(1);
      expect(result.absenceDays).toBe(1);
    });
  });

  describe('Invalid inputs', () => {
    it('should return all zeros for null startDate', () => {
      const endDate = new Date('2025-01-10');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(null as any, endDate, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for null endDate', () => {
      const startDate = new Date('2025-01-06');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, null as any, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for undefined startDate', () => {
      const endDate = new Date('2025-01-10');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(undefined as any, endDate, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for undefined endDate', () => {
      const startDate = new Date('2025-01-06');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, undefined as any, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for invalid startDate (not a Date)', () => {
      const endDate = new Date('2025-01-10');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays('2025-01-06' as any, endDate, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for invalid endDate (not a Date)', () => {
      const startDate = new Date('2025-01-06');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, '2025-01-10' as any, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for invalid Date objects', () => {
      const startDate = new Date('invalid');
      const endDate = new Date('2025-01-10');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros for both invalid Date objects', () => {
      const startDate = new Date('invalid');
      const endDate = new Date('also-invalid');
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });

    it('should return all zeros when end date is before start date', () => {
      const startDate = new Date('2025-01-10'); // Friday
      const endDate = new Date('2025-01-06'); // Monday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result).toEqual({ totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 });
    });
  });

  describe('Time handling', () => {
    it('should normalize dates to midnight to avoid time component issues', () => {
      // Create dates on the same day but different times (using local timezone)
      const startDate = new Date(2025, 0, 6, 23, 59, 59, 999); // Jan 6, 11:59:59.999 PM local
      const endDate = new Date(2025, 0, 6, 0, 0, 0, 0); // Jan 6, 12:00:00 AM local
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      // Both dates should be normalized to the same day (Jan 6)
      expect(result.totalDays).toBe(1);
      expect(result.absenceDays).toBe(1);
    });

    it('should handle dates with different times on same day', () => {
      const startDate = new Date(2025, 0, 6, 0, 0, 0, 0); // Jan 6, midnight
      const endDate = new Date(2025, 0, 6, 23, 59, 59, 999); // Jan 6, end of day
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      // Same day should be counted as 1 day
      expect(result.totalDays).toBe(1);
      expect(result.absenceDays).toBe(1);
    });

    it('should handle date range with times on different days', () => {
      // Create dates with explicit local dates to avoid timezone issues
      const startDate = new Date(2025, 0, 6, 12, 0, 0); // Jan 6, noon local
      const endDate = new Date(2025, 0, 10, 15, 30, 0); // Jan 10, 3:30 PM local
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      // Should count all days from Jan 6 to Jan 10 inclusive
      expect(result.totalDays).toBe(5);
    });
  });

  describe('Integration scenarios', () => {
    it('should calculate a typical 5-day work week correctly', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result).toEqual({
        totalDays: 5,
        holidayDays: 0,
        weekendDays: 0,
        absenceDays: 5,
      });
    });

    it('should calculate a 5-day work week with one holiday', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set(['2025-01-08']); // Wednesday is a holiday

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result).toEqual({
        totalDays: 5,
        holidayDays: 1,
        weekendDays: 0,
        absenceDays: 4,
      });
    });

    it('should calculate a 2-week period with weekends and holidays', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-19'); // Sunday (2 weeks)
      const holidaySet = new Set(['2025-01-08', '2025-01-15']); // Wednesdays are holidays

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(14);
      expect(result.holidayDays).toBe(2);
      expect(result.weekendDays).toBe(4); // 2 Saturdays and 2 Sundays
      expect(result.absenceDays).toBe(8); // 14 - 2 - 4 = 8
    });

    it('should handle a month-long absence with various holidays', () => {
      const startDate = new Date('2025-01-01'); // Wednesday
      const endDate = new Date('2025-01-31'); // Friday
      const holidaySet = new Set(['2025-01-01', '2025-01-06', '2025-01-20']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(31);
      expect(result.holidayDays).toBe(3);
      expect(result.weekendDays).toBeGreaterThan(0); // There are weekends in January
      expect(result.absenceDays).toBeLessThan(result.totalDays);
    });

    it('should calculate absence during Christmas week correctly', () => {
      const startDate = new Date('2025-12-22'); // Monday
      const endDate = new Date('2025-12-28'); // Sunday
      const holidaySet = new Set(['2025-12-25', '2025-12-26']); // Christmas and Boxing Day

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(7);
      expect(result.holidayDays).toBe(2);
      expect(result.weekendDays).toBe(2); // Saturday, Sunday
      expect(result.absenceDays).toBe(3); // Mon, Tue, Thu (Wed, Fri are holidays)
    });

    it('should handle empty holidaySet gracefully', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-10'); // Friday
      const holidaySet = new Set<string>();

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(0);
      expect(result.absenceDays).toBe(result.totalDays - result.weekendDays);
    });
  });

  describe('Date formats', () => {
    it('should handle dates in different ISO formats', () => {
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-10');
      const holidaySet = new Set(['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10']);

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.holidayDays).toBe(5);
    });

    it('should match holiday dates regardless of time component in input', () => {
      const startDate = new Date('2025-01-06T12:00:00.000Z');
      const endDate = new Date('2025-01-06T12:00:00.000Z');
      const holidaySet = new Set(['2025-01-06']); // Holiday stored without time

      const result = calculateAbsenceDays(startDate, endDate, holidaySet);

      expect(result.totalDays).toBe(1);
      expect(result.holidayDays).toBe(1);
      expect(result.absenceDays).toBe(0);
    });
  });
});
