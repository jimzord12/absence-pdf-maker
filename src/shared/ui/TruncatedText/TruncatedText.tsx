/**
 * TruncatedText component displays text with an ellipsis when it exceeds the specified max length.
 * Supports optional full text on hover tooltip.
 */

import React, { useState } from 'react';

interface TruncatedTextProps {
  text: string | undefined;
  maxLength?: number;
  className?: string;
  showTooltip?: boolean;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 50,
  className = '',
  showTooltip = true,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  if (!text) {
    return <span className={className}>—</span>;
  }

  const shouldTruncate = text.length > maxLength;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  const truncatedText = text.substring(0, maxLength).trim() + '...';

  return (
    <span
      className={`inline-block ${showTooltip ? 'cursor-help' : ''} ${className}`}
      onMouseEnter={() => showTooltip && setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      title={showTooltip ? text : undefined}
    >
      {truncatedText}
      {isTooltipVisible && showTooltip && (
        <div className="fixed z-50 p-3 max-w-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-xl border border-gray-700 dark:border-gray-300">
          {text}
        </div>
      )}
    </span>
  );
};
