import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../../../i18n/config';

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

const initialState: LocaleState = {
  locale: import.meta.env.MODE === 'test' ? 'en' : 'gr',
};

// Create locale store with persistence
export const useLocaleStore = create<LocaleState & LocaleActions>()(
  persist(
    (set) => ({
      ...initialState,

      setLocale: (locale) => {
        i18n.changeLanguage(locale);
        set({ locale });
      },
    }),
    {
      name: 'locale-storage',
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        const persistedState = state as LocaleState | undefined;
        if (persistedState?.locale && persistedState.locale !== i18n.language) {
          i18n.changeLanguage(persistedState.locale);
        }
      },
    }
  )
);

export type LocaleStoreType = LocaleState & LocaleActions;
