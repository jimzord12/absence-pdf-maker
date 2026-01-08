import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-offset-[color:var(--color-background)]';

    const variantStyles = {
      primary:
        'bg-[color:var(--color-primary)] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-primary-hover)] focus:ring-[color:var(--color-primary)] dark:hover:bg-[color:var(--color-primary-light)]',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-[color:var(--color-surface-hover)] dark:text-[color:var(--color-text-primary)] dark:border dark:border-[color:var(--color-border)] dark:hover:bg-[color:var(--color-border)]',
      danger:
        'bg-[color:var(--color-error)] text-white hover:bg-[color:var(--color-error-hover)] focus:ring-[color:var(--color-error)]',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const spinnerSize: 'sm' | 'md' = size === 'lg' ? 'md' : 'sm';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={spinnerSize} className="mr-2" />
            {loadingText || t('loading')}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

