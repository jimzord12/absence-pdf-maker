import React, { forwardRef } from 'react';
import styles from './StarsWarsRobotToggle.module.css';

export interface StarsWarsRobotToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  id?: string;
  name?: string;
  tabIndex?: number;
}

/**
 * Star Wars BB-8 Theme Toggle Component
 *
 * Visually rich theme toggle with BB-8 droid, stars, planets, and clouds.
 * Original design by Galahhad from Uiverse.io.
 *
 * @example
 * ```tsx
 * <StarsWarsRobotToggle checked={isDarkMode} onChange={setIsDarkMode} aria-label="Toggle dark mode" />
 * ```
 */
export const StarsWarsRobotToggle = forwardRef<HTMLInputElement, StarsWarsRobotToggleProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      'aria-label': ariaLabel = 'Toggle theme',
      className = '',
      id,
      name,
    },
    ref
  ) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;
        onChange?.(newChecked);
      },
      [onChange]
    );

    return (
      <label
        className={`${styles['starswars-toggle']} ${className}`}
        aria-label={ariaLabel}
      >
        <input
          ref={ref}
          id={id}
          name={name}
          className={styles['starswars-toggle__checkbox']}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className={styles['starswars-toggle__container']}>
          <div className={styles['starswars-toggle__scenery']}>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars-toggle__star']}></div>
            <div className={styles['starswars__star-1']}></div>
            <div className={styles['starswars__star-2']}></div>
            <div className={styles['starswars__planet']}></div>
            <div className={styles['starswars__satellite']}></div>
            <div className={styles['starswars__satellite-small']}></div>
            <div className={styles['starswars-toggle__cloud']}></div>
            <div className={styles['starswars-toggle__cloud']}></div>
            <div className={styles['starswars-toggle__cloud']}></div>
          </div>
          <div className={styles['starswars__bb8']}>
            <div className={styles['starswars__bb8-head-container']}>
              <div className={styles['starswars__bb8-antenna']}></div>
              <div className={styles['starswars__bb8-antenna']}></div>
              <div className={styles['starswars__bb8-head']}></div>
            </div>
            <div className={styles['starswars__bb8-body']}></div>
          </div>
          <div className={styles['starswars__artificial-hidden']}>
            <div className={styles['starswars__bb8-shadow']}></div>
          </div>
        </div>
      </label>
    );
  }
);

StarsWarsRobotToggle.displayName = 'StarsWarsRobotToggle';

