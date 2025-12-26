import React from 'react';

/**
 * HolidaysLegend component
 *
 * Explains holiday highlighting in the calendar and how holidays affect
 * absence day calculations.
 *
 * Features:
 * - Visual indicator matching holiday highlighting style
 * - Clear explanation that holidays don't count toward absence days
 * - Positioned near DateRangeField
 * - Concise, clear text
 * - Consistent with app typography
 */
export const HolidaysLegend: React.FC = () => {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md"
      role="region"
      aria-label="Holidays legend"
    >
      {/* Visual indicator - color swatch matching holiday style */}
      <div
        className="flex-shrink-0 w-6 h-6 rounded border border-gray-300"
        style={{
          backgroundColor: 'var(--color-holiday-bg)',
          color: 'var(--color-holiday-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
        aria-hidden="true"
      >
        H
      </div>

      {/* Legend text */}
      <div className="flex flex-col gap-0.5 text-gray-700">
        <p className="font-medium">
          <span style={{ color: 'var(--color-holiday-text)' }}>H</span> = Holiday
        </p>
        <p className="text-xs text-gray-600">
          Holidays are highlighted in the calendar and are{' '}
          <strong className="text-gray-800">not</strong> counted toward absence days.
        </p>
      </div>
    </div>
  );
};
