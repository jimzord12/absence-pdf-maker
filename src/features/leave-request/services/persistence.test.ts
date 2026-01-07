import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadFile, readFileAsText } from '../../../shared/lib/file';
import { UserProfile } from '../model/leaveRequest.types';

// Mock file utility functions
vi.mock('../../../shared/lib/file', () => ({
  downloadFile: vi.fn(),
  readFileAsText: vi.fn(),
}));

// Create mock for store module
const mockSetProfile = vi.fn();
const mockSetSignature = vi.fn();
const mockGetState = vi.fn();

vi.mock('../state/leaveRequest.store', () => ({
  useLeaveRequestStore: {
    getState: mockGetState,
  },
}));

// Dynamic import of functions after mocks are set up
let exportProfileToJson: typeof import('./persistence').exportProfileToJson;
let importProfileFromJson: typeof import('./persistence').importProfileFromJson;

describe('persistence', () => {
  const mockT = vi.fn((key: string, options?: Record<string, unknown>) => {
    if (key === 'messages.persistence.noDataToExport') {
      return 'No profile data to export. Please fill in your details first.';
    }
    if (key === 'messages.persistence.exportFailed') {
      return `Failed to export profile: ${options?.message || 'Unknown error'}`;
    }
    if (key === 'messages.persistence.invalidProfileData') {
      return `Invalid profile data:\n${options?.errors || ''}`;
    }
    if (key === 'messages.persistence.importWithMissingFields') {
      return `Profile imported with missing fields: ${options?.fields || ''}. Please fill in the missing information.`;
    }
    if (key === 'messages.persistence.importSuccess') {
      return 'Profile imported successfully!';
    }
    if (key === 'messages.persistence.invalidJsonFormat') {
      return 'Invalid JSON format. Please check the file and try again.';
    }
    if (key === 'messages.persistence.importFailed') {
      return `Failed to import profile: ${options?.message || 'Unknown error'}`;
    }
    if (key.startsWith('messages.fields.')) {
      const field = key.replace('messages.fields.', '');
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
    }
    return key;
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const persistenceModule = await import('./persistence');
    exportProfileToJson = persistenceModule.exportProfileToJson;
    importProfileFromJson = persistenceModule.importProfileFromJson;

    mockSetProfile.mockReset();
    mockSetSignature.mockReset();
  });

  describe('exportProfileToJson', () => {
    const validProfile: UserProfile = {
      fullName: 'John Doe',
      fathersName: 'George Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      identityNumber: 'AB123456',
      employeeId: 'EMP001',
      companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
      department: 'Engineering',
      position: 'Software Developer',
    };

    const signatureDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    beforeEach(() => {
      mockGetState.mockReturnValue({
        profile: validProfile,
        signature: { signatureDataUrl },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });
    });

    it('should export profile with signature data to JSON file', () => {
      exportProfileToJson(mockT);
      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        expect.any(String),
        'application/json'
      );
      const downloadedContent = JSON.parse((downloadFile as any).mock.calls[0][1]);
      expect(downloadedContent).toEqual({
        ...validProfile,
        signatureDataUrl,
      });
    });

    it('should export profile without signature when signature is empty', () => {
      mockGetState.mockReturnValue({
        profile: validProfile,
        signature: { signatureDataUrl: '' },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });

      exportProfileToJson(mockT);
      const downloadedContent = JSON.parse((downloadFile as any).mock.calls[0][1]);
      expect(downloadedContent).not.toHaveProperty('signatureDataUrl');
      expect(downloadedContent).toEqual(validProfile);
    });

    it('should export profile without signature field when signature is null', () => {
      mockGetState.mockReturnValue({
        profile: validProfile,
        signature: { signatureDataUrl: null as any },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });

      exportProfileToJson(mockT);
      const downloadedContent = JSON.parse((downloadFile as any).mock.calls[0][1]);
      expect(downloadedContent).not.toHaveProperty('signatureDataUrl');
    });

    it('should throw error when profile is empty', () => {
      const emptyProfile: UserProfile = {
        fullName: '',
        fathersName: '',
        email: '',
        phone: '',
        identityNumber: '',
        employeeId: '',
        companyName: '',
        department: '',
        position: '',
      };

      mockGetState.mockReturnValue({
        profile: emptyProfile,
        signature: { signatureDataUrl: '' },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });

      expect(() => exportProfileToJson(mockT)).toThrow(
        'No profile data to export. Please fill in your details first.'
      );
      expect(downloadFile).not.toHaveBeenCalled();
    });

    it('should export successfully with partially filled profile', () => {
      const partialProfile: UserProfile = {
        fullName: 'Jane Smith',
        fathersName: '',
        email: 'jane@example.com',
        phone: '',
        identityNumber: '',
        employeeId: '',
        companyName: '',
        department: 'HR',
        position: '',
      };

      mockGetState.mockReturnValue({
        profile: partialProfile,
        signature: { signatureDataUrl },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });

      exportProfileToJson(mockT);
      const downloadedContent = JSON.parse((downloadFile as any).mock.calls[0][1]);
      expect(downloadedContent).toEqual({
        ...partialProfile,
        signatureDataUrl,
      });
    });

    it('should propagate error when downloadFile throws', () => {
      (downloadFile as any).mockImplementation(() => {
        throw new Error('Download failed');
      });

      expect(() => exportProfileToJson(mockT)).toThrow('Failed to export profile: Download failed');
    });

    it('should propagate error with unknown error type', () => {
      (downloadFile as any).mockImplementation(() => {
        throw 'Unknown error';
      });

      expect(() => exportProfileToJson(mockT)).toThrow('Failed to export profile: Unknown error');
    });
  });

  describe('importProfileFromJson', () => {
    const validProfile: UserProfile = {
      fullName: 'John Doe',
      fathersName: 'George Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      identityNumber: 'AB123456',
      employeeId: 'EMP001',
      companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
      department: 'Engineering',
      position: 'Software Developer',
    };

    const signatureDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    it('should import valid JSON profile and update store', async () => {
      const file = new File([JSON.stringify(validProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(validProfile));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
    });

    it('should import profile with signature data', async () => {
      const profileWithSignature = { ...validProfile, signatureDataUrl };
      const file = new File([JSON.stringify(profileWithSignature)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithSignature));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).toHaveBeenCalledWith({ signatureDataUrl });
    });

    it('should import profile without signature (backward compatibility)', async () => {
      const profileWithoutSignature = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      };
      const file = new File(
        [JSON.stringify(profileWithoutSignature)],
        'user-details.json',
        { type: 'application/json' }
      );
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithoutSignature));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should import profile with empty signature string', async () => {
      const profileWithEmptySignature = {
        ...validProfile,
        signatureDataUrl: '',
      };
      const file = new File(
        [JSON.stringify(profileWithEmptySignature)],
        'user-details.json',
        { type: 'application/json' }
      );
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithEmptySignature));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should handle profile with null signatureDataUrl (optional field)', async () => {
      const profileWithNullSignature = {
        ...validProfile,
        signatureDataUrl: null as any,
      };
      const file = new File(
        [JSON.stringify(profileWithNullSignature)],
        'user-details.json',
        { type: 'application/json' }
      );
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithNullSignature));

      // With partial schema, null signature should be accepted and not set
      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should import valid profile and ignore undefined signature', async () => {
      const profileWithoutSignature = { ...validProfile };
      const file = new File([JSON.stringify(profileWithoutSignature)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithoutSignature));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
    });

    it('should throw error for invalid JSON format', async () => {
      const file = new File(['{ invalid json }'], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue('{ invalid json }');

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Invalid JSON format');
    });

    it('should handle partial data missing fullName', async () => {
      const partialProfile = {
        email: 'test@example.com',
        phone: '6901234567',
        identityNumber: 'AB123456',
      };
      const file = new File([JSON.stringify(partialProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(partialProfile));

      // With partial schema, missing fields should be accepted
      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          phone: '6901234567',
          identityNumber: 'AB123456',
          fullName: '',
          fathersName: '',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: '',
          position: '',
        })
      );
    });

    it('should throw error for invalid email format', async () => {
      const invalidProfile = {
        fullName: 'Jane Doe',
        email: 'not-an-email',
        phone: '6901234567',
        identityNumber: 'AB123456',
      };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Invalid profile data:');
      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Email');
    });

    it('should throw error for invalid signatureDataUrl (not a string)', async () => {
      const invalidProfile = { ...validProfile, signatureDataUrl: 123 as any };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Invalid profile data:');
    });

    it('should accept optional employeeId field', async () => {
      const profileWithoutEmployeeId = { ...validProfile };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { employeeId, ...profileToImport } = profileWithoutEmployeeId;
      const file = new File([JSON.stringify(profileToImport)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileToImport));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should strip extra fields not in schema', async () => {
      const profileWithExtraField = {
        ...validProfile,
        extraField: 'should be ignored',
      };
      const file = new File([JSON.stringify(profileWithExtraField)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithExtraField));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: validProfile.fullName,
          email: validProfile.email,
        })
      );
      // Extra field is stripped, signature should only be set if present in data
      // With partial schema, signatureDataUrl from validProfile is used if valid
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should throw error when readFileAsText fails', async () => {
      const file = new File([JSON.stringify(validProfile)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockRejectedValue(new Error('Read error'));

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow(
        'Failed to import profile: Read error'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should throw descriptive error with multiple validation issues', async () => {
      const invalidProfile = {
        fullName: '',
        email: 'not-an-email',
        phone: '',
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer',
        signatureDataUrl: 123 as any,
      };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Invalid profile data:');
      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Full Name');
      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Email');
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should handle unknown error type during import', async () => {
      const file = new File([JSON.stringify(validProfile)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockRejectedValue('String error');

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow(
        'Failed to import profile: Unknown error'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    // NEW TESTS FOR PARTIAL DATA SUPPORT (Task 066)

    it('should accept partial data with only fullName and email', async () => {
      const partialProfile = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
      };
      const file = new File([JSON.stringify(partialProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(partialProfile));

      const onResetMock = vi.fn();
      await expect(importProfileFromJson(file, onResetMock)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          fathersName: '',
          phone: '',
          identityNumber: '',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: '',
          position: '',
        })
      );
      expect(onResetMock).toHaveBeenCalled();
    });

    it('should accept partial data missing identityNumber', async () => {
      const partialProfile = {
        fullName: 'John Doe',
        fathersName: 'Peter',
        email: 'john@example.com',
        phone: '6901234567',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: 'Engineering',
        position: 'Developer',
      };
      const file = new File([JSON.stringify(partialProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(partialProfile));

      const onResetMock = vi.fn();
      await expect(importProfileFromJson(file, onResetMock)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe',
          fathersName: 'Peter',
          email: 'john@example.com',
          phone: '6901234567',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: 'Engineering',
          position: 'Developer',
          identityNumber: '',
        })
      );
    });

    it('should reject invalid email format in partial data', async () => {
      const invalidProfile = {
        fullName: 'Jane Doe',
        email: 'not-an-email',
        phone: '6901234567',
      };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Invalid profile data:');
      await expect(importProfileFromJson(file, mockT)).rejects.toThrow('Email');
    });

    it('should handle empty JSON file', async () => {
      const emptyProfile = {};
      const file = new File([JSON.stringify(emptyProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(emptyProfile));

      await expect(importProfileFromJson(file, mockT)).resolves.not.toThrow();
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          fullName: '',
          fathersName: '',
          email: '',
          phone: '',
          identityNumber: '',
          department: '',
          position: '',
        })
      );
    });
  });
});
