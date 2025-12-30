import { describe, it, expect } from 'vitest';
import { UserProfileSchema, LeaveRequestSchema } from './leaveRequest.schema';
import { HolidayListSchema } from './holidays.schema';

describe('UserProfileSchema', () => {
  it('should validate a valid user profile', () => {
    const validProfile = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-123-4567',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Developer',
    };
    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validProfile);
    }
  });

  it('should reject profile with missing fullName', () => {
    const invalidProfile = {
      fullName: '',
      email: 'john.doe@example.com',
      phone: '+1 555-123-4567',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Developer',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fullName');
    }
  });

  it('should reject profile with invalid email format', () => {
    const invalidProfile = {
      fullName: 'John Doe',
      email: 'invalid-email',
      phone: '+1 555-123-4567',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Developer',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('should reject profile with missing phone', () => {
    const invalidProfile = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Developer',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('phone');
    }
  });

  it('should accept profile with missing employeeId', () => {
    const validProfile = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-123-4567',
      employeeId: '',
      department: 'Engineering',
      position: 'Senior Developer',
    };
    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employeeId).toBe('');
    }
  });

  it('should reject profile with missing department', () => {
    const invalidProfile = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-123-4567',
      employeeId: 'EMP001',
      department: '',
      position: 'Senior Developer',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('department');
    }
  });

  it('should reject profile with missing position', () => {
    const invalidProfile = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-123-4567',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('position');
    }
  });

  it('should accept profile with unicode characters in name', () => {
    const validProfile = {
      fullName: 'Jürgen Müller',
      email: 'juergen@example.com',
      phone: '+49 123 456789',
      employeeId: 'EMP002',
      department: 'Marketing',
      position: 'Manager',
    };
    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should reject profile with extra fields', () => {
    const profileWithExtraField = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-123-4567',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Developer',
      extraField: 'should be stripped',
    } as any;
    const result = UserProfileSchema.safeParse(profileWithExtraField);
    expect(result.success).toBe(true);
    if (result.success) {
      expect('extraField' in result.data).toBe(false);
    }
  });
});

describe('LeaveRequestSchema', () => {
  const validProfile = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567',
    employeeId: 'EMP001',
    department: 'Engineering',
    position: 'Senior Developer',
  };

  it('should validate a valid leave request with annual leave', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      reason: 'Family vacation',
      createdAt: new Date(),
      signatureDataUrl: 'data:image/png;base64,abc123',
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate leave request with sick leave', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'sick' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-16'),
      reason: 'Doctor appointment',
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate leave request with unpaid leave', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'unpaid' as const,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-05'),
      reason: 'Personal matters',
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate leave request with other leave type', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'other' as const,
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-03-10'),
      reason: 'Jury duty',
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate leave request with single day range', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-15'),
      reason: 'Single day off',
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate leave request without optional reason', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate leave request without optional signature', () => {
    const validRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      reason: 'Vacation',
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject leave request when endDate is before startDate', () => {
    const invalidRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-01-15'),
      reason: 'Invalid dates',
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('endDate');
      expect(result.error.issues[0].message).toContain('End date must be after start date');
    }
  });

  it('should reject leave request with invalid leave type', () => {
    const invalidRequest = {
      profile: validProfile,
      leaveType: 'invalid_type' as any,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject leave request with invalid profile', () => {
    const invalidRequest = {
      profile: {
        fullName: '',
        email: 'invalid-email',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
      },
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject leave request with invalid startDate', () => {
    const invalidRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: 'invalid-date' as any,
      endDate: new Date('2025-01-20'),
      createdAt: new Date(),
    };
    const result = LeaveRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject leave request with invalid createdAt', () => {
    const invalidRequest = {
      profile: validProfile,
      leaveType: 'annual' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      createdAt: 'invalid-date' as any,
    };
    const result = LeaveRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});

describe('HolidayListSchema', () => {
  it('should validate a valid array of ISO date strings', () => {
    const validHolidays = [
      '2025-01-01',
      '2025-12-25',
      '2025-07-04',
    ];
    const result = HolidayListSchema.safeParse(validHolidays);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validHolidays);
    }
  });

  it('should validate an empty array of holidays', () => {
    const emptyHolidays: string[] = [];
    const result = HolidayListSchema.safeParse(emptyHolidays);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('should reject non-array input', () => {
    const result = HolidayListSchema.safeParse('not-an-array');
    expect(result.success).toBe(false);
  });

  it('should reject array with invalid ISO date format', () => {
    const invalidHolidays = [
      '2025-01-01',
      '2025/12/25',
      '2025-07-04',
    ];
    const result = HolidayListSchema.safeParse(invalidHolidays);
    expect(result.success).toBe(false);
  });

  it('should reject array with incomplete date', () => {
    const invalidHolidays = [
      '2025-01-01',
      '2025-12',
    ];
    const result = HolidayListSchema.safeParse(invalidHolidays);
    expect(result.success).toBe(false);
  });

  it('should reject array with non-string elements', () => {
    const invalidHolidays = [
      '2025-01-01',
      20251225,
      '2025-07-04',
    ] as any;
    const result = HolidayListSchema.safeParse(invalidHolidays);
    expect(result.success).toBe(false);
  });

  it('should reject array with gibberish strings', () => {
    const invalidHolidays = [
      'not-a-date',
      'also-not-a-date',
    ];
    const result = HolidayListSchema.safeParse(invalidHolidays);
    expect(result.success).toBe(false);
  });

  it('should accept leap year dates', () => {
    const leapYearHolidays = [
      '2024-02-29',
    ];
    const result = HolidayListSchema.safeParse(leapYearHolidays);
    expect(result.success).toBe(true);
  });

  it('should accept end of month dates', () => {
    const endOfMonthHolidays = [
      '2025-01-31',
      '2025-03-31',
      '2025-04-30',
    ];
    const result = HolidayListSchema.safeParse(endOfMonthHolidays);
    expect(result.success).toBe(true);
  });

  it('should reject array with mixed separators', () => {
    const invalidHolidays = [
      '2025-01-01',
      '2025-12/25',
    ];
    const result = HolidayListSchema.safeParse(invalidHolidays);
    expect(result.success).toBe(false);
  });

  it('should reject date with time component', () => {
    const invalidHolidays = [
      '2025-01-01T00:00:00Z',
    ];
    const result = HolidayListSchema.safeParse(invalidHolidays);
    expect(result.success).toBe(false);
  });
});
