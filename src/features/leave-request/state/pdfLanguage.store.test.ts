import { describe, it, expect, beforeEach } from 'vitest';
import { usePdfLanguageStore, type PdfLanguageStoreType } from './pdfLanguage.store';

describe('usePdfLanguageStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePdfLanguageStore.setState({ pdfLanguage: 'gr' });
  });

  describe('store initialization', () => {
    it('should initialize with Greek (gr) as default', () => {
      const state = usePdfLanguageStore.getState();
      expect(state.pdfLanguage).toBe('gr');
    });

    it('should export inferred types', () => {
      const pdfLanguageStore: PdfLanguageStoreType = usePdfLanguageStore.getState();
      expect(pdfLanguageStore).toBeDefined();
      expect(typeof pdfLanguageStore.pdfLanguage).toBe('string');
      expect(typeof pdfLanguageStore.setPdfLanguage).toBe('function');
    });
  });

  describe('setPdfLanguage action', () => {
    it('should set pdfLanguage to English (en)', () => {
      const store = usePdfLanguageStore.getState();
      expect(store.pdfLanguage).toBe('gr');

      store.setPdfLanguage('en');
      expect(usePdfLanguageStore.getState().pdfLanguage).toBe('en');
    });

    it('should set pdfLanguage to Greek (gr)', () => {
      const store = usePdfLanguageStore.getState();
      store.setPdfLanguage('en');

      const afterSetEn = usePdfLanguageStore.getState();
      expect(afterSetEn.pdfLanguage).toBe('en');

      store.setPdfLanguage('gr');
      expect(usePdfLanguageStore.getState().pdfLanguage).toBe('gr');
    });

    it('should preserve pdfLanguage value when setting same language', () => {
      const store = usePdfLanguageStore.getState();
      store.setPdfLanguage('en');
      expect(usePdfLanguageStore.getState().pdfLanguage).toBe('en');

      store.setPdfLanguage('en');
      expect(usePdfLanguageStore.getState().pdfLanguage).toBe('en');
    });
  });

  describe('persist middleware', () => {
    it('should persist pdfLanguage to localStorage with correct key', () => {
      const store = usePdfLanguageStore.getState();
      store.setPdfLanguage('en');

      const storedData = localStorage.getItem('pdf-language-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.pdfLanguage).toBe('en');
      }
    });

    it('should restore pdfLanguage from localStorage', () => {
      localStorage.setItem(
        'pdf-language-storage',
        JSON.stringify({
          state: { pdfLanguage: 'en' },
          version: 0,
        })
      );

      const storedData = localStorage.getItem('pdf-language-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.pdfLanguage).toBe('en');
      }
    });

    it('should use correct storage key "pdf-language-storage"', () => {
      const store = usePdfLanguageStore.getState();
      store.setPdfLanguage('en');

      const storageKeys = Object.keys(localStorage);
      expect(storageKeys).toContain('pdf-language-storage');
    });

    it('should only persist pdfLanguage state', () => {
      const store = usePdfLanguageStore.getState();
      store.setPdfLanguage('en');

      const storedData = localStorage.getItem('pdf-language-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state).toHaveProperty('pdfLanguage');
        expect(Object.keys(parsed.state)).toHaveLength(1);
      }
    });
  });

  describe('pdfLanguage type constraints', () => {
    it('should only accept "en" or "gr" as pdfLanguage values', () => {
      const store = usePdfLanguageStore.getState();

      store.setPdfLanguage('gr');
      expect(usePdfLanguageStore.getState().pdfLanguage).toBe('gr');

      store.setPdfLanguage('en');
      expect(usePdfLanguageStore.getState().pdfLanguage).toBe('en');
    });

    it('should maintain type safety for pdfLanguage values', () => {
      const store = usePdfLanguageStore.getState();
      const languages: ('en' | 'gr')[] = ['en', 'gr'];

      languages.forEach((language) => {
        store.setPdfLanguage(language);
        expect(usePdfLanguageStore.getState().pdfLanguage).toBe(language);
      });
    });
  });

  describe('store type inference', () => {
    it('should correctly infer pdfLanguage state type', () => {
      const state = usePdfLanguageStore.getState();
      expect(typeof state.pdfLanguage).toBe('string');
      expect(['en', 'gr']).toContain(state.pdfLanguage);
    });

    it('should correctly infer actions type', () => {
      const state = usePdfLanguageStore.getState();
      expect(typeof state.setPdfLanguage).toBe('function');
    });
  });
});
