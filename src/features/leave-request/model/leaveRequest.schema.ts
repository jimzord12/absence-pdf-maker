import { z } from 'zod';

export const UserProfileSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    fathersName: z.string().min(1, "Father's name is required"),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    identityNumber: z.string().min(1, 'Identity number is required'),
    employeeId: z.string().optional(),
    companyName: z.string().min(1, 'Company name is required'),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
  })
  .refine(
    data => {
      const errors: { [key: string]: string } = {};
      if (!data.fullName || data.fullName.trim() === '') {
        errors.fullName = 'Full name is required';
      }
      if (!data.fathersName || data.fathersName.trim() === '') {
        errors.fathersName = "Father's name is required";
      }
      if (!data.email || data.email.trim() === '') {
        errors.email = 'Email is required';
      }
      if (!data.phone || data.phone.trim() === '') {
        errors.phone = 'Phone number is required';
      }
      if (!data.identityNumber || data.identityNumber.trim() === '') {
        errors.identityNumber = 'Identity number is required';
      }
      if (!data.companyName || data.companyName.trim() === '') {
        errors.companyName = 'Company name is required';
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

export const LeaveRequestSchema = z
  .object({
    profile: UserProfileSchema,
    leaveType: z.enum(['annual', 'sick', 'unpaid', 'other']),
    leaveAllowance: z.boolean().default(false),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    reason: z.string().optional(),
    createdAt: z.date(),
    signatureDataUrl: z.string().optional(),
  })
  .refine(data => {
    // Only validate date order if both dates are present
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  }, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

