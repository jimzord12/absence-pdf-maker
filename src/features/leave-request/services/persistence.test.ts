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

    // Reset setProfile mock
    mockSetProfile.mockReset();
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

    beforeEach(() => {
      mockGetState.mockReturnValue({
        profile: validProfile,
        setProfile: mockSetProfile,
      });
    });

    it('should export profile to JSON file with valid data', () => {
      exportProfileToJson();

      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        JSON.stringify(validProfile, null, 2),
        'application/json'
      );
    });

    it('should throw error when profile is empty', () => {
      const emptyProfile: UserProfile = {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
      };

      mockGetState.mockReturnValue({
        profile: emptyProfile,
        setProfile: mockSetProfile,
      });

      expect(() => exportProfileToJson()).toThrow(
        'No profile data to export. Please fill in your details first.'
      );
      expect(downloadFile).not.toHaveBeenCalled();
    });

    it('should throw error when profile has only null values', () => {
      const nullProfile = {
        fullName: null,
        email: null,
        phone: null,
        employeeId: null,
        department: null,
        position: null,
      };

      mockGetState.mockReturnValue({
        profile: nullProfile,
        setProfile: mockSetProfile,
      });

      expect(() => exportProfileToJson()).toThrow(
        'No profile data to export. Please fill in your details first.'
      );
      expect(downloadFile).not.toHaveBeenCalled();
    });

    it('should export successfully with partially filled profile', () => {
      const partialProfile: UserProfile = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '',
        employeeId: '',
        department: 'HR',
        position: '',
      };

      mockGetState.mockReturnValue({
        profile: partialProfile,
        setProfile: mockSetProfile,
      });

      exportProfileToJson();

      expect(downloadFile).toHaveBeenCalledWith(
        'user-details.json',
        JSON.stringify(partialProfile, null, 2),
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
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Software Developer',
    };

    const validJson = JSON.stringify(validProfile);

    beforeEach(() => {
      mockGetState.mockReturnValue({
        profile: {},
        setProfile: mockSetProfile,
      });
    });

    it('should import valid JSON profile and update store', async () => {
      const file = new File([validJson], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(validJson);

      await importProfileFromJson(file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
    });

    it('should validate profile against UserProfileSchema', async () => {
      const file = new File([validJson], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue(validJson);

      await importProfileFromJson(file);

      // The setProfile should be called with the validated schema
      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          identityNumber: 'AB123456',
          employeeId: 'EMP001',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: 'Engineering',
          position: 'Software Developer',
        })
      );
    });

    it('should throw error for invalid JSON format', async () => {
      const file = new File(['invalid json {'], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockResolvedValue('invalid json {');

      await expect(importProfileFromJson(file)).rejects.toThrow(
        'Invalid JSON format. Please check the file and try again.'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should throw error for missing required field - fullName', async () => {
      const invalidProfile = { ...validProfile, fullName: '' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const invalidProfile = { ...validProfile, email: 'not-an-email' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should throw error for missing required field - phone', async () => {
      const invalidProfile = { ...validProfile, phone: '' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
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
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          employeeId: '',
          department: 'Engineering',
          position: 'Software Developer',
        })
      );
    });

    it('should throw error for missing required field - department', async () => {
      const invalidProfile = { ...validProfile, department: '' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should throw error for missing required field - position', async () => {
      const invalidProfile = { ...validProfile, position: '' };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should strip extra fields not in schema', async () => {
      const profileWithExtraField = { ...validProfile, extraField: 'should not be here' };
      const file = new File([JSON.stringify(profileWithExtraField)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(profileWithExtraField));

      // Zod strips extra fields by default, so this should still succeed
      await importProfileFromJson(file);

      expect(mockSetProfile).toHaveBeenCalledWith(validProfile);
    });

    it('should throw error when readFileAsText fails', async () => {
      const file = new File([validJson], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockRejectedValue(new Error('Read error'));

      await expect(importProfileFromJson(file)).rejects.toThrow(
        'Failed to import profile: Read error'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should throw descriptive error with multiple validation issues', async () => {
      const invalidProfile = {
        fullName: '',
        email: 'not-an-email',
        phone: '',
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer',
      };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      await expect(importProfileFromJson(file)).rejects.toThrow('fullName');
      await expect(importProfileFromJson(file)).rejects.toThrow('email');
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should handle null values in required fields', async () => {
      const invalidProfile = {
        fullName: null,
        email: 'john@example.com',
        phone: null,
        employeeId: null,
        department: 'Engineering',
        position: 'Developer',
      };
      const file = new File([JSON.stringify(invalidProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(invalidProfile));

      await expect(importProfileFromJson(file)).rejects.toThrow('Invalid profile data:');
      expect(mockSetProfile).not.toHaveBeenCalled();
    });

    it('should accept profile with only required fields', async () => {
      // All fields in UserProfileSchema are required, so this validates that behavior
      const minimalProfile: UserProfile = {
        fullName: 'Min User',
        email: 'min@example.com',
        phone: '555-1234',
        employeeId: 'EMP123',
        department: 'Sales',
        position: 'Sales Rep',
      };
      const file = new File([JSON.stringify(minimalProfile)], 'user-details.json', {
        type: 'application/json',
      });
      (readFileAsText as any).mockResolvedValue(JSON.stringify(minimalProfile));

      await importProfileFromJson(file);

      expect(mockSetProfile).toHaveBeenCalledWith(minimalProfile);
    });

    it('should handle unknown error type during import', async () => {
      const file = new File([validJson], 'user-details.json', { type: 'application/json' });
      (readFileAsText as any).mockRejectedValue('String error');

      await expect(importProfileFromJson(file)).rejects.toThrow(
        'Failed to import profile: Unknown error'
      );
      expect(mockSetProfile).not.toHaveBeenCalled();
    });
  });
});
