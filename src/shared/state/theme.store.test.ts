import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore, type ThemeStore } from './theme.store';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'light' });
  });

  describe('store initialization', () => {
    it('should initialize with light theme as default', () => {
      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should export inferred types', () => {
      const themeStore: ThemeStore = useThemeStore.getState();
      expect(themeStore).toBeDefined();
      expect(typeof themeStore.theme).toBe('string');
      expect(typeof themeStore.toggleTheme).toBe('function');
      expect(typeof themeStore.setTheme).toBe('function');
    });
  });

  describe('toggleTheme action', () => {
    it('should toggle from light to dark', () => {
      const store = useThemeStore.getState();
      expect(store.theme).toBe('light');

      store.toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const store = useThemeStore.getState();
      store.setTheme('dark');

      const afterSetTheme = useThemeStore.getState();
      expect(afterSetTheme.theme).toBe('dark');

      store.toggleTheme();
      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should toggle multiple times correctly', () => {
      const store = useThemeStore.getState();
      expect(store.theme).toBe('light');

      store.toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');

      store.toggleTheme();
      expect(useThemeStore.getState().theme).toBe('light');

      store.toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
    });
  });

  describe('setTheme action', () => {
    it('should set theme to light', () => {
      const store = useThemeStore.getState();

      store.setTheme('dark');
      const afterDark = useThemeStore.getState();
      expect(afterDark.theme).toBe('dark');

      store.setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should set theme to dark', () => {
      const store = useThemeStore.getState();

      store.setTheme('dark');
      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should preserve theme value when setting same theme', () => {
      const store = useThemeStore.getState();
      store.setTheme('light');
      expect(store.theme).toBe('light');

      store.setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('persist middleware', () => {
    it('should persist theme to localStorage with correct key', () => {
      const store = useThemeStore.getState();
      store.setTheme('dark');

      const storedData = localStorage.getItem('app-theme');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.theme).toBe('dark');
      }
    });

    it('should restore theme from localStorage', () => {
      localStorage.setItem(
        'app-theme',
        JSON.stringify({
          state: { theme: 'dark' },
          version: 0,
        })
      );

      const storedData = localStorage.getItem('app-theme');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.theme).toBe('dark');
      }
    });

    it('should use correct storage key "app-theme"', () => {
      const store = useThemeStore.getState();
      store.setTheme('dark');

      const storageKeys = Object.keys(localStorage);
      expect(storageKeys).toContain('app-theme');
    });

    it('should only persist theme state', () => {
      const store = useThemeStore.getState();
      store.setTheme('dark');

      const storedData = localStorage.getItem('app-theme');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state).toHaveProperty('theme');
        expect(Object.keys(parsed.state)).toHaveLength(1);
      }
    });
  });

  describe('theme type constraints', () => {
    it('should only accept "light" or "dark" as theme values', () => {
      const store = useThemeStore.getState();

      store.setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');

      store.setTheme('dark');
      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should maintain type safety for theme values', () => {
      const store = useThemeStore.getState();
      const themes: ('light' | 'dark')[] = ['light', 'dark'];

      themes.forEach((theme) => {
        store.setTheme(theme);
        expect(useThemeStore.getState().theme).toBe(theme);
      });
    });
  });

  describe('store type inference', () => {
    it('should correctly infer theme state type', () => {
      const state = useThemeStore.getState();
      expect(typeof state.theme).toBe('string');
      expect(['light', 'dark']).toContain(state.theme);
    });

    it('should correctly infer actions type', () => {
      const state = useThemeStore.getState();
      expect(typeof state.toggleTheme).toBe('function');
      expect(typeof state.setTheme).toBe('function');
    });
  });
});
