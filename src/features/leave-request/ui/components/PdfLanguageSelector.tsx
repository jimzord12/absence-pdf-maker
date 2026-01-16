import React, { useId } from 'react';

import { Select } from '../../../../shared/ui';
import type { PdfLanguage } from '../../state/pdfLanguage.store';
import { usePdfLanguageStore } from '../../state/pdfLanguage.store';

const pdfLanguageOptions = [
  { value: 'gr', label: '🇬🇷 Ελληνικά (Greek)' },
  { value: 'en', label: '🇺🇸 English' },
];

interface LocaleSelectorProps {
  className?: string;
}

export const PdfLanguageSelector: React.FC<LocaleSelectorProps> = ({ className = '' }) => {
  const { pdfLanguage, setPdfLanguage } = usePdfLanguageStore();
  const generatedId = useId();
  const pdfLanguageId = `pdf-language-selector-${generatedId}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={pdfLanguageId} className="text-sm font-medium text-[color:var(--color-text-primary)]">
        PDF Language:
      </label>
      <Select
        id={pdfLanguageId}
        options={pdfLanguageOptions}
        value={pdfLanguage}
        onChange={e => setPdfLanguage(e.target.value as PdfLanguage)}
        className="w-32"
      />
    </div>
  );
};
