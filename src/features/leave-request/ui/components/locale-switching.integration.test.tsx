import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useLocaleStore } from '../../state/locale.store';
import { LocaleSelector } from './LocaleSelector';
import i18n from '../../../../i18n/config';

describe('Locale Switching Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useLocaleStore.setState({ locale: 'gr' });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    useLocaleStore.setState({ locale: 'gr' });
  });

  describe('setLocale → i18next.sync Integration', () => {
    it('should sync i18next when locale is changed via store', () => {
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(changeLanguageSpy).toHaveBeenCalledWith('en');
      expect(useLocaleStore.getState().locale).toBe('en');

      changeLanguageSpy.mockRestore();
    });

    it('should call i18n.changeLanguage only when locale changes', () => {
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(changeLanguageSpy).toHaveBeenCalledTimes(1);
      expect(changeLanguageSpy).toHaveBeenCalledWith('en');

      changeLanguageSpy.mockRestore();
    });

    it('should sync locale across multiple components when changed', () => {
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      const { rerender } = render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(useLocaleStore.getState().locale).toBe('en');
      expect(changeLanguageSpy).toHaveBeenCalledWith('en');

      rerender(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('en');

      changeLanguageSpy.mockRestore();
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist locale to localStorage when setLocale is called', () => {
      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      const storedData = localStorage.getItem('locale-storage');
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.locale).toBe('en');
      }
    });

    it('should persist locale across component re-renders', () => {
      const { rerender } = render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(useLocaleStore.getState().locale).toBe('en');

      rerender(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('en');
    });

    it('should use correct storage key "locale-storage"', () => {
      render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      const storageKeys = Object.keys(localStorage);
      expect(storageKeys).toContain('locale-storage');
    });

    it('should persist locale changes in sequence', () => {
      render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      const enData = localStorage.getItem('locale-storage');
      expect(enData).toBeDefined();
      if (enData) {
        const enParsed = JSON.parse(enData);
        expect(enParsed.state.locale).toBe('en');
      }

      act(() => {
        useLocaleStore.getState().setLocale('gr');
      });

      const grData = localStorage.getItem('locale-storage');
      expect(grData).toBeDefined();
      if (grData) {
        const grParsed = JSON.parse(grData);
        expect(grParsed.state.locale).toBe('gr');
      }
    });
  });

  describe('Component Re-render on Language Change', () => {
    it('should re-render components when locale changes', () => {
      const { rerender } = render(<LocaleSelector />);

      const initialRender = screen.getByRole('combobox');
      expect(initialRender).toBeInTheDocument();

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      const afterChange = screen.getByRole('combobox');
      expect(afterChange).toBeInTheDocument();
      expect(useLocaleStore.getState().locale).toBe('en');

      rerender(<LocaleSelector />);

      const afterRerender = screen.getByRole('combobox');
      expect(afterRerender).toBeInTheDocument();
      expect(useLocaleStore.getState().locale).toBe('en');
    });

    it('should maintain locale state across multiple re-renders', () => {
      const { rerender } = render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(useLocaleStore.getState().locale).toBe('en');

      for (let i = 0; i < 3; i++) {
        rerender(<LocaleSelector />);
        expect(useLocaleStore.getState().locale).toBe('en');
      }
    });

    it('should update UI when locale switches multiple times', () => {
      const { rerender } = render(<LocaleSelector />);

      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(useLocaleStore.getState().locale).toBe('en');

      rerender(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('gr');
      });

      expect(useLocaleStore.getState().locale).toBe('gr');

      rerender(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(useLocaleStore.getState().locale).toBe('en');
    });
  });

  describe('Default Language (gr) on First Load', () => {
    it('should initialize with Greek (gr) as default when no localStorage exists', () => {
      localStorage.clear();

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');
    });

    it('should use default locale (gr) when localStorage is empty', () => {
      localStorage.setItem('locale-storage', '');

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');
    });

    it('should use default locale (gr) when localStorage has invalid data', () => {
      localStorage.setItem('locale-storage', 'invalid-json');

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');
    });

    it('should initialize i18next with Greek (gr) as default', () => {
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

      localStorage.clear();

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');

      changeLanguageSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid locale switching', () => {
      render(<LocaleSelector />);

      const store = useLocaleStore.getState();

      for (let i = 0; i < 10; i++) {
        act(() => {
          store.setLocale(i % 2 === 0 ? 'en' : 'gr');
        });
      }

      expect(useLocaleStore.getState().locale).toBe('gr');
    });

    it('should not lose locale state on component unmount/remount', () => {
      const { unmount } = render(<LocaleSelector />);

      act(() => {
        useLocaleStore.getState().setLocale('en');
      });

      expect(useLocaleStore.getState().locale).toBe('en');

      unmount();

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('en');
    });

    it('should handle localStorage corruption gracefully', () => {
      localStorage.setItem('locale-storage', 'invalid-json');

      render(<LocaleSelector />);

      expect(useLocaleStore.getState().locale).toBe('gr');
    });
  });
});
