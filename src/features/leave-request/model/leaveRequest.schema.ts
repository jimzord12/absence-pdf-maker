import { z } from 'zod';

// Greek letters (both uppercase and lowercase) - includes accented characters
const GREEK_LETTERS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏαβγδεζηθικλμνξοπρστυφχψωάέήίόύώϊϋΐΰς';
// Latin letters (both uppercase and lowercase)
const LATIN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Validates Greek and Latin letters only, with spaces and hyphens allowed
 */
const nameRegex = new RegExp('^[' + GREEK_LETTERS + LATIN_LETTERS + ' \\-]+$');

/**
 * Validates phone numbers (simplified - accepts any 10-digit number)
 * Accepts:
 * - 10 digits: 1234567890
 * - With spaces: 123 456 7890
 * - With country code (stripped): +301234567890
 * - Trims whitespace before validation
 * - Strips all spaces and country codes before validation
 * - Requires exactly 10 digits after stripping
 */

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
 * - Requires at least 2 words (e.g., "John Doe", "Γιάννης Παπαδόπουλος")
 * - Hyphens are treated as word separators (e.g., "John-Doe" = 2 words)
 * - Each word must be at least 2 characters
 * - Allows hyphens for compound names (e.g., "Mary-Jane Smith")
 * - Trims whitespace
 */
export const isValidName = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.length < 2) return false;

  if (!nameRegex.test(trimmed)) return false;

  // Split by spaces and hyphens to treat hyphenated parts as separate words
  const words = trimmed.split(/[\s-]+/);

  // Require at least 2 words
  if (words.length < 2) return false;

  // Each word must be at least 2 characters
  for (const word of words) {
    if (word.length < 2) return false;
  }

  return true;
};

/**
 * Validates if a string is a valid single name (Greek or Latin letters)
 * - Requires at least 2 characters
 * - Allows hyphens for compound names (e.g., Jean-Pierre)
 * - Accepts spaces for multi-word names (flexible for various use cases)
 * - Trims whitespace
 */
export const isValidSingleName = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.length < 2) return false;
  return nameRegex.test(trimmed);
};

/**
 * Validates if a string is a valid phone number (simplified)
 * - Trims leading/trailing whitespace
 * - Removes all spaces before validation
 * - Removes country codes (e.g., +30)
 * - Requires exactly 10 digits after stripping country code and spaces
 */
export const isValidGreekPhone = (value: string): boolean => {
  // Trim and remove all spaces
  const processed = value.trim().replace(/\s/g, '');

  // Remove country code if present and extract last 10 digits
  if (processed.startsWith('+')) {
    const final = processed.slice(-10); // Take last 10 characters
    return /^\d{10}$/.test(final);
  }

  // No country code, must be exactly 10 digits
  return /^\d{10}$/.test(processed);
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
        message: 'Full name must contain at least 2 words (Greek or Latin letters only)',
      }),
    fathersName: z
      .string()
      .min(1, "Father's name is required")
      .refine(isValidSingleName, {
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
        message: 'Please enter a valid phone number (10 digits, spaces allowed)',
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

