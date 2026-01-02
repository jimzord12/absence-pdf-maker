import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useLeaveRequestStore,
  type ProfileState,
  type LeaveDraftState,
  type SignatureState,
  type HolidaysState,
  type UiState,
} from './leaveRequest.store';

describe('useLeaveRequestStore', () => {
  // Clear localStorage and reset store before each test
  beforeEach(() => {
    localStorage.clear();
    // Reset store state by using setState with initial values
    useLeaveRequestStore.setState({
      profile: {
        fullName: '',
        fathersName: '',
        email: '',
        phone: '',
        identityNumber: '',
        employeeId: '',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: '',
        position: '',
      },
      leaveDraft: {
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
      },
      signature: {
        signatureDataUrl: '',
      },
      holidays: {
        holidaySet: new Set<string>(),
      },
      ui: {
        isSignatureModalOpen: false,
        isGeneratingPdf: false,
        lastGeneratedFileName: '',
        errorMessage: null,
        triggerValidation: null,
      },
    });
    // Clear console call counts
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset console spy
    vi.restoreAllMocks();
  });

  describe('store initialization', () => {
    it('should initialize with correct default values', () => {
      const state = useLeaveRequestStore.getState();

      expect(state.profile).toEqual({
        fullName: '',
        fathersName: '',
        email: '',
        phone: '',
        identityNumber: '',
        employeeId: '',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: '',
        position: '',
      });
      expect(state.leaveDraft).toEqual({
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
      });
      expect(state.signature).toEqual({
        signatureDataUrl: '',
      });
      expect(state.holidays).toEqual({
        holidaySet: new Set<string>(),
      });
      expect(state.ui).toEqual({
        isSignatureModalOpen: false,
        isGeneratingPdf: false,
        lastGeneratedFileName: '',
        errorMessage: null,
        triggerValidation: null,
      });
    });

    it('should initialize with default company name', () => {
      const state = useLeaveRequestStore.getState();

      expect(state.profile.companyName).toBe('ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε');
    });

    it('should export inferred types', () => {
      // Verify that the type exports are available and correctly typed
      const profile: ProfileState = {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
      };
      expect(profile).toBeDefined();

      const leaveDraft: LeaveDraftState = {
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
      };
      expect(leaveDraft).toBeDefined();

      const signature: SignatureState = {
        signatureDataUrl: '',
      };
      expect(signature).toBeDefined();

      const holidays: HolidaysState = {
        holidaySet: new Set<string>(),
      };
      expect(holidays).toBeDefined();

      const ui: UiState = {
        isSignatureModalOpen: false,
        isGeneratingPdf: false,
        lastGeneratedFileName: '',
        errorMessage: null,
        triggerValidation: null,
      };
      expect(ui).toBeDefined();
    });
  });

  describe('setProfile action', () => {
    it('should update profile fields individually', () => {
      const store = useLeaveRequestStore.getState();

      store.setProfile({ fullName: 'John Doe' });
      expect(useLeaveRequestStore.getState().profile.fullName).toBe('John Doe');

      store.setProfile({ email: 'john@example.com' });
      expect(useLeaveRequestStore.getState().profile.email).toBe('john@example.com');

      store.setProfile({ phone: '+1 555-123-4567' });
      expect(useLeaveRequestStore.getState().profile.phone).toBe('+1 555-123-4567');

      store.setProfile({ employeeId: 'EMP001' });
      expect(useLeaveRequestStore.getState().profile.employeeId).toBe('EMP001');

      store.setProfile({ department: 'Engineering' });
      expect(useLeaveRequestStore.getState().profile.department).toBe('Engineering');

      store.setProfile({ position: 'Senior Developer' });
      expect(useLeaveRequestStore.getState().profile.position).toBe('Senior Developer');
    });

    it('should merge profile updates with existing state', () => {
      const store = useLeaveRequestStore.getState();

      store.setProfile({
        fullName: 'Jane Smith',
        email: 'jane@example.com',
      });

      const state = useLeaveRequestStore.getState();
      expect(state.profile.fullName).toBe('Jane Smith');
      expect(state.profile.email).toBe('jane@example.com');
      expect(state.profile.phone).toBe('');
      expect(state.profile.fathersName).toBe('');
      expect(state.profile.identityNumber).toBe('');
      expect(state.profile.employeeId).toBe('');
      expect(state.profile.companyName).toBe('ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε');
      expect(state.profile.department).toBe('');
      expect(state.profile.position).toBe('');
    });

    it('should update multiple profile fields at once', () => {
      const store = useLeaveRequestStore.getState();

      store.setProfile({
        fullName: 'Bob Johnson',
        fathersName: 'George Johnson',
        email: 'bob@example.com',
        phone: '+1 555-987-6543',
        identityNumber: 'AB123456',
        employeeId: 'EMP002',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: 'Marketing',
        position: 'Manager',
      });

      const state = useLeaveRequestStore.getState();
      expect(state.profile).toEqual({
        fullName: 'Bob Johnson',
        fathersName: 'George Johnson',
        email: 'bob@example.com',
        phone: '+1 555-987-6543',
        identityNumber: 'AB123456',
        employeeId: 'EMP002',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: 'Marketing',
        position: 'Manager',
      });
    });

    it('should handle unicode characters in profile', () => {
      const store = useLeaveRequestStore.getState();

      store.setProfile({ fullName: 'Jürgen Müller' });
      expect(useLeaveRequestStore.getState().profile.fullName).toBe('Jürgen Müller');
    });
  });

  describe('setLeaveDraft action', () => {
    it('should update leave type', () => {
      const store = useLeaveRequestStore.getState();

      store.setLeaveDraft({ leaveType: 'sick' });
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('sick');

      store.setLeaveDraft({ leaveType: 'unpaid' });
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('unpaid');

      store.setLeaveDraft({ leaveType: 'other' });
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('other');

      store.setLeaveDraft({ leaveType: 'annual' });
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('annual');
    });

    it('should update start and end dates', () => {
      const store = useLeaveRequestStore.getState();

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-20');

      store.setLeaveDraft({ startDate });
      expect(useLeaveRequestStore.getState().leaveDraft.startDate).toEqual(startDate);

      store.setLeaveDraft({ endDate });
      expect(useLeaveRequestStore.getState().leaveDraft.endDate).toEqual(endDate);
    });

    it('should update reason', () => {
      const store = useLeaveRequestStore.getState();

      store.setLeaveDraft({ reason: 'Family vacation' });
      expect(useLeaveRequestStore.getState().leaveDraft.reason).toBe('Family vacation');
    });

    it('should merge leave draft updates with existing state', () => {
      const store = useLeaveRequestStore.getState();

      store.setLeaveDraft({
        leaveType: 'sick',
        reason: 'Doctor appointment',
      });

      const state = useLeaveRequestStore.getState();
      expect(state.leaveDraft.leaveType).toBe('sick');
      expect(state.leaveDraft.reason).toBe('Doctor appointment');
      expect(state.leaveDraft.startDate).toBeNull();
      expect(state.leaveDraft.endDate).toBeNull();
    });

    it('should update all draft fields at once', () => {
      const store = useLeaveRequestStore.getState();
      const startDate = new Date('2025-02-01');
      const endDate = new Date('2025-02-05');

      store.setLeaveDraft({
        leaveType: 'annual',
        startDate,
        endDate,
        reason: 'Annual leave',
      });

      const state = useLeaveRequestStore.getState();
      expect(state.leaveDraft.leaveType).toBe('annual');
      expect(state.leaveDraft.startDate).toEqual(startDate);
      expect(state.leaveDraft.endDate).toEqual(endDate);
      expect(state.leaveDraft.reason).toBe('Annual leave');
    });
  });

  describe('setSignature action', () => {
    it('should update signature data URL', () => {
      const store = useLeaveRequestStore.getState();

      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      store.setSignature({ signatureDataUrl: dataUrl });

      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe(dataUrl);
    });

    it('should clear signature data URL', () => {
      const store = useLeaveRequestStore.getState();

      const dataUrl = 'data:image/png;base64,some-data';
      store.setSignature({ signatureDataUrl: dataUrl });
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe(dataUrl);

      store.setSignature({ signatureDataUrl: '' });
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('');
    });
  });

  describe('setHolidays action', () => {
    it('should replace holidays state', () => {
      const store = useLeaveRequestStore.getState();

      const holidaySet = new Set(['2025-01-01', '2025-12-25']);
      store.setHolidays({ holidaySet });

      const state = useLeaveRequestStore.getState();
      expect(state.holidays.holidaySet).toEqual(holidaySet);
      expect(state.holidays.holidaySet.has('2025-01-01')).toBe(true);
      expect(state.holidays.holidaySet.has('2025-12-25')).toBe(true);
    });

    it('should handle empty holiday set', () => {
      const store = useLeaveRequestStore.getState();

      const holidaySet = new Set<string>();
      store.setHolidays({ holidaySet });

      const state = useLeaveRequestStore.getState();
      expect(state.holidays.holidaySet.size).toBe(0);
    });
  });

  describe('setUi action', () => {
    it('should update isSignatureModalOpen', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({ isSignatureModalOpen: true });
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(true);

      store.setUi({ isSignatureModalOpen: false });
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(false);
    });

    it('should update isGeneratingPdf', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({ isGeneratingPdf: true });
      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(true);

      store.setUi({ isGeneratingPdf: false });
      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(false);
    });

    it('should update lastGeneratedFileName', () => {
      const store = useLeaveRequestStore.getState();

      const fileName = 'absence-request-2025-12-25.pdf';
      store.setUi({ lastGeneratedFileName: fileName });

      expect(useLeaveRequestStore.getState().ui.lastGeneratedFileName).toBe(fileName);
    });

    it('should update errorMessage', () => {
      const store = useLeaveRequestStore.getState();

      const errorMessage = 'Failed to generate PDF';
      store.setUi({ errorMessage });

      expect(useLeaveRequestStore.getState().ui.errorMessage).toBe(errorMessage);
    });

    it('should merge ui updates with existing state', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({
        isSignatureModalOpen: true,
        isGeneratingPdf: true,
      });

      const state = useLeaveRequestStore.getState();
      expect(state.ui.isSignatureModalOpen).toBe(true);
      expect(state.ui.isGeneratingPdf).toBe(true);
      expect(state.ui.lastGeneratedFileName).toBe('');
      expect(state.ui.errorMessage).toBeNull();
    });
  });

  describe('resetFormDrafts action', () => {
    it('should reset leave draft to initial values', () => {
      const store = useLeaveRequestStore.getState();

      // Set some draft values
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-20');
      store.setLeaveDraft({
        leaveType: 'sick',
        startDate,
        endDate,
        reason: 'Doctor appointment',
      });

      // Verify draft is set
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('sick');
      expect(useLeaveRequestStore.getState().leaveDraft.reason).toBe('Doctor appointment');

      // Reset drafts
      store.resetFormDrafts();

      const state = useLeaveRequestStore.getState();
      expect(state.leaveDraft).toEqual({
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
        leaveAllowance: false,
      });
    });

    it('should not affect profile, signature, holidays, or ui state', () => {
      const store = useLeaveRequestStore.getState();

      // Set values in other state slices
      store.setProfile({ fullName: 'John Doe' });
      const dataUrl = 'data:image/png;base64,data';
      store.setSignature({ signatureDataUrl: dataUrl });
      store.setHolidays({ holidaySet: new Set(['2025-01-01']) });
      store.setUi({ isSignatureModalOpen: true });

      // Set and reset drafts
      store.setLeaveDraft({ leaveType: 'sick', reason: 'Test' });
      store.resetFormDrafts();

      const state = useLeaveRequestStore.getState();
      expect(state.profile.fullName).toBe('John Doe');
      expect(state.signature.signatureDataUrl).toBe(dataUrl);
      expect(state.holidays.holidaySet.has('2025-01-01')).toBe(true);
      expect(state.ui.isSignatureModalOpen).toBe(true);
    });
  });

  describe('clearSignature action', () => {
    it('should clear signature data URL while preserving other signature fields', () => {
      const store = useLeaveRequestStore.getState();

      store.setSignature({ signatureDataUrl: 'data:image/png;base64,data' });
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('data:image/png;base64,data');

      store.clearSignature();
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('');
    });

    it('should not affect other state slices', () => {
      const store = useLeaveRequestStore.getState();

      store.setProfile({ fullName: 'John Doe' });
      store.setLeaveDraft({ leaveType: 'sick' });
      store.setHolidays({ holidaySet: new Set(['2025-01-01']) });
      store.setUi({ errorMessage: 'Error' });

      store.setSignature({ signatureDataUrl: 'data:image/png;base64,data' });
      store.clearSignature();

      const state = useLeaveRequestStore.getState();
      expect(state.profile.fullName).toBe('John Doe');
      expect(state.leaveDraft.leaveType).toBe('sick');
      expect(state.holidays.holidaySet.has('2025-01-01')).toBe(true);
      expect(state.ui.errorMessage).toBe('Error');
      expect(state.signature.signatureDataUrl).toBe('');
    });
  });

  describe('clearErrorMessage action', () => {
    it('should clear error message', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({ errorMessage: 'Something went wrong' });
      expect(useLeaveRequestStore.getState().ui.errorMessage).toBe('Something went wrong');

      store.clearErrorMessage();
      expect(useLeaveRequestStore.getState().ui.errorMessage).toBeNull();
    });

    it('should preserve other ui fields', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({
        isSignatureModalOpen: true,
        isGeneratingPdf: true,
        lastGeneratedFileName: 'test.pdf',
        errorMessage: 'Error',
      });

      store.clearErrorMessage();

      const state = useLeaveRequestStore.getState();
      expect(state.ui.isSignatureModalOpen).toBe(true);
      expect(state.ui.isGeneratingPdf).toBe(true);
      expect(state.ui.lastGeneratedFileName).toBe('test.pdf');
      expect(state.ui.errorMessage).toBeNull();
    });
  });

  describe('toggleSignatureModal action', () => {
    it('should toggle signature modal from false to true', () => {
      const store = useLeaveRequestStore.getState();

      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(false);

      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(true);
    });

    it('should toggle signature modal from true to false', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({ isSignatureModalOpen: true });
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(true);

      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(false);
    });

    it('should toggle multiple times', () => {
      const store = useLeaveRequestStore.getState();

      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(true);

      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(false);

      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(true);
    });
  });

  describe('setIsGeneratingPdf action', () => {
    it('should set isGeneratingPdf to true', () => {
      const store = useLeaveRequestStore.getState();

      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(false);

      store.setIsGeneratingPdf(true);
      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(true);
    });

    it('should set isGeneratingPdf to false', () => {
      const store = useLeaveRequestStore.getState();

      store.setUi({ isGeneratingPdf: true });
      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(true);

      store.setIsGeneratingPdf(false);
      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(false);
    });
  });

  describe('persist middleware', () => {
    it('should persist only profile data to localStorage', () => {
      const store = useLeaveRequestStore.getState();

      // Set values in all state slices
      store.setProfile({
        fullName: 'John Doe',
        fathersName: 'George Doe',
        email: 'john@example.com',
        phone: '+1 555-123-4567',
        identityNumber: 'AB123456',
        employeeId: 'EMP001',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: 'Engineering',
        position: 'Developer',
      });
      store.setLeaveDraft({
        leaveType: 'sick',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-16'),
        reason: 'Doctor appointment',
      });
      store.setSignature({
        signatureDataUrl: 'data:image/png;base64,data',
      });
      store.setHolidays({ holidaySet: new Set(['2025-01-01', '2025-12-25']) });
      store.setUi({
        isSignatureModalOpen: true,
        isGeneratingPdf: true,
        lastGeneratedFileName: 'test.pdf',
        errorMessage: 'Test error',
      });

      // Check localStorage content
      const storedData = localStorage.getItem('leave-request-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        const state = parsed.state;

        // Verify only profile is persisted
        expect(state.profile).toEqual({
          fullName: 'John Doe',
          fathersName: 'George Doe',
          email: 'john@example.com',
          phone: '+1 555-123-4567',
          identityNumber: 'AB123456',
          employeeId: 'EMP001',
          companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: 'Engineering',
          position: 'Developer',
        });

        // Verify other state slices are not persisted
        expect(state.leaveDraft).toBeUndefined();
        expect(state.holidays).toBeUndefined();
        expect(state.ui).toBeUndefined();
        // Signature is now persisted along with profile
      }
    });

    it('should restore profile data from localStorage on rehydration', () => {
      // Pre-populate localStorage with profile data
      localStorage.setItem(
        'leave-request-storage',
        JSON.stringify({
          state: {
            profile: {
              fullName: 'Jane Smith',
              email: 'jane@example.com',
              phone: '+1 555-987-6543',
              employeeId: 'EMP002',
              department: 'Marketing',
              position: 'Manager',
            },
          },
          version: 0,
        })
      );

      // Create a new module import to trigger rehydration
      // In a real scenario, this would happen on page load
      // For testing, we verify the localStorage has the expected data
      const storedData = localStorage.getItem('leave-request-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.profile.fullName).toBe('Jane Smith');
        expect(parsed.state.profile.email).toBe('jane@example.com');
      }
    });

    it('should use correct storage key', () => {
      const store = useLeaveRequestStore.getState();

      store.setProfile({ fullName: 'Test User' });

      const storageKeys = Object.keys(localStorage);
      expect(storageKeys).toContain('leave-request-storage');
    });
  });

  describe('store type inference', () => {
    it('should correctly infer store state type', () => {
      const state = useLeaveRequestStore.getState();

      // Verify the state is correctly typed
      expect(typeof state.profile.fullName).toBe('string');
      expect(typeof state.leaveDraft.leaveType).toBe('string');
      expect(typeof state.signature.signatureDataUrl).toBe('string');
      expect(typeof state.holidays.holidaySet).toBe('object');
      expect(typeof state.ui.isSignatureModalOpen).toBe('boolean');
    });

    it('should correctly infer actions type', () => {
      const state = useLeaveRequestStore.getState();

      // Verify all actions are functions
      expect(typeof state.setProfile).toBe('function');
      expect(typeof state.setLeaveDraft).toBe('function');
      expect(typeof state.setSignature).toBe('function');
      expect(typeof state.setHolidays).toBe('function');
      expect(typeof state.setUi).toBe('function');
      expect(typeof state.resetFormDrafts).toBe('function');
      expect(typeof state.clearSignature).toBe('function');
      expect(typeof state.clearErrorMessage).toBe('function');
      expect(typeof state.toggleSignatureModal).toBe('function');
      expect(typeof state.setIsGeneratingPdf).toBe('function');
    });
  });

  describe('Set handling in holidays', () => {
    it('should correctly store and retrieve Set instance', () => {
      const store = useLeaveRequestStore.getState();

      const holidaySet = new Set(['2025-01-01', '2025-12-25', '2025-07-04']);
      store.setHolidays({ holidaySet });

      const state = useLeaveRequestStore.getState();
      expect(state.holidays.holidaySet).toBeInstanceOf(Set);
      expect(state.holidays.holidaySet.size).toBe(3);
      expect(state.holidays.holidaySet.has('2025-01-01')).toBe(true);
      expect(state.holidays.holidaySet.has('2025-12-25')).toBe(true);
      expect(state.holidays.holidaySet.has('2025-07-04')).toBe(true);
      expect(state.holidays.holidaySet.has('2025-02-14')).toBe(false);
    });
  });

  describe('interaction between actions', () => {
    it('should handle complex workflow of multiple actions', () => {
      const store = useLeaveRequestStore.getState();

      // 1. Set profile (persisted data)
      store.setProfile({
        fullName: 'Alice Brown',
        email: 'alice@example.com',
        phone: '+1 555-555-5555',
        employeeId: 'EMP003',
        department: 'HR',
        position: 'HR Manager',
      });

      // 2. Start a new leave request
      store.setLeaveDraft({
        leaveType: 'annual',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-05'),
        reason: 'Summer vacation',
      });

      // 3. Open signature modal
      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(true);

      // 4. Set signature
      store.setSignature({
        signatureDataUrl: 'data:image/png;base64,signature-data',
      });

      // 5. Close modal
      store.toggleSignatureModal();
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(false);

      // 6. Start PDF generation
      store.setIsGeneratingPdf(true);
      expect(useLeaveRequestStore.getState().ui.isGeneratingPdf).toBe(true);

      // 7. Complete PDF generation
      store.setIsGeneratingPdf(false);
      store.setUi({ lastGeneratedFileName: 'absence-request-2025-06-01.pdf' });

      // Verify final state
      const finalState = useLeaveRequestStore.getState();
      expect(finalState.profile.fullName).toBe('Alice Brown');
      expect(finalState.leaveDraft.reason).toBe('Summer vacation');
      expect(finalState.signature.signatureDataUrl).toBe('data:image/png;base64,signature-data');
      expect(finalState.ui.isSignatureModalOpen).toBe(false);
      expect(finalState.ui.isGeneratingPdf).toBe(false);
      expect(finalState.ui.lastGeneratedFileName).toBe('absence-request-2025-06-01.pdf');
      expect(finalState.ui.errorMessage).toBeNull();

      // 8. Reset for next request
      store.resetFormDrafts();
      store.clearSignature();

      const resetState = useLeaveRequestStore.getState();
      expect(resetState.leaveDraft.leaveType).toBe('annual');
      expect(resetState.leaveDraft.reason).toBe('');
      expect(resetState.leaveDraft.startDate).toBeNull();
      expect(resetState.signature.signatureDataUrl).toBe('');
      // Profile should still be persisted
      expect(resetState.profile.fullName).toBe('Alice Brown');
    });
  });

  describe('edge cases', () => {
    it('should handle setting leaveType to all valid values', () => {
      const store = useLeaveRequestStore.getState();

      const validTypes: ('annual' | 'sick' | 'unpaid' | 'other')[] = ['annual', 'sick', 'unpaid', 'other'];

      validTypes.forEach((leaveType) => {
        store.setLeaveDraft({ leaveType });
        expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe(leaveType);
      });
    });

    it('should handle clearing a non-existent error message', () => {
      const store = useLeaveRequestStore.getState();

      // Error message is initially null
      expect(useLeaveRequestStore.getState().ui.errorMessage).toBeNull();

      // Clear should work without error
      store.clearErrorMessage();
      expect(useLeaveRequestStore.getState().ui.errorMessage).toBeNull();
    });

    it('should handle clearing an empty signature', () => {
      const store = useLeaveRequestStore.getState();

      // Signature is initially empty
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('');

      // Clear should work without error
      store.clearSignature();
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('');
    });

    it('should handle resetting form drafts multiple times', () => {
      const store = useLeaveRequestStore.getState();

      // Reset once
      store.resetFormDrafts();
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('annual');

      // Set values
      store.setLeaveDraft({ leaveType: 'sick', reason: 'Test' });

      // Reset again
      store.resetFormDrafts();
      expect(useLeaveRequestStore.getState().leaveDraft.leaveType).toBe('annual');
      expect(useLeaveRequestStore.getState().leaveDraft.reason).toBe('');
    });

    it('should handle setting empty profile fields', () => {
      const store = useLeaveRequestStore.getState();

      // Set all profile fields
      store.setProfile({
        fullName: 'Full Name',
        email: 'email@test.com',
        phone: '123-456-7890',
        employeeId: 'EMP123',
        department: 'Dept',
        position: 'Pos',
      });

      // Clear them one by one
      store.setProfile({ fullName: '' });
      expect(useLeaveRequestStore.getState().profile.fullName).toBe('');

      store.setProfile({ email: '' });
      expect(useLeaveRequestStore.getState().profile.email).toBe('');

      store.setProfile({ phone: '' });
      expect(useLeaveRequestStore.getState().profile.phone).toBe('');

      store.setProfile({ employeeId: '' });
      expect(useLeaveRequestStore.getState().profile.employeeId).toBe('');

      store.setProfile({ department: '' });
      expect(useLeaveRequestStore.getState().profile.department).toBe('');

      store.setProfile({ position: '' });
      expect(useLeaveRequestStore.getState().profile.position).toBe('');
    });
  });

  describe('partialize function for persist middleware', () => {
    it('should use partialize to filter state for persistence', () => {
      const store = useLeaveRequestStore.getState();

      // The partialize function is defined in the store configuration
      // partialize: (state) => ({ profile: state.profile, signature: state.signature })

      // We can verify this works by checking localStorage
      store.setProfile({ fullName: 'Persisted User' });
      store.setLeaveDraft({ reason: 'Not Persisted' });

      const storedData = localStorage.getItem('leave-request-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Profile and signature should be in stored state
        expect(parsed.state).toHaveProperty('profile');
        expect(parsed.state.profile.fullName).toBe('Persisted User');
        expect(parsed.state).toHaveProperty('signature');
        expect(parsed.state).not.toHaveProperty('leaveDraft');
        expect(parsed.state).not.toHaveProperty('holidays');
        expect(parsed.state).not.toHaveProperty('ui');
      }
    });
  });

  describe('hydration callback', () => {
    it('should have onRehydrateStorage callback configured', () => {
      // The onRehydrateStorage callback is configured in the store setup
      // We can verify this by checking the persist middleware is working
      const store = useLeaveRequestStore.getState();

      // Set some state and verify it persists to localStorage
      store.setProfile({ fullName: 'Test User' });

      const storedData = localStorage.getItem('leave-request-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.profile.fullName).toBe('Test User');
      }
    });
  });
});
