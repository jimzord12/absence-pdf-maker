import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { ProfileExportSchema } from '../model/leaveRequest.schema';
import { downloadFile, readFileAsText } from '../../../shared/lib/file';

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
 * Imports user profile data from a JSON file, validates it against ProfileExportSchema,
 * and updates the Zustand store with the valid profile and optional signature data.
 *
 * Backward compatibility: Old JSON files without signatureDataUrl field will still import
 * successfully, as the field is optional in the schema.
 *
 * @param file - The JSON file to import
 * @returns Promise that resolves when the profile is successfully imported
 * @throws Error with descriptive message if:
 *   - File cannot be read
 *   - JSON is invalid
 *   - Data does not match ProfileExportSchema
 *   - Store update fails
 */
export const importProfileFromJson = async (file: File): Promise<void> => {
  try {
    // Read file content
    const jsonContent = await readFileAsText(file);

    // Parse JSON
    const parsedData = JSON.parse(jsonContent);

    // Apply default values before validation
    const dataWithDefaults = {
      ...parsedData,
      // Ensure Company Name has default if not provided
      companyName: parsedData.companyName || 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
    };

    // Validate against ProfileExportSchema (includes signatureDataUrl)
    const validationResult = ProfileExportSchema.safeParse(dataWithDefaults);

    if (!validationResult.success) {
      // Build a descriptive error message from Zod validation errors
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      throw new Error(
        `Invalid profile data:\n${errorMessages.join('\n')}`
      );
    }

    // Update Zustand store with validated profile
    const { setProfile, setSignature } = useLeaveRequestStore.getState();

    // Extract signatureDataUrl separately from profile data
    const { signatureDataUrl, ...profileData } = validationResult.data;

    // Apply default values for missing profile fields
    const profileWithDefaults = {
      ...profileData,
      // Ensure Company Name has default if not provided
      companyName: profileData.companyName || 'ICS ΚΑΡΑΦΥΛΗΣ Α.Ε',
    };

    setProfile(profileWithDefaults);

    // Set signature data if present in the imported data
    if (signatureDataUrl) {
      setSignature({ signatureDataUrl });
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please check the file and try again.');
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to import profile: ${message}`);
  }
};
