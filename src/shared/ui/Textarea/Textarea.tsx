import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          {...(error ? { 'aria-invalid': 'true' } : { 'aria-invalid': 'false' })}
          aria-describedby={errorId}
          className={`
          w-full px-3 py-2 rounded-md border
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors resize-y
          ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

