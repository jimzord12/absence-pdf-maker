import { z } from 'zod';

export const UserProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
}).refine(
  (data) => {
    // Check for undefined or null values
    const errors: { [key: string]: string } = {};
    if (!data.fullName || data.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    if (!data.email || data.email.trim() === '') {
      errors.email = 'Email is required';
    }
    if (!data.phone || data.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    }
    if (!data.employeeId || data.employeeId.trim() === '') {
      errors.employeeId = 'Employee ID is required';
    }
    if (!data.department || data.department.trim() === '') {
      errors.department = 'Department is required';
    }
    if (!data.position || data.position.trim() === '') {
      errors.position = 'Position is required';
    }
    return Object.keys(errors).length === 0;
  },
  { message: 'Please fill in all required fields' }
);

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

