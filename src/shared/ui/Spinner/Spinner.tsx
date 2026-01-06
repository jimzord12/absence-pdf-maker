import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Custom spinner with a visually rich animation.
 * Uses CSS keyframe animation for smooth, jank-free performance.
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: {
      container: 'w-8 h-8',
      dot: '0.5rem', // w-2 = 0.5rem
    },
    md: {
      container: 'w-12 h-12',
      dot: '0.75rem', // w-3 = 0.75rem
    },
    lg: {
      container: 'w-16 h-16',
      dot: '1rem', // w-4 = 1rem
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={`${currentSize.container} flex items-center justify-center gap-1 ${className}`}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="animate-pulse-dot bg-[color:var(--color-primary)]"
          style={{
            width: currentSize.dot,
            height: currentSize.dot,
            borderRadius: '50%',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};

