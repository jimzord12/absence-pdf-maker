import React from 'react';

import { Select } from '../../../../shared/ui';
import type { PdfLanguage } from '../../state/pdfLanguage.store';
import { usePdfLanguageStore } from '../../state/pdfLanguage.store';

const pdfLanguageOptions = [
  { value: 'gr', label: '🇬🇷 Ελληνικά (Greek)' },
  { value: 'en', label: '🇺🇸 English' },
];

interface PdfLanguageSelectorProps {
  className?: string;
}

export const PdfLanguageSelector: React.FC<PdfLanguageSelectorProps> = ({ className = '' }) => {
  const { pdfLanguage, setPdfLanguage } = usePdfLanguageStore();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="pdf-language-selector" className="text-sm font-medium text-[color:var(--color-text-primary)]">
        PDF Language:
      </label>
      <Select
        id="pdf-language-selector"
        options={pdfLanguageOptions}
        value={pdfLanguage}
        onChange={e => setPdfLanguage(e.target.value as PdfLanguage)}
        className="w-32"
      />
    </div>
  );
};
