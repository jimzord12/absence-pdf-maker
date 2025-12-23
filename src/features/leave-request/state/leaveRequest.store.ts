import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
  fullName: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  position: string;
}

interface LeaveDraft {
  leaveType: 'annual' | 'sick' | 'unpaid' | 'other';
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
}

interface Signature {
  signatureDataUrl: string;
}

interface Holidays {
  holidaySet: Set<string>;
}

interface Ui {
  isSignatureModalOpen: boolean;
  isGeneratingPdf: boolean;
  lastGeneratedFileName: string;
}

interface LeaveRequestState {
  profile: Partial<Profile>;
  leaveDraft: Partial<LeaveDraft>;
  signature: Partial<Signature>;
  holidays: Holidays;
  ui: Ui;
}

interface LeaveRequestActions {
  setProfile: (profile: Partial<Profile>) => void;
  setLeaveDraft: (draft: Partial<LeaveDraft>) => void;
  setSignature: (signature: Partial<Signature>) => void;
  setHolidays: (holidays: Holidays) => void;
  setUi: (ui: Partial<Ui>) => void;
  resetFormDrafts: () => void;
  toggleSignatureModal: () => void;
  setIsGeneratingPdf: (isGenerating: boolean) => void;
}

type LeaveRequestStore = LeaveRequestState & LeaveRequestActions;

export const useLeaveRequestStore = create<LeaveRequestStore>()(
  persist(
    (set) => ({
      // Initial state
      profile: {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
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
      },

      // Actions
      setProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),
      setLeaveDraft: (draft) => set((state) => ({ leaveDraft: { ...state.leaveDraft, ...draft } })),
      setSignature: (signature) => set((state) => ({ signature: { ...state.signature, ...signature } })),
      setHolidays: (holidays) => set({ holidays }),
      setUi: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } })),
      resetFormDrafts: () => set({
        leaveDraft: {
          leaveType: 'annual',
          startDate: null,
          endDate: null,
          reason: '',
        },
      }),
      toggleSignatureModal: () => set((state) => ({ ui: { ...state.ui, isSignatureModalOpen: !state.ui.isSignatureModalOpen } })),
      setIsGeneratingPdf: (isGenerating) => set((state) => ({ ui: { ...state.ui, isGeneratingPdf: isGenerating } })),
    }),
    {
      name: 'leave-request-storage',
      partialize: (state) => ({ profile: state.profile }), // Only persist profile
    }
  )
);
