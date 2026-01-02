import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadFile, readFileAsText } from '../../../shared/lib/file';
import { UserProfile } from '../model/leaveRequest.types';

// Mock the file utility functions
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
  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-import the module to apply updated mocks
    const persistenceModule = await import('./persistence');
    exportProfileToJson = persistenceModule.exportProfileToJson;
    importProfileFromJson = persistenceModule.importProfileFromJson;

    // Reset setProfile and setSignature mocks
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
      exportProfileToJson();

      const expectedExportData = {
        ...validProfile,
        signatureDataUrl,
      };

      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        JSON.stringify(expectedExportData, null, 2),
        'application/json'
      );
    });

    it('should export profile without signature when signature is empty', () => {
      mockGetState.mockReturnValue({
        profile: validProfile,
        signature: { signatureDataUrl: '' },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });

      exportProfileToJson();

      const expectedExportData = {
        ...validProfile,
        signatureDataUrl: undefined,
      };

      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        JSON.stringify(expectedExportData, null, 2),
        'application/json'
      );
    });

    it('should export profile without signature field when signature is null', () => {
      mockGetState.mockReturnValue({
        profile: validProfile,
        signature: { signatureDataUrl: null as any },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });

      exportProfileToJson();

      const expectedExportData = {
        ...validProfile,
        signatureDataUrl: undefined,
      };

      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        JSON.stringify(expectedExportData, null, 2),
        'application/json'
      );
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

      expect(() => exportProfileToJson()).toThrow(
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

      exportProfileToJson();

      const expectedExportData = {
        ...partialProfile,
        signatureDataUrl,
      };

      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        JSON.stringify(expectedExportData, null, 2),
        'application/json'
      );
    });

    it('should propagate error when downloadFile throws', () => {
      (downloadFile as any).mockImplementation(() => {
        throw new Error('Download failed');
      });

      expect(() => exportProfileToJson()).toThrow('Failed to export profile: Download failed');
    });

    it('should propagate error with unknown error type', () => {
      (downloadFile as any).mockImplementation(() => {
        throw 'String error';
      });

      expect(() => exportProfileToJson()).toThrow('Failed to export profile: Unknown error');
    });
  });

  describe('importProfileFromJson', () => {
    const validProfile: UserProfile = {
      fullName: 'John Doe',
      fathersName: 'George Doe',
      email: 'john.doe@example.com',
      phone: '6901234567',
      identityNumber: 'AB-123456', // Valid old ADT format
      employeeId: 'EMP001',
      companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
      department: 'Engineering',
      position: 'Software Developer',
    };

    const signatureDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    beforeEach(() => {
      mockGetState.mockReturnValue({
        profile: {},
        signature: { signatureDataUrl: '' },
        setProfile: mockSetProfile,
        setSignature: mockSetSignature,
      });
    });

    it('should import valid JSON profile and update store', async () => {
      const importData = { ...validProfile, signatureDataUrl };
      const file = new File([JSON.stringify(importData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(importData));

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
    });

    it('should import profile with signature data', async () => {
      const importData = { ...validProfile, signatureDataUrl };
      const file = new File([JSON.stringify(importData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(importData));

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).toHaveBeenCalledWith({ signatureDataUrl });
    });

    it('should import profile without signature (backward compatibility)', async () => {
      // Old JSON format without signatureDataUrl
      const oldJsonData = { ...validProfile };
      const file = new File([JSON.stringify(oldJsonData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(oldJsonData));

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should import profile with empty signature string', async () => {
      const importData = { ...validProfile, signatureDataUrl: '' };
      const file = new File([JSON.stringify(importData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(importData));

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should reject profile with null signatureDataUrl (schema validation error)', async () => {
      const importData = { ...validProfile, signatureDataUrl: null };
      const file = new File([JSON.stringify(importData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(importData));

      // Schema only accepts string or undefined, null should be rejected
      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      await expect(importProfileFromJson(file)).rejects.toThrow('signatureDataUrl');
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should import valid profile and ignore undefined signature', async () => {
      const importData = { ...validProfile, signatureDataUrl: undefined };
      const file = new File([JSON.stringify(importData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(importData));

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should throw error for invalid JSON format', async () => {
      const file = new File(['invalid json {'], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue('invalid json {');

      await expect(importProfileFromJson(file)).rejects.toThrow(
        'Invalid JSON format. Please check the file and try again.'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should throw error for missing required field - fullName', async () => {
      const invalidProfile = { ...validProfile, fullName: '' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const invalidProfile = { ...validProfile, email: 'not-an-email' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should throw error for invalid signatureDataUrl (not a string)', async () => {
      const invalidProfile = { ...validProfile, signatureDataUrl: 12345 as any };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should accept optional employeeId field', async () => {
      const validProfileNoId = { ...validProfile, employeeId: '' };
      const file = new File([JSON.stringify(validProfileNoId)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(validProfileNoId));

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '6901234567',
          identityNumber: 'AB-123456',
          employeeId: '',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: 'Engineering',
          position: 'Software Developer',
        })
      );
    });

    it('should strip extra fields not in schema', async () => {
      const profileWithExtraField = { ...validProfile, signatureDataUrl, extraField: 'should not be here' };
      const file = new File([JSON.stringify(profileWithExtraField)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithExtraField));

      // Zod strips extra fields by default, so this should still succeed
      await importProfileFromJson(file);

      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
    });

    it('should throw error when readFileAsText fails', async () => {
      const file = new File([JSON.stringify(validProfile)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockRejectedValue(new Error('Read error'));

      await expect(importProfileFromJson(file)).rejects.toThrow(
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

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      await expect(importProfileFromJson(file)).rejects.toThrow('fullName');
      await expect(importProfileFromJson(file)).rejects.toThrow('email');
      await expect(importProfileFromJson(file)).rejects.toThrow('signatureDataUrl');
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should handle unknown error type during import', async () => {
      const file = new File([JSON.stringify(validProfile)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockRejectedValue('String error');

      await expect(importProfileFromJson(file)).rejects.toThrow(
        'Failed to import profile: Unknown error'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
      expect(mockSetSignature).not.toHaveBeenCalled();
    });

    it('should validate profile against ProfileExportSchema', async () => {
      const importData = { ...validProfile, signatureDataUrl };
      const file = new File([JSON.stringify(importData)], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(importData));

      await importProfileFromJson(file);

      // The setProfile should be called with validated schema (without signature)
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '6901234567',
          identityNumber: 'AB-123456',
          employeeId: 'EMP001',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: 'Engineering',
          position: 'Software Developer',
        })
      );

      // The setSignature should be called with signature
      expect(mockSetSignature).toHaveBeenCalledWith({ signatureDataUrl });
    });
  });
});
