import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * i18next Configuration
 *
 * This config initializes react-i18next with English and Greek language support.
 * Default language is 'gr' (matching locale.store.ts) with 'en' as fallback.
 * HTML escaping is disabled as React handles this.
 */

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'gr',
  supportedLngs: ['en', 'gr'],
  resources: {
    en: {
      translation: {},
    },
    gr: {
      translation: {},
    },
  },
  interpolation: {
    escapeValue: false,
  },
  debug: import.meta.env.DEV,
});

export default i18n;
