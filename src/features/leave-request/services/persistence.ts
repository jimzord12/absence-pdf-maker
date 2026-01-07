import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { ProfileImportSchema, type ProfileImportResult } from '../model/leaveRequest.schema';
import { downloadFile, readFileAsText } from '../../../shared/lib/file';
import { showSuccess, showWarning } from '../../../shared/lib/toast';

const getFieldLabel = (t: (key: string, options?: Record<string, unknown>) => string, field: string): string => {
  return t(`messages.fields.${field}`);
};

export const exportProfileToJson = (t: (key: string, options?: Record<string, unknown>) => string): void => {
  const { profile, signature } = useLeaveRequestStore.getState();

  const hasData = Object.values(profile).some((value) => value && value !== '');

  if (!hasData) {
    throw new Error(t('messages.persistence.noDataToExport'));
  }

  try {
    const exportData = {
      ...profile,
      signatureDataUrl: signature.signatureDataUrl || undefined,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile('user-details.json', jsonContent, 'application/json');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(t('messages.persistence.exportFailed', { message }));
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
  t: (key: string, options?: Record<string, unknown>) => string,
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
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${getFieldLabel(t, issue.path[0] as string) || issue.path.join('.')}: ${issue.message}`
      );
      throw new Error(
        t('messages.persistence.invalidProfileData', { errors: errorMessages.join('\n') })
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
        missingFields.push(getFieldLabel(t, field));
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
        t('messages.persistence.importWithMissingFields', { fields: missingFields.join(', ') }),
        { duration: 10000 }
      );
    } else {
      showSuccess(t('messages.persistence.importSuccess'));
    }

    // Call success callback if provided (e.g., to reset form)
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(t('messages.persistence.invalidJsonFormat'));
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(t('messages.persistence.importFailed', { message }));
  }
};
