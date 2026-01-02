import React, { useId } from 'react';

export type InputType = 'text' | 'email' | 'tel' | 'number' | 'password' | 'date';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  inputType?: InputType;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  inputType = 'text',
  className = '',
  id,
  required = false,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={inputType}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`
          w-full px-3 py-2 rounded-md border
          overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'}
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
