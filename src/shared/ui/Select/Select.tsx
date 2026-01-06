import React, { forwardRef, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, value, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[color:var(--color-text-primary)]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          value={value}
          {...(error ? { 'aria-invalid': 'true' } : { 'aria-invalid': 'false' })}
          aria-describedby={errorId}
          className={`
          w-full px-3 py-2 rounded-md border bg-[color:var(--color-surface)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-offset-[color:var(--color-background)]
          transition-colors text-[color:var(--color-text-primary)]
          ${error ? 'border-[color:var(--color-error)] focus-visible:ring-[color:var(--color-error)]' : 'border-[color:var(--color-border)]'}
          ${className}
        `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

