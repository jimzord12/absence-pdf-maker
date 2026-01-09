import { z } from 'zod';

type TranslationFunction = (key: string, options?: Record<string, unknown>) => string;

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
 * Valid letters for Greek ADT (Old Format)
 * Latin: ABEZHIKMNOPTYX
 * Greek equivalents: ΑΒΕΖΗΙΚΜΝΟΠΤΥΧ (visually similar but different Unicode)
 */
const ADT_LATIN_LETTERS = 'ABEZHIKMNOPTYX';
const ADT_GREEK_LETTERS = 'ΑΒΕΖΗΙΚΜΝΟΠΤΥΧ';

/**
 * Validates Greek Identity Number (ADT) format - OLD FORMAT
 * Old ADT: LL-DDDDDD or LLDDDDDD where LL = 2 uppercase letters from ABEZHIKMNOPTYX (or Greek equivalents), optional hyphen, DDDDDD = 6 digits
 */
const greekAdtOldRegex = new RegExp(`^[${ADT_LATIN_LETTERS}${ADT_GREEK_LETTERS}]{2}-?\\d{6}$`);

/**
 * Validates Greek Identity Number - NEW FORMAT
 * New format: 12-character alphanumeric identifier (EU digital identity aligned)
 * Supports both Latin (A-Z) and Greek (Α-Ω) uppercase letters
 */
const greekAdtNewRegex = new RegExp(`^[A-Z0-9${GREEK_LETTERS}]{12}$`, 'i');

/**
 * Validates Greek Passport number
 * Passport: 2 letters + 7 digits, no spaces or delimiters (e.g., AB1234567 or ΑΒ1234567)
 * Supports both Latin and Greek letters
 */
const greekPassportRegex = new RegExp(`^[A-Za-z${GREEK_LETTERS}]{2}\\d{7}$`);

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
 * Validates if a string is a valid phone number
 * Accepts:
 * - 10 digits: 1234567890
 * - With country code: +XX followed by 10 digits (e.g., +30 6901234567)
 * - Spaces and hyphens are stripped before validation
 * - Trims leading/trailing whitespace
 */
export const isValidGreekPhone = (value: string): boolean => {
  // Trim and remove all spaces and hyphens
  const processed = value.trim().replace(/[\s-]/g, '');

  // Check for country code format: +XX followed by 10 digits
  if (processed.startsWith('+')) {
    // Match +XX (2 digits) followed by exactly 10 digits
    return /^\+\d{2}\d{10}$/.test(processed);
  }

  // No country code, must be exactly 10 digits
  return /^\d{10}$/.test(processed);
};

/**
 * Validates if a string is a valid Greek ADT (old format)
 * Format: LL-DDDDDD (e.g., AB-123456)
 */
export const isValidGreekAdtOld = (value: string): boolean => {
  return greekAdtOldRegex.test(value);
};

/**
 * Validates if a string is a valid Greek ADT (new format)
 * Format: 12 alphanumeric characters (e.g., A1B2C3D4E5F6)
 */
export const isValidGreekAdtNew = (value: string): boolean => {
  return greekAdtNewRegex.test(value.toUpperCase());
};

/**
 * Validates if a string is a valid Greek Passport number
 * Format: 2 letters + 7 digits (e.g., AB1234567)
 */
export const isValidGreekPassport = (value: string): boolean => {
  return greekPassportRegex.test(value);
};

/**
 * Validates if a string is a valid Greek identity number
 * Supports: Old ADT (LL-DDDDDD), New ADT (12 alphanumeric), or Greek Passport (LL1234567)
 */
export const isValidGreekIdentityNumber = (value: string): boolean => {
  return isValidGreekAdtOld(value) || isValidGreekAdtNew(value) || isValidGreekPassport(value);
};

/**
 * Factory function that creates a localized UserProfileSchema
 * @param t - i18next translation function
 * @returns A Zod schema for user profile with localized error messages
 */
export const createUserProfileSchema = (t: TranslationFunction) =>
  z.object({
    fullName: z
      .string()
      .min(1, t('validation:required', { field: t('messages:fields.fullName') }))
      .refine(isValidName, {
        message: t('validation:invalidNameFormat'),
      }),
    fathersName: z
      .string()
      .min(1, t('validation:required', { field: t('messages:fields.fathersName') }))
      .refine(isValidSingleName, {
        message: t('validation:invalidFathersNameFormat'),
      }),
    email: z
      .email(t('validation:invalidEmail'))
      .min(1, t('validation:required', { field: t('messages:fields.email') })),
    phone: z
      .string()
      .min(1, t('validation:required', { field: t('messages:fields.phone') }))
      .refine(isValidGreekPhone, {
        message: t('validation:invalidPhone'),
      }),
    identityNumber: z
      .string()
      .min(1, t('validation:required', { field: t('messages:fields.identityNumber') }))
      .refine(isValidGreekIdentityNumber, {
        message: t('validation:invalidIdentityNumber'),
      }),
    employeeId: z.string().optional(),
    companyName: z.string().min(1, t('validation:required', { field: t('messages:fields.companyName') })),
    department: z.string().min(1, t('validation:required', { field: t('messages:fields.department') })),
    position: z.string().min(1, t('validation:required', { field: t('messages:fields.position') })),
  });

// Legacy export for backward compatibility (non-localized)
export const UserProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').refine(isValidName, {
    message: 'Full name must contain at least 2 words (Greek or Latin letters only)',
  }),
  fathersName: z.string().min(1, "Father's name is required").refine(isValidSingleName, {
    message: "Father's name must contain at least 2 characters (Greek or Latin letters only)",
  }),
  email: z
    .email('Please enter a valid email address (e.g., name@example.com)')
    .min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required').refine(isValidGreekPhone, {
    message: 'Please enter a valid phone number (10 digits, spaces allowed)',
  }),
  identityNumber: z
    .string()
    .min(1, 'Identity number is required')
    .refine(isValidGreekIdentityNumber, {
      message:
        'Identity number must be valid: Old ADT (e.g., AB-123456 or ΑΒ-123456), New ID (12 alphanumeric), or Passport (e.g., AB1234567)',
    }),
  employeeId: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
});

/**
 * Factory function that creates a localized LeaveRequestSchema
 * @param t - i18next translation function
 * @returns A Zod schema for leave request with localized error messages
 */
export const createLeaveRequestSchema = (t: TranslationFunction) =>
  z
    .object({
      profile: createUserProfileSchema(t),
      leaveType: z.enum(['annual', 'sick', 'unpaid', 'other']),
      leaveAllowance: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      reason: z.string().optional(),
      createdAt: z.date(),
      signatureDataUrl: z.string().optional(),
    })
    .refine(
      data => {
        if (data.startDate && data.endDate) {
          return data.startDate <= data.endDate;
        }
        return true;
      },
      {
        message: t('validation:endDateBeforeStart'),
        path: ['endDate'],
      }
    );

// Legacy export for backward compatibility (non-localized)
export const LeaveRequestSchema = z
  .object({
    profile: UserProfileSchema,
    leaveType: z.enum(['annual', 'sick', 'unpaid', 'other']),
    leaveAllowance: z.number().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    reason: z.string().optional(),
    createdAt: z.date(),
    signatureDataUrl: z.string().optional(),
  })
  .refine(
    data => {
      // Only validate date order if both dates are present
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

/**
 * Schema for exporting/importing user profile with optional signature data.
 * This includes all UserProfileSchema fields plus optional signatureDataUrl.
 * The signature is optional to maintain backward compatibility with old exports.
 */
export const ProfileExportSchema = z.object({
  ...UserProfileSchema.shape,
  signatureDataUrl: z.string().optional(),
});

/**
 * Schema for importing user profile data with partial support.
 * All fields are optional to allow importing incomplete profiles.
 * Uses safeParse() to validate partial data without throwing errors.
 */
export const ProfileImportSchema = z.object({
  fullName: UserProfileSchema.shape.fullName.optional(),
  fathersName: UserProfileSchema.shape.fathersName.optional(),
  email: UserProfileSchema.shape.email.optional(),
  phone: UserProfileSchema.shape.phone.optional(),
  identityNumber: UserProfileSchema.shape.identityNumber.optional(),
  employeeId: UserProfileSchema.shape.employeeId.optional(),
  companyName: UserProfileSchema.shape.companyName.optional(),
  department: UserProfileSchema.shape.department.optional(),
  position: UserProfileSchema.shape.position.optional(),
  signatureDataUrl: z.string().optional(),
});

export type ProfileImportResult = z.infer<typeof ProfileImportSchema>;

// Export types from factory functions for external use
export type UserProfileSchemaType = ReturnType<typeof createUserProfileSchema>;
export type LeaveRequestSchemaType = ReturnType<typeof createLeaveRequestSchema>;
export type LeaveRequestFormData = z.infer<LeaveRequestSchemaType>;
export type UserProfile = z.infer<UserProfileSchemaType>;

