import { z } from 'zod';

export const UserProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
});

export const LeaveRequestSchema = z.object({
  profile: UserProfileSchema,
  leaveType: z.enum(['annual', 'sick', 'unpaid', 'other']),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
  createdAt: z.date(),
  signatureDataUrl: z.string().optional(),
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'End date must be after start date', path: ['endDate'] }
);
