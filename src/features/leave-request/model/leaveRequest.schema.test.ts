import { describe, it, expect } from 'vitest';
import {
  UserProfileSchema,
  LeaveRequestSchema,
  isValidName,
  isValidSingleName,
  isValidGreekPhone,
  isValidGreekAdt,
  isValidAmka,
  isValidPassport,
  isValidGreekIdentityNumber,
} from './leaveRequest.schema';
import { HolidayListSchema } from './holidays.schema';

describe('Name Validation', () => {
  describe('isValidName', () => {
    it('should accept valid Latin names', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('George Papadopoulos')).toBe(true);
    });

    it('should accept valid Greek names', () => {
      expect(isValidName('Γιάννης Παπαδόπουλος')).toBe(true);
      expect(isValidName('Μαρία Δημητρίου')).toBe(true);
    });

    it('should reject names with special characters', () => {
      expect(isValidName('John@Doe')).toBe(false);
      expect(isValidName('John123')).toBe(false);
      // Hyphens are now allowed for compound names like Mary-Jane
      expect(isValidName('John-Doe')).toBe(true);
    });

    it('should reject names with less than 2 characters', () => {
      expect(isValidName('J')).toBe(false);
      expect(isValidName('')).toBe(false);
    });

    it('should accept names with spaces', () => {
      expect(isValidName('John Michael Doe')).toBe(true);
      expect(isValidName('Γιάννης Αντώνιος Παπαδόπουλος')).toBe(true);
    });

    it('should require at least 2 words in full name', () => {
      expect(isValidName('John')).toBe(false); // Only 1 word
      expect(isValidName('Γιάννης')).toBe(false); // Only 1 word
    });

    it('should require each word to be at least 2 characters', () => {
      expect(isValidName('J D')).toBe(false); // Words too short
      expect(isValidName('A B')).toBe(false); // Words too short
      expect(isValidName('Γ Π')).toBe(false); // Greek words too short
    });

    it('should accept hyphens in names for compound names', () => {
      expect(isValidName('Mary-Jane Smith')).toBe(true);
      expect(isValidName('Jean-Pierre Duval')).toBe(true);
      expect(isValidName('Μαρία-Ελένη Κωνσταντίνου')).toBe(true);
    });

    it('should accept Greek characters in full name', () => {
      expect(isValidName('Γιώργος Παπαδόπουλος')).toBe(true);
      expect(isValidName('Ελένη Δημητρίου')).toBe(true);
      expect(isValidName('Αλέξανδρος Παπαδόπουλος')).toBe(true);
    });
  });

  describe('isValidSingleName', () => {
    it('should accept single word with 2+ characters', () => {
      expect(isValidSingleName('Georgios')).toBe(true);
      expect(isValidSingleName('Γεώργιος')).toBe(true);
      expect(isValidSingleName('Nikolaos')).toBe(true);
      expect(isValidSingleName('Νικόλαος')).toBe(true);
    });

    it('should accept compound names with hyphens', () => {
      expect(isValidSingleName('Jean-Pierre')).toBe(true);
      expect(isValidSingleName('Mary-Jane')).toBe(true);
      expect(isValidSingleName('Μαρία-Ελένη')).toBe(true);
    });

    it('should accept multi-word names (for flexibility)', () => {
      expect(isValidSingleName('John Smith')).toBe(true);
      expect(isValidSingleName('Γεώργιος Παπαδόπουλος')).toBe(true);
    });

    it('should reject single word with 1 character', () => {
      expect(isValidSingleName('G')).toBe(false);
      expect(isValidSingleName('Γ')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidSingleName('')).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(isValidSingleName('John@')).toBe(false);
      expect(isValidSingleName('George123')).toBe(false);
      expect(isValidSingleName('Παπαδόπουλος!')).toBe(false);
    });

    it('should reject names with numbers', () => {
      expect(isValidSingleName('John1')).toBe(false);
      expect(isValidSingleName('Γεώργιος2')).toBe(false);
    });

    it('should accept Greek characters', () => {
      expect(isValidSingleName('Γιώργος')).toBe(true);
      expect(isValidSingleName('Ελένη')).toBe(true);
      expect(isValidSingleName('Αλέξανδρος')).toBe(true);
      expect(isValidSingleName('Μαρία')).toBe(true);
    });

    it('should accept Latin characters', () => {
      expect(isValidSingleName('George')).toBe(true);
      expect(isValidSingleName('Nicholas')).toBe(true);
      expect(isValidSingleName('Alexander')).toBe(true);
      expect(isValidSingleName('Maria')).toBe(true);
    });

    it('should handle spaces at edges', () => {
      expect(isValidSingleName('  Georgios  ')).toBe(true);
    });
  });
});

describe('Phone Validation', () => {
  describe('isValidGreekPhone', () => {
    it('should accept any valid 10-digit phone number', () => {
      expect(isValidGreekPhone('1234567890')).toBe(true);
      expect(isValidGreekPhone('6901234567')).toBe(true);
    });

    it('should accept phone numbers with spaces (they will be stripped)', () => {
      expect(isValidGreekPhone('123 456 7890')).toBe(true);
      expect(isValidGreekPhone('690 123 4567')).toBe(true);
    });

    it('should accept phone numbers with country code (country code is stripped)', () => {
      expect(isValidGreekPhone('+301234567890')).toBe(true);
      expect(isValidGreekPhone('+306901234567')).toBe(true);
      expect(isValidGreekPhone('+302101234567')).toBe(true);
    });

    it('should reject phone numbers with wrong length', () => {
      expect(isValidGreekPhone('690123456')).toBe(false); // 9 digits
      expect(isValidGreekPhone('69012345678')).toBe(false); // 11 digits
    });

    it('should reject phone numbers with letters', () => {
      expect(isValidGreekPhone('69012a4567')).toBe(false);
    });

    it('should reject phone numbers with dashes', () => {
      expect(isValidGreekPhone('123-456-7890')).toBe(false);
    });

    it('should reject phone numbers with special characters', () => {
      expect(isValidGreekPhone('1234567890!')).toBe(false);
      expect(isValidGreekPhone('(123) 456-7890')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(isValidGreekPhone('  1234567890  ')).toBe(true);
      expect(isValidGreekPhone('  +301234567890  ')).toBe(true);
      expect(isValidGreekPhone('  123 456 7890  ')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidGreekPhone('')).toBe(false);
    });

    it('should reject strings with no digits', () => {
      expect(isValidGreekPhone('abcdefghij')).toBe(false);
    });
  });
});

describe('Greek ADT Validation', () => {
  describe('isValidGreekAdt', () => {
    it('should accept valid Greek ADT', () => {
      expect(isValidGreekAdt('ΑΒΓ12345')).toBe(true);
      expect(isValidGreekAdt('ΜΠΑ67890')).toBe(true);
      expect(isValidGreekAdt('ΚΩΝ11111')).toBe(true);
    });

    it('should reject ADT with Latin letters', () => {
      expect(isValidGreekAdt('ABC12345')).toBe(false);
      expect(isValidGreekAdt('abγ12345')).toBe(false);
    });

    it('should reject ADT with wrong letter count', () => {
      expect(isValidGreekAdt('ΑΒ12345')).toBe(false); // 2 letters
      expect(isValidGreekAdt('ΑΒΓΔ12345')).toBe(false); // 4 letters
    });

    it('should reject ADT with wrong digit count', () => {
      expect(isValidGreekAdt('ΑΒΓ1234')).toBe(false); // 4 digits
      expect(isValidGreekAdt('ΑΒΓ123456')).toBe(false); // 6 digits
    });

    it('should reject ADT with special characters', () => {
      expect(isValidGreekAdt('ΑΒΓ-12345')).toBe(false);
      expect(isValidGreekAdt('ΑΒΓ 12345')).toBe(false);
    });
  });
});

describe('AMKA Validation', () => {
  describe('isValidAmka', () => {
    it('should accept valid AMKA with correct checksum', () => {
      // Valid AMKA: 01013000002
      // Checksum calculation: (10 - (8 % 10)) % 10 = 2
      expect(isValidAmka('01013000002')).toBe(true);
    });

    it('should reject AMKA with invalid length', () => {
      expect(isValidAmka('0101300000')).toBe(false); // 10 digits
      expect(isValidAmka('010130000012')).toBe(false); // 12 digits
    });

    it('should reject AMKA with letters', () => {
      expect(isValidAmka('0101300000a')).toBe(false);
    });

    it('should reject AMKA with invalid checksum', () => {
      expect(isValidAmka('01013000001')).toBe(false); // Wrong checksum
    });
  });
});

describe('Passport Validation', () => {
  describe('isValidPassport', () => {
    it('should accept valid passport numbers', () => {
      expect(isValidPassport('AB1234567')).toBe(true);
      expect(isValidPassport('XY9876543')).toBe(true);
      expect(isValidPassport('ab1234567')).toBe(true); // lowercase accepted
    });

    it('should reject passport with wrong format', () => {
      expect(isValidPassport('A1234567')).toBe(false); // 1 letter
      expect(isValidPassport('ABC1234567')).toBe(false); // 3 letters
      expect(isValidPassport('AB123456')).toBe(false); // 6 digits
      expect(isValidPassport('AB12345678')).toBe(false); // 8 digits
    });

    it('should reject passport with special characters', () => {
      expect(isValidPassport('AB-1234567')).toBe(false);
      expect(isValidPassport('AB 1234567')).toBe(false);
    });
  });
});

describe('Greek Identity Number Validation', () => {
  describe('isValidGreekIdentityNumber', () => {
    it('should accept valid Greek ADT', () => {
      expect(isValidGreekIdentityNumber('ΑΒΓ12345')).toBe(true);
    });

    it('should accept valid AMKA', () => {
      expect(isValidGreekIdentityNumber('01013000002')).toBe(true);
    });

    it('should accept valid passport', () => {
      expect(isValidGreekIdentityNumber('AB1234567')).toBe(true);
    });

    it('should reject invalid identity number', () => {
      expect(isValidGreekIdentityNumber('INVALID')).toBe(false);
      expect(isValidGreekIdentityNumber('12345')).toBe(false);
      expect(isValidGreekIdentityNumber('ABC123456')).toBe(false);
    });
  });
});

describe('UserProfileSchema', () => {
  const baseProfile = {
    fullName: 'John Doe',
    fathersName: 'George Doe',
    email: 'john.doe@example.com',
    phone: '+306901234567',
    identityNumber: 'AB1234567',
    employeeId: 'EMP001',
    companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
    department: 'Engineering',
    position: 'Senior Developer',
  };

  it('should validate a valid user profile with Greek phone', () => {
    const result = UserProfileSchema.safeParse(baseProfile);
    expect(result.success).toBe(true);
  });

  it('should validate a valid user profile with Greek name', () => {
    const greekProfile = {
      ...baseProfile,
      fullName: 'Γιάννης Παπαδόπουλος',
      fathersName: 'Γεώργιος Παπαδόπουλος',
    };
    const result = UserProfileSchema.safeParse(greekProfile);
    expect(result.success).toBe(true);
  });

  it('should validate profile with Greek ADT', () => {
    const adtProfile = {
      ...baseProfile,
      identityNumber: 'ΑΒΓ12345',
    };
    const result = UserProfileSchema.safeParse(adtProfile);
    expect(result.success).toBe(true);
  });

  it('should validate profile with AMKA', () => {
    const amkaProfile = {
      ...baseProfile,
      identityNumber: '01013000002',
    };
    const result = UserProfileSchema.safeParse(amkaProfile);
    expect(result.success).toBe(true);
  });

  it('should validate profile with passport', () => {
    const passportProfile = {
      ...baseProfile,
      identityNumber: 'AB1234567',
    };
    const result = UserProfileSchema.safeParse(passportProfile);
    expect(result.success).toBe(true);
  });

  it('should validate profile with 10-digit phone', () => {
    const phoneProfile = {
      ...baseProfile,
      phone: '6901234567',
    };
    const result = UserProfileSchema.safeParse(phoneProfile);
    expect(result.success).toBe(true);
  });

    it('should reject profile with short fullName', () => {
      const invalidProfile = {
        ...baseProfile,
        fullName: 'J',
      };
      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('fullName');
        expect(result.error.issues[0].message).toContain('at least 2 words');
      }
    });

  it('should reject profile with fullName containing numbers', () => {
    const invalidProfile = {
      ...baseProfile,
      fullName: 'John123',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fullName');
      expect(result.error.issues[0].message).toContain('Greek or Latin letters only');
    }
  });

  it('should reject profile with fullName containing special characters', () => {
    const invalidProfile = {
      ...baseProfile,
      fullName: 'John@Doe', // @ is not allowed
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fullName');
      expect(result.error.issues[0].message).toContain('Greek or Latin letters only');
    }
  });

  it('should reject profile with short fathersName', () => {
    const invalidProfile = {
      ...baseProfile,
      fathersName: 'G',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fathersName');
      expect(result.error.issues[0].message).toContain('at least 2 characters');
    }
  });

  it('should reject profile with fathersName containing numbers', () => {
    const invalidProfile = {
      ...baseProfile,
      fathersName: 'George123',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fathersName');
      expect(result.error.issues[0].message).toContain('Greek or Latin letters only');
    }
  });

  it('should reject profile with invalid email format', () => {
    const invalidProfile = {
      ...baseProfile,
      email: 'invalid-email',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
      expect(result.error.issues[0].message).toContain('valid email');
    }
  });

    it('should reject profile with invalid phone number', () => {
      const invalidProfile = {
        ...baseProfile,
        phone: '123456789', // Only 9 digits
      };
      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
        expect(result.error.issues[0].message).toContain('valid phone number');
      }
    });

  it('should accept profile with phone containing spaces', () => {
    const validProfile = {
      ...baseProfile,
      phone: '690 123 4567', // Spaces are now allowed
    };
    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

    it('should reject profile with phone containing dashes', () => {
      const invalidProfile = {
        ...baseProfile,
        phone: '123-456-7890',
      };
      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
        expect(result.error.issues[0].message).toContain('valid phone number');
      }
    });

  it('should reject profile with invalid identity number', () => {
    const invalidProfile = {
      ...baseProfile,
      identityNumber: 'INVALID123',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('identityNumber');
      expect(result.error.issues[0].message).toContain('Greek ADT');
      expect(result.error.issues[0].message).toContain('AMKA');
      expect(result.error.issues[0].message).toContain('Passport');
    }
  });

  it('should reject profile with empty fullName', () => {
    const invalidProfile = {
      ...baseProfile,
      fullName: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fullName');
    }
  });

  it('should reject profile with empty fathersName', () => {
    const invalidProfile = {
      ...baseProfile,
      fathersName: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fathersName');
    }
  });

  it('should reject profile with empty email', () => {
    const invalidProfile = {
      ...baseProfile,
      email: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should reject profile with empty phone', () => {
    const invalidProfile = {
      ...baseProfile,
      phone: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('phone');
    }
  });

  it('should reject profile with empty identityNumber', () => {
    const invalidProfile = {
      ...baseProfile,
      identityNumber: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('identityNumber');
    }
  });

  it('should accept profile with missing employeeId', () => {
    const validProfile = {
      ...baseProfile,
      employeeId: '',
    };
    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employeeId).toBe('');
    }
  });

  it('should reject profile with missing department', () => {
    const invalidProfile = {
      ...baseProfile,
      department: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('department');
    }
  });

  it('should reject profile with missing position', () => {
    const invalidProfile = {
      ...baseProfile,
      position: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('position');
    }
  });

  it('should reject profile with missing companyName', () => {
    const invalidProfile = {
      ...baseProfile,
      companyName: '',
    };
    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('companyName');
    }
  });

  it('should reject profile with extra fields', () => {
    const profileWithExtraField = {
      ...baseProfile,
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
    fathersName: 'George Doe',
    email: 'john.doe@example.com',
    phone: '+306901234567',
    identityNumber: 'AB1234567',
    employeeId: 'EMP001',
    companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
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
