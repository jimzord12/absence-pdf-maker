import React from 'react';
import { Select } from '../../../shared/ui/Select';
import { useLocaleStore } from '../state/locale.store';
import type { Locale } from '../state/locale.store';

// Locale display labels and flag emojis
const localeOptions = [
  { value: 'gr', label: '🇬🇷 Ελληνικά (Greek)' },
  { value: 'en', label: '🇺🇸 English' },
];

interface LocaleSelectorProps {
  className?: string;
}

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({ className = '' }) => {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="locale-selector" className="text-sm font-medium text-gray-700">
        Language:
      </label>
      <Select
        id="locale-selector"
        options={localeOptions}
        value={locale}
        onChange={(value) => setLocale(value as Locale)}
        className="w-32"
      />
    </div>
  );
};
