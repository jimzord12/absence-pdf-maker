import { z } from 'zod';

export const HolidayListSchema = z.array(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format')
);
