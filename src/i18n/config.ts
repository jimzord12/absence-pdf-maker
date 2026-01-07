import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import grTranslations from './locales/gr.json';

/**
 * i18next Configuration
 *
 * This config initializes react-i18next with English and Greek language support.
 * Uses multiple namespaces (common, forms, validation, messages, pdf) for better organization.
 * Default language is 'gr' (matching locale.store.ts) with 'en' as fallback.
 * HTML escaping is disabled as React handles this.
 */

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'gr',
  supportedLngs: ['en', 'gr'],
  defaultNS: 'common',
  ns: ['common', 'forms', 'validation', 'messages', 'pdf'],
  resources: {
    en: enTranslations,
    gr: grTranslations,
  },
  interpolation: {
    escapeValue: false,
  },
  debug: import.meta.env.DEV,
});

export default i18n;
