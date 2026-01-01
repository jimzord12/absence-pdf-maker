import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Supported locales
export type Locale = 'en' | 'gr';

// Locale interface for store state
interface LocaleState {
  locale: Locale;
}

// Locale actions
interface LocaleActions {
  setLocale: (locale: Locale) => void;
}

// Initial state - Greek as default
const initialState: LocaleState = {
  locale: 'gr',
};

// Create locale store with persistence
export const useLocaleStore = create<LocaleState & LocaleActions>()(
  persist(
    (set) => ({
      ...initialState,

      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
