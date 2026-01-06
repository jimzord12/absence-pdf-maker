import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Theme type definition
export type Theme = 'light' | 'dark';

// Theme interface for store state
interface ThemeState {
  theme: Theme;
}

// Theme actions
interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Initial state - light as default (requirement)
const initialState: ThemeState = {
  theme: 'light',
};

// Create theme store with persistence
export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleTheme: () => {
        const currentTheme = get().theme;
        set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
      },

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Export inferred types for external use
export type ThemeStore = ReturnType<typeof useThemeStore.getState>;
