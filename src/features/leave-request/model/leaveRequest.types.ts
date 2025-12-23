import { z } from 'zod';
import { UserProfileSchema, LeaveRequestSchema } from './leaveRequest.schema';

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;
export type LeaveType = z.infer<typeof LeaveRequestSchema>['leaveType'];
