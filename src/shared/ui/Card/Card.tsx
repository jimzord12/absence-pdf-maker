import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      padding = 'md',
      bordered = true,
      shadow = 'sm',
      hoverable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const borderStyles = bordered ? 'border border-gray-200' : '';
    const shadowStyles = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    const hoverStyles = hoverable ? 'hover:shadow-md transition-shadow duration-200' : '';

    return (
      <div
        ref={ref}
        className={`
        bg-white rounded-lg
        ${paddingStyles[padding]}
        ${borderStyles}
        ${shadowStyles[shadow]}
        ${hoverStyles}
        ${className}
      `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

