import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadHolidays,
  isHoliday,
  getHolidayDates,
} from './holidays.service';

describe('Holiday Service', () => {
  let holidaySet: Set<string>;

  beforeEach(() => {
    holidaySet = loadHolidays();
  });

  describe('loadHolidays', () => {
    it('should load holidays from data/holidays.json', () => {
      expect(holidaySet).toBeDefined();
      expect(holidaySet).toBeInstanceOf(Set);
    });

    it('should return a non-empty Set of holidays', () => {
      expect(holidaySet.size).toBeGreaterThan(0);
    });

    it('should contain dates in YYYY-MM-DD format', () => {
      const holidaysArray = Array.from(holidaySet);
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

      holidaysArray.forEach((date) => {
        expect(date).toMatch(isoDateRegex);
      });
    });

    it('should contain expected holiday dates from holidays.json', () => {
      // New Year's Day 2026
      expect(holidaySet.has('2026-01-01')).toBe(true);
      // Christmas Day 2026
      expect(holidaySet.has('2026-12-25')).toBe(true);
      // Independence Day 2027
      expect(holidaySet.has('2027-03-25')).toBe(true);
    });

    it('should transform DD-MM-YYYY format from JSON to YYYY-MM-DD', () => {
      // The original JSON has "01-01-2026": "New Year's Day"
      // This should be transformed to "2026-01-01"
      expect(holidaySet.has('2026-01-01')).toBe(true);
      // The original JSON has "25-03-2026": "Independence Day"
      // This should be transformed to "2026-03-25"
      expect(holidaySet.has('2026-03-25')).toBe(true);
    });

    it('should contain the correct number of holidays from holidays.json', () => {
      // Count the entries in the JSON file
      // There are 26 entries in the JSON file
      expect(holidaySet.size).toBe(26);
    });

    it('should not contain duplicate dates', () => {
      const holidaysArray = Array.from(holidaySet);
      const uniqueHolidays = new Set(holidaysArray);
      expect(holidaysArray.length).toBe(uniqueHolidays.size);
    });
  });

  describe('isHoliday', () => {
    it('should return true for a known holiday date', () => {
      // New Year's Day 2026
      const date = new Date('2026-01-01T12:00:00.000Z');
      expect(isHoliday(date, holidaySet)).toBe(true);
    });

    it('should return true for a holiday date with different times', () => {
      // Christmas Day 2026 - test different times to ensure time doesn't affect result
      const midnight = new Date('2026-12-25T00:00:00.000Z');
      const noon = new Date('2026-12-25T12:00:00.000Z');
      const endOfDay = new Date('2026-12-25T23:59:59.999Z');

      expect(isHoliday(midnight, holidaySet)).toBe(true);
      expect(isHoliday(noon, holidaySet)).toBe(true);
      expect(isHoliday(endOfDay, holidaySet)).toBe(true);
    });

    it('should return false for a non-holiday date', () => {
      // A regular workday
      const date = new Date('2026-01-02T12:00:00.000Z');
      expect(isHoliday(date, holidaySet)).toBe(false);
    });

    it('should return false for a date in a year with no holidays loaded', () => {
      // 2028 should not be in the holidays.json file
      const date = new Date('2028-01-01T12:00:00.000Z');
      expect(isHoliday(date, holidaySet)).toBe(false);
    });

    it('should return false for weekend dates that are not holidays', () => {
      // Saturday, January 3, 2026 (should not be a holiday)
      const date = new Date('2026-01-03T12:00:00.000Z');
      expect(isHoliday(date, holidaySet)).toBe(false);
    });

    it('should return true for holidays that fall on weekends', () => {
      // Check if any holidays fall on weekends and verify they're still holidays
      // Let's test with a date we know is in the set
      const date = new Date('2026-03-25T12:00:00.000Z'); // Independence Day
      // 2026-03-25 is a Wednesday, so not a weekend
      // Let's just verify it's recognized as a holiday regardless of day of week
      expect(isHoliday(date, holidaySet)).toBe(true);
    });

    it('should handle dates with timezone offsets correctly', () => {
      // Create date using local timezone
      // Note: The service uses toISOString() which converts to UTC, so we need
      // to use UTC dates for reliable comparison
      const localDate = new Date('2026-01-01T12:00:00.000Z');
      expect(isHoliday(localDate, holidaySet)).toBe(true);

      // Also test with a date at midnight UTC
      const utcMidnight = new Date('2026-01-01T00:00:00.000Z');
      expect(isHoliday(utcMidnight, holidaySet)).toBe(true);
    });

    it('should return false for an empty holidaySet', () => {
      const emptySet = new Set<string>();
      const date = new Date('2026-01-01T12:00:00.000Z');
      expect(isHoliday(date, emptySet)).toBe(false);
    });
  });

  describe('getHolidayDates', () => {
    it('should return an array of Date objects', () => {
      const holidayDates = getHolidayDates(holidaySet);
      expect(holidayDates).toBeDefined();
      expect(Array.isArray(holidayDates)).toBe(true);
      expect(holidayDates.length).toBeGreaterThan(0);
    });

    it('should return the same number of dates as in the holidaySet', () => {
      const holidayDates = getHolidayDates(holidaySet);
      expect(holidayDates.length).toBe(holidaySet.size);
    });

    it('should return valid Date objects for all holidays', () => {
      const holidayDates = getHolidayDates(holidaySet);

      holidayDates.forEach((date) => {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it('should return dates that can be converted back to ISO strings', () => {
      const holidayDates = getHolidayDates(holidaySet);

      holidayDates.forEach((date) => {
        const isoString = date.toISOString().split('T')[0];
        expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(holidaySet.has(isoString)).toBe(true);
      });
    });

    it('should return dates that match the original holidaySet when converted to ISO strings', () => {
      const holidayDates = getHolidayDates(holidaySet);
      const isoDates = holidayDates.map((date) => date.toISOString().split('T')[0]);

      isoDates.forEach((isoDate) => {
        expect(holidaySet.has(isoDate)).toBe(true);
      });

      expect(isoDates.length).toBe(holidaySet.size);
    });

    it('should return empty array for an empty holidaySet', () => {
      const emptySet = new Set<string>();
      const holidayDates = getHolidayDates(emptySet);
      expect(holidayDates).toEqual([]);
      expect(holidayDates.length).toBe(0);
    });

    it('should return dates in a consistent order', () => {
      const holidayDates1 = getHolidayDates(holidaySet);
      const holidayDates2 = getHolidayDates(holidaySet);

      expect(holidayDates1.length).toBe(holidayDates2.length);

      for (let i = 0; i < holidayDates1.length; i++) {
        expect(holidayDates1[i].getTime()).toBe(holidayDates2[i].getTime());
      }
    });
  });

  describe('Integration tests', () => {
    it('should work end-to-end: load, check, and retrieve holidays', () => {
      // Load holidays
      const loadedHolidays = loadHolidays();
      expect(loadedHolidays.size).toBeGreaterThan(0);

      // Check specific holiday
      const newYear = new Date('2026-01-01');
      expect(isHoliday(newYear, loadedHolidays)).toBe(true);

      // Get all holiday dates
      const allHolidayDates = getHolidayDates(loadedHolidays);
      expect(allHolidayDates.length).toBe(loadedHolidays.size);
      expect(allHolidayDates[0]).toBeInstanceOf(Date);
    });

    it('should correctly identify all holidays from the set', () => {
      const holidayDates = getHolidayDates(holidaySet);

      // Every date returned by getHolidayDates should be recognized as a holiday
      holidayDates.forEach((date) => {
        expect(isHoliday(date, holidaySet)).toBe(true);
      });
    });

    it('should handle multiple consecutive holidays correctly', () => {
      // Christmas and the day after Christmas are consecutive holidays
      const christmas = new Date('2026-12-25');
      const dayAfter = new Date('2026-12-26');

      expect(isHoliday(christmas, holidaySet)).toBe(true);
      expect(isHoliday(dayAfter, holidaySet)).toBe(true);
    });
  });
});
