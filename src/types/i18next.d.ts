/**
 * i18next Type Declarations
 *
 * Augments i18next module to enable IDE autocomplete for translation keys.
 * Uses 'common' as the default namespace.
 *
 * The Resources type will be automatically inferred from src/i18n/locales/en.json
 * once translation files are created.
 */

import en from '../i18n/locales/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    /**
     * Default namespace for translation keys.
     * When using t('key'), 'common' namespace is used by default.
     * To access other namespaces: t('forms:personDetails.firstName')
     */
    defaultNS: 'common';

    /**
     * All available namespaces.
     */
    resources: {
      common: typeof en.common;
      forms: typeof en.forms;
      validation: typeof en.validation;
      messages: typeof en.messages;
      pdf: typeof en.pdf;
    };
  }
}
