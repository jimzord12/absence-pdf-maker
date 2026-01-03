import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { ProfileImportSchema, type ProfileImportResult } from '../model/leaveRequest.schema';
import { downloadFile, readFileAsText } from '../../../shared/lib/file';
import { showSuccess, showWarning } from '../../../shared/lib/toast';

/**
 * Generates a field label for error messages
 */
const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    fullName: 'Full Name',
    fathersName: "Father's Name",
    email: 'Email',
    phone: 'Phone',
    identityNumber: 'Identity Number',
    employeeId: 'Employee ID',
    companyName: 'Company Name',
    department: 'Department',
    position: 'Position',
  };
  return labels[field] || field;
};

/**
 * Exports the current user profile and signature data from the Zustand store to a JSON file.
 * The downloaded file is named "user-details.json" and contains both profile fields
 * and optional signature data URL.
 *
 * @throws Error if the profile is empty or fails to export
 */
export const exportProfileToJson = (): void => {
  const { profile, signature } = useLeaveRequestStore.getState();

  // Check if profile has any meaningful data
  const hasData = Object.values(profile).some((value) => value && value !== '');

  if (!hasData) {
    throw new Error('No profile data to export. Please fill in your details first.');
  }

  try {
    // Combine profile and signature data for export
    const exportData = {
      ...profile,
      signatureDataUrl: signature.signatureDataUrl || undefined,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile('user-details.json', jsonContent, 'application/json');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export profile: ${message}`);
  }
};

/**
 * Imports user profile data from a JSON file, validates it against ProfileImportSchema
 * to accept partial data, and updates both Zustand store and form state.
 *
 * Backward compatibility: Old JSON files without signatureDataUrl field will still import
 * successfully, as the field is optional in the schema.
 *
 * Partial data support: If imported data has missing or invalid fields,
 * valid fields are populated and user is notified via toast about missing/invalid fields.
 *
 * @param file - The JSON file to import
 * @param onSuccess - Optional callback to execute after successful import (e.g., to reset form)
 * @returns Promise that resolves when the profile is successfully imported
 * @throws Error with descriptive message if:
 *   - File cannot be read
 *   - JSON is invalid
 *   - Store update fails
 */
export const importProfileFromJson = async (
  file: File,
  onSuccess?: () => void
): Promise<void> => {
  try {
    // Read file content
    const jsonContent = await readFileAsText(file);

    // Parse JSON
    const parsedData = JSON.parse(jsonContent);

    // Remove null values from parsed data before validation
    // (null is different from missing/undefined - we want to reject invalid types)
    const cleanedData = Object.entries(parsedData).reduce((acc, [key, value]) => {
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    // Validate against ProfileImportSchema (partial - allows missing fields)
    const validationResult = ProfileImportSchema.safeParse(cleanedData);

    if (!validationResult.success) {
      // Build a descriptive error message from Zod validation errors
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${getFieldLabel(issue.path[0] as string) || issue.path.join('.')}: ${issue.message}`
      );
      throw new Error(
        `Invalid profile data:\n${errorMessages.join('\n')}`
      );
    }

    // Get valid imported data
    const validData = validationResult.data;

    // Identify missing fields that should be required
    const missingFields: string[] = [];
    const requiredFields: (keyof ProfileImportResult)[] = [
      'fullName',
      'fathersName',
      'email',
      'phone',
      'identityNumber',
      'companyName',
      'department',
      'position',
    ];

    requiredFields.forEach(field => {
      if (!validData[field] || validData[field] === '') {
        missingFields.push(getFieldLabel(field));
      }
    });

    // Build profile data with defaults
    const profileWithDefaults = {
      fullName: validData.fullName || '',
      fathersName: validData.fathersName || '',
      email: validData.email || '',
      phone: validData.phone || '',
      identityNumber: validData.identityNumber || '',
      employeeId: validData.employeeId || '',
      companyName: validData.companyName || 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
      department: validData.department || '',
      position: validData.position || '',
    };

    // Update Zustand store with imported profile
    const { setProfile, setSignature } = useLeaveRequestStore.getState();
    setProfile(profileWithDefaults);

    // Set signature data if present in the imported data
    if (validData.signatureDataUrl) {
      setSignature({ signatureDataUrl: validData.signatureDataUrl });
    }

    // Show appropriate toast message
    if (missingFields.length > 0) {
      showWarning(
        `Profile imported with missing fields: ${missingFields.join(', ')}. Please fill in the missing information.`,
        { duration: 10000 }
      );
    } else {
      showSuccess('Profile imported successfully!');
    }

    // Call success callback if provided (e.g., to reset form)
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please check the file and try again.');
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to import profile: ${message}`);
  }
};
