import React, { forwardRef, useId } from 'react';

export type InputType = 'text' | 'email' | 'tel' | 'number' | 'password' | 'date';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  inputType?: InputType;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, inputType = 'text', className = '', id, required = false, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[color:var(--color-text-primary)]">
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={inputType}
          {...(error ? { 'aria-invalid': 'true' } : { 'aria-invalid': 'false' })}
          aria-describedby={errorId}
          className={`
          w-full px-3 py-2 rounded-md border
          overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-offset-[color:var(--color-background)]
          transition-colors bg-[color:var(--color-surface)] text-[color:var(--color-text-primary)]
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

Input.displayName = 'Input';

