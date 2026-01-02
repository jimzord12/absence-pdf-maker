import { z } from 'zod';

// Greek letters (both uppercase and lowercase) - includes accented characters
const GREEK_LETTERS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏαβγδεζηθικλμνξοπρστυφχψωάέήίόύώϊϋΐΰς';
// Latin letters (both uppercase and lowercase)
const LATIN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Validates Greek and Latin letters only, with spaces allowed
 */
const nameRegex = new RegExp(`^[${GREEK_LETTERS}${LATIN_LETTERS} ]+$`);

/**
 * Validates Greek phone numbers
 * Accepts: +30XXXXXXXXX (11 digits with +30) or 10 digits starting with 6, 2, or 9
 */
const greekPhoneRegex = /^(\+30[1-9]\d{9}|[269]\d{9})$/;

/**
 * Validates Greek Identity Number (ADT) format
 * Standard ADT: LLLDDDDD where LLL = 3 Greek uppercase letters, DDDDD = 5 digits
 */
const greekAdtRegex = /^[ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ]{3}\d{5}$/;

/**
 * Validates AMKA (Greek Social Security Number)
 * AMKA: 11 digits
 */
const amkaRegex = /^\d{11}$/;

/**
 * Validates Passport number
 * Passport: 2 letters + 7 digits (international format)
 */
const passportRegex = /^[A-Za-z]{2}\d{7}$/;

/**
 * Validates if a string is a valid name (Greek or Latin letters)
 */
export const isValidName = (value: string): boolean => {
  if (value.length < 2) return false;
  return nameRegex.test(value);
};

/**
 * Validates if a string is a valid Greek phone number
 */
export const isValidGreekPhone = (value: string): boolean => {
  return greekPhoneRegex.test(value);
};

/**
 * Validates if a string is a valid Greek ADT
 */
export const isValidGreekAdt = (value: string): boolean => {
  return greekAdtRegex.test(value);
};

/**
 * Validates if a string is a valid AMKA number
 * AMKA checksum validation algorithm:
 * 1. Multiply each digit by alternating weights (2, 1, 2, 1, ...)
 * 2. If result > 9, add the digits together
 * 3. Sum all results
 * 4. Last digit should make the total divisible by 10
 */
export const isValidAmka = (value: string): boolean => {
  if (!amkaRegex.test(value)) return false;

  const digits = value.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let result = digits[i] * (i % 2 === 0 ? 2 : 1);
    if (result > 9) {
      result = Math.floor(result / 10) + (result % 10);
    }
    sum += result;
  }

  const checksum = (10 - (sum % 10)) % 10;
  return checksum === digits[10];
};

/**
 * Validates if a string is a valid Passport number
 */
export const isValidPassport = (value: string): boolean => {
  return passportRegex.test(value);
};

/**
 * Validates if a string is a valid Greek identity number
 * Supports: ADT, AMKA, or Passport format
 */
export const isValidGreekIdentityNumber = (value: string): boolean => {
  return isValidGreekAdt(value) || isValidAmka(value) || isValidPassport(value);
};

export const UserProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .refine(isValidName, {
        message: 'Full name must contain at least 2 characters (Greek or Latin letters only)',
      }),
    fathersName: z
      .string()
      .min(1, "Father's name is required")
      .refine(isValidName, {
        message: "Father's name must contain at least 2 characters (Greek or Latin letters only)",
      }),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address (e.g., name@example.com)'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .refine(isValidGreekPhone, {
        message: 'Please enter a valid Greek phone number (+30XXXXXXXXX or 10 digits)',
      }),
    identityNumber: z
      .string()
      .min(1, 'Identity number is required')
      .refine(isValidGreekIdentityNumber, {
        message: 'Identity number must be valid Greek ADT (e.g., ΑΒΓ12345), AMKA (11 digits), or Passport (AB1234567)',
      }),
    employeeId: z.string().optional(),
    companyName: z.string().min(1, 'Company name is required'),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
  });

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

