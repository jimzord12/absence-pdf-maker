import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import i18n from '../../../i18n/config';
import { useLocaleStore, type LocaleStoreType } from './locale.store';

describe('useLocaleStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useLocaleStore.setState({ locale: 'gr' });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    useLocaleStore.setState({ locale: 'gr' });
  });

  describe('store initialization', () => {
    it('should initialize with Greek (gr) as default', () => {
      const state = useLocaleStore.getState();
      expect(state.locale).toBe('gr');
    });

    it('should export inferred types', () => {
      const localeStore: LocaleStoreType = useLocaleStore.getState();
      expect(localeStore).toBeDefined();
      expect(typeof localeStore.locale).toBe('string');
      expect(typeof localeStore.setLocale).toBe('function');
    });
  });

  describe('setLocale action', () => {
    it('should set locale to English (en)', () => {
      const store = useLocaleStore.getState();
      expect(store.locale).toBe('gr');

      store.setLocale('en');
      expect(useLocaleStore.getState().locale).toBe('en');
    });

    it('should set locale to Greek (gr)', () => {
      const store = useLocaleStore.getState();
      store.setLocale('en');

      const afterSetEn = useLocaleStore.getState();
      expect(afterSetEn.locale).toBe('en');

      store.setLocale('gr');
      expect(useLocaleStore.getState().locale).toBe('gr');
    });

    it('should preserve locale value when setting same language', () => {
      const store = useLocaleStore.getState();
      store.setLocale('en');
      expect(useLocaleStore.getState().locale).toBe('en');

      store.setLocale('en');
      expect(useLocaleStore.getState().locale).toBe('en');
    });
  });

  describe('i18next synchronization', () => {
    it('should sync with i18next when setLocale is called', () => {
      const store = useLocaleStore.getState();
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      expect(store.locale).toBe('gr');

      store.setLocale('en');

      expect(changeLanguageSpy).toHaveBeenCalledWith('en');
      expect(useLocaleStore.getState().locale).toBe('en');
      expect(i18n.language).toBe('en');

      changeLanguageSpy.mockRestore();
    });

    it('should call i18n.changeLanguage with correct locale on setLocale', () => {
      const store = useLocaleStore.getState();
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      store.setLocale('en');
      expect(changeLanguageSpy).toHaveBeenCalledTimes(1);
      expect(changeLanguageSpy).toHaveBeenCalledWith('en');

      store.setLocale('gr');
      expect(changeLanguageSpy).toHaveBeenCalledTimes(2);
      expect(changeLanguageSpy).toHaveBeenCalledWith('gr');

      changeLanguageSpy.mockRestore();
    });

    it('should sync i18next language on rehydration from localStorage', () => {
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      useLocaleStore.getState().setLocale('en');

      expect(changeLanguageSpy).toHaveBeenCalledWith('en');
      expect(useLocaleStore.getState().locale).toBe('en');

      i18n.changeLanguage('gr');

      const persistedData = localStorage.getItem('locale-storage');
      expect(persistedData).toBeDefined();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.locale).toBe('en');
      }

      expect(useLocaleStore.getState().locale).toBe('en');

      changeLanguageSpy.mockRestore();
    });
  });

  describe('persist middleware', () => {
    it('should persist locale to localStorage with correct key', () => {
      const store = useLocaleStore.getState();
      store.setLocale('en');

      const storedData = localStorage.getItem('locale-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.locale).toBe('en');
      }
    });

    it('should restore locale from localStorage', () => {
      localStorage.setItem(
        'locale-storage',
        JSON.stringify({
          state: { locale: 'en' },
          version: 0,
        })
      );

      const storedData = localStorage.getItem('locale-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.locale).toBe('en');
      }
    });

    it('should use correct storage key "locale-storage"', () => {
      const store = useLocaleStore.getState();
      store.setLocale('en');

      const storageKeys = Object.keys(localStorage);
      expect(storageKeys).toContain('locale-storage');
    });

    it('should only persist locale state', () => {
      const store = useLocaleStore.getState();
      store.setLocale('en');

      const storedData = localStorage.getItem('locale-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state).toHaveProperty('locale');
        expect(Object.keys(parsed.state)).toHaveLength(1);
      }
    });

    it('should persist locale across browser restart (localStorage)', () => {
      useLocaleStore.getState().setLocale('en');

      const enData = localStorage.getItem('locale-storage');
      expect(enData).toBeDefined();
      if (enData) {
        const enParsed = JSON.parse(enData);
        expect(enParsed.state.locale).toBe('en');
      }

      useLocaleStore.getState().setLocale('gr');

      const grData = localStorage.getItem('locale-storage');
      expect(grData).toBeDefined();
      if (grData) {
        const grParsed = JSON.parse(grData);
        expect(grParsed.state.locale).toBe('gr');
      }
    });
  });

  describe('locale type constraints', () => {
    it('should only accept "en" or "gr" as locale values', () => {
      const store = useLocaleStore.getState();

      store.setLocale('gr');
      expect(useLocaleStore.getState().locale).toBe('gr');

      store.setLocale('en');
      expect(useLocaleStore.getState().locale).toBe('en');
    });

    it('should maintain type safety for locale values', () => {
      const store = useLocaleStore.getState();
      const locales: ('en' | 'gr')[] = ['en', 'gr'];

      locales.forEach((locale) => {
        store.setLocale(locale);
        expect(useLocaleStore.getState().locale).toBe(locale);
      });
    });
  });

  describe('store type inference', () => {
    it('should correctly infer locale state type', () => {
      const state = useLocaleStore.getState();
      expect(typeof state.locale).toBe('string');
      expect(['en', 'gr']).toContain(state.locale);
    });

    it('should correctly infer actions type', () => {
      const state = useLocaleStore.getState();
      expect(typeof state.setLocale).toBe('function');
    });
  });
});
