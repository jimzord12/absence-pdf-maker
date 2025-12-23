import React, { useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`
          w-full px-3 py-2 rounded-md border
          focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors resize-y
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
