import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { UserProfileSchema } from '../model/leaveRequest.schema';
import { downloadFile, readFileAsText } from '../../../shared/lib/file';

/**
 * Exports the current user profile from the Zustand store to a JSON file.
 * The downloaded file is named "user-details.json".
 *
 * @throws Error if the profile is empty or fails to export
 */
export const exportProfileToJson = (): void => {
  const profile = useLeaveRequestStore.getState().profile;

  // Check if profile has any meaningful data
  const hasData = Object.values(profile).some((value) => value && value !== '');

  if (!hasData) {
    throw new Error('No profile data to export. Please fill in your details first.');
  }

  try {
    const jsonContent = JSON.stringify(profile, null, 2);
    downloadFile('user-details.json', jsonContent, 'application/json');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export profile: ${message}`);
  }
};

/**
 * Imports user profile data from a JSON file, validates it against the UserProfileSchema,
 * and updates the Zustand store with the valid data.
 *
 * @param file - The JSON file to import
 * @returns Promise that resolves when the profile is successfully imported
 * @throws Error with descriptive message if:
 *   - File cannot be read
 *   - JSON is invalid
 *   - Data does not match UserProfileSchema
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

    // Validate against UserProfileSchema
    const validationResult = UserProfileSchema.safeParse(dataWithDefaults);

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
  const { setProfile } = useLeaveRequestStore.getState();
  
  // Apply default values for missing fields
  const profileWithDefaults = {
    ...validationResult.data,
    // Ensure Company Name has default if not provided
    companyName: validationResult.data.companyName || 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
  };
  
  setProfile(profileWithDefaults);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please check the file and try again.');
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to import profile: ${message}`);
  }
};
