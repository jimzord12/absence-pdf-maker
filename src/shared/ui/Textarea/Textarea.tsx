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
          <label htmlFor={textareaId} className="text-sm font-medium text-[color:var(--color-text-primary)]">
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
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-offset-[color:var(--color-background)]
          transition-colors resize-y bg-[color:var(--color-surface)] text-[color:var(--color-text-primary)]
          ${error ? 'border-[color:var(--color-error)] focus-visible:ring-[color:var(--color-error)]' : 'border-[color:var(--color-border)]'}
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

