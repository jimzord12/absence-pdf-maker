import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Supported PDF languages
export type PdfLanguage = 'en' | 'gr';

// PDF language interface for store state
interface PdfLanguageState {
  pdfLanguage: PdfLanguage;
}

// PDF language actions
interface PdfLanguageActions {
  setPdfLanguage: (pdfLanguage: PdfLanguage) => void;
}

// Initial state - Greek as default (official documents)
const initialState: PdfLanguageState = {
  pdfLanguage: 'gr',
};

// Create PDF language store with persistence
export const usePdfLanguageStore = create<PdfLanguageState & PdfLanguageActions>()(
  persist(
    (set) => ({
      ...initialState,

      setPdfLanguage: (pdfLanguage) => set({ pdfLanguage }),
    }),
    {
      name: 'pdf-language-storage',
      partialize: (state) => ({ pdfLanguage: state.pdfLanguage }),
    }
  )
);

// Export inferred types for external use
export type PdfLanguageStoreType = PdfLanguageState & PdfLanguageActions;
