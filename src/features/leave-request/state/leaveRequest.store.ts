import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LeaveType, UserProfile } from '../model/leaveRequest.types';

// Type definitions for state slices

// Draft state allows null dates since they are work-in-progress
interface LeaveDraft {
  leaveType: LeaveType;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
  leaveAllowance: number | null;
}

// Signature state contains the captured signature data URL
interface Signature {
  signatureDataUrl: string;
}

// Holidays state contains the set of holiday date strings
interface Holidays {
  holidaySet: Set<string>;
}

// UI state contains modal states and loading states
interface Ui {
  isSignatureModalOpen: boolean;
  isGeneratingPdf: boolean;
  lastGeneratedFileName: string;
  errorMessage: string | null;
  triggerValidation: (() => Promise<boolean>) | null;
  forceFormReset: boolean;
}

// PWA state tracks installation prompts and user preferences
interface Pwa {
  completedPdfGenerations: number;
  dismissedPwaInstall: boolean;
  pwaInstallSnoozeCount: number;
  pwaInstallSnoozeUntil: Date | null;
}

// Complete state interface for leave request store
interface LeaveRequestState {
  profile: Partial<UserProfile>;
  leaveDraft: Partial<LeaveDraft>;
  signature: Partial<Signature>;
  holidays: Holidays;
  ui: Ui;
  pwa: Pwa;
}

// Actions interface for updating store state
interface LeaveRequestActions {
  setProfile: (profile: Partial<UserProfile>) => void;
  setLeaveDraft: (draft: Partial<LeaveDraft>) => void;
  setSignature: (signature: Partial<Signature>) => void;
  setHolidays: (holidays: Holidays) => void;
  setUi: (ui: Partial<Ui>) => void;
  setPwa: (pwa: Partial<Pwa>) => void;
  resetFormDrafts: () => void;
  clearSignature: () => void;
  clearErrorMessage: () => void;
  toggleSignatureModal: () => void;
  setIsGeneratingPdf: (isGenerating: boolean) => void;
  setTriggerValidation: (trigger: (() => Promise<boolean>) | null) => void;
  triggerForceFormReset: () => void;
  incrementPdfGenerationCount: () => void;
  dismissPwaInstall: () => void;
  snoozePwaInstall: (hours: number) => void;
}

// Initial state values - exported for reuse in reset actions
export const initialState: LeaveRequestState = {
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
    leaveAllowance: null,
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
    forceFormReset: false,
  },
  pwa: {
    completedPdfGenerations: 0,
    dismissedPwaInstall: false,
    pwaInstallSnoozeCount: 0,
    pwaInstallSnoozeUntil: null,
  },
};

// Custom storage serializer/reviver to handle Set types
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      return JSON.parse(str, (_key, value) => {
        if (value?.__type === 'Set') {
          return new Set(value.values);
        }
        return value;
      });
    } catch (e) {
      console.error('[Store] Failed to parse storage:', e);
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(
      name,
      JSON.stringify(value, (_key, value) => {
        if (value instanceof Set) {
          return { __type: 'Set', values: [...value] };
        }
        return value;
      })
    );
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

// Create the store with persist middleware
// TypeScript types are inferred from the store definition
export const useLeaveRequestStore = create<LeaveRequestState & LeaveRequestActions>()(
  persist(
    set => ({
      ...initialState,

      setProfile: profile => set(state => ({ profile: { ...state.profile, ...profile } })),

      setLeaveDraft: draft => set(state => ({ leaveDraft: { ...state.leaveDraft, ...draft } })),

      setSignature: signature =>
        set(state => ({ signature: { ...state.signature, ...signature } })),

      setHolidays: holidays => set({ holidays }),

      setUi: ui => set(state => ({ ui: { ...state.ui, ...ui } })),

      resetFormDrafts: () =>
        set(() => ({
          leaveDraft: initialState.leaveDraft,
        })),

      clearSignature: () =>
        set(state => ({
          signature: { ...state.signature, signatureDataUrl: '' },
        })),

      clearErrorMessage: () => set(state => ({ ui: { ...state.ui, errorMessage: null } })),

      toggleSignatureModal: () =>
        set(state => ({
          ui: { ...state.ui, isSignatureModalOpen: !state.ui.isSignatureModalOpen },
        })),

      setIsGeneratingPdf: isGenerating =>
        set(state => ({ ui: { ...state.ui, isGeneratingPdf: isGenerating } })),

      setTriggerValidation: trigger =>
        set(state => ({ ui: { ...state.ui, triggerValidation: trigger } })),

      triggerForceFormReset: () =>
        set(state => ({ ui: { ...state.ui, forceFormReset: true } })),

      setPwa: pwa => set(state => ({ pwa: { ...state.pwa, ...pwa } })),

      incrementPdfGenerationCount: () =>
        set(state => ({
          pwa: {
            ...state.pwa,
            completedPdfGenerations: state.pwa.completedPdfGenerations + 1,
          },
        })),

      dismissPwaInstall: () =>
        set(state => ({
          pwa: {
            ...state.pwa,
            dismissedPwaInstall: true,
          },
        })),

      snoozePwaInstall: (hours: number) =>
        set(state => ({
          pwa: {
            ...state.pwa,
            pwaInstallSnoozeCount: state.pwa.pwaInstallSnoozeCount + 1,
            pwaInstallSnoozeUntil: new Date(Date.now() + hours * 60 * 60 * 1000),
          },
        })),
    }),
    {
      name: 'leave-request-storage',
      partialize: state => ({ profile: state.profile, signature: state.signature, pwa: state.pwa }),
      storage: customStorage,
      skipHydration: false,
      onRehydrateStorage: (state) => {
        if (import.meta.env.DEV) {
          console.log('[Store] Hydration complete', state);
        }
      },
    }
  )
);

// Export inferred types for external use
export type LeaveRequestStore = ReturnType<typeof useLeaveRequestStore.getState>;
export type ProfileState = LeaveRequestStore['profile'];
export type LeaveDraftState = LeaveRequestStore['leaveDraft'];
export type SignatureState = LeaveRequestStore['signature'];
export type HolidaysState = LeaveRequestStore['holidays'];
export type UiState = LeaveRequestStore['ui'];

