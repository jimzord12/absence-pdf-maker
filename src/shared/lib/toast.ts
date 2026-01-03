/**
 * Toast Notification Utility
 *
 * Centralized utility for displaying toast notifications using react-toastify.
 * Provides type-safe helper functions for different notification types.
 *
 * @module shared/lib/toast
 */

import { toast, type ToastPosition, type ToastOptions } from 'react-toastify';

/**
 * Default configuration for individual toast notifications
 */
const DEFAULT_CONFIG: ToastOptions = {
  position: 'top-right' as ToastPosition,
  autoClose: 8000, // 8 seconds default
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: true,
  theme: 'light',
};

/**
 * Default configuration for the ToastContainer component
 *
 * This constant can be imported and used for ToastContainer props
 * to ensure consistency across the application.
 *
 * @example
 * ```tsx
 * import { ToastContainer } from 'react-toastify';
 * import { DEFAULT_TOAST_CONTAINER_CONFIG } from '../../../shared/lib/toast';
 *
 * <ToastContainer {...DEFAULT_TOAST_CONTAINER_CONFIG} />
 * ```
 */
export const DEFAULT_TOAST_CONTAINER_CONFIG = {
  position: 'top-right' as ToastPosition,
  autoClose: 8000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: 'light',
} as const;

/**
 * Extended options for toast notifications
 */
export interface ToastNotificationOptions extends ToastOptions {
  /** Type of notification */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Whether the toast is dismissible by user */
  dismissible?: boolean;
  /** Custom duration in milliseconds */
  duration?: number;
}

/**
 * Display a toast notification with specified type and options
 *
 * @param message - The message to display
 * @param options - Configuration options for the toast
 */
export const showToast = (
  message: string,
  options: ToastNotificationOptions = {}
): void => {
  const { type = 'info', duration, ...restOptions } = options;

  const toastOptions: ToastOptions = {
    ...DEFAULT_CONFIG,
    ...restOptions,
    ...(duration !== undefined && { autoClose: duration }),
  };

  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast.warning(message, toastOptions);
      break;
    case 'info':
    default:
      toast.info(message, toastOptions);
      break;
  }
};

/**
 * Display a success notification
 *
 * @param message - The success message to display
 * @param options - Optional configuration
 */
export const showSuccess = (message: string, options?: ToastNotificationOptions): void => {
  showToast(message, { type: 'success', ...options });
};

/**
 * Display an error notification
 *
 * @param message - The error message to display
 * @param options - Optional configuration
 */
export const showError = (message: string, options?: ToastNotificationOptions): void => {
  showToast(message, { type: 'error', ...options });
};

/**
 * Display a warning notification
 *
 * @param message - The warning message to display
 * @param options - Optional configuration
 */
export const showWarning = (message: string, options?: ToastNotificationOptions): void => {
  showToast(message, { type: 'warning', ...options });
};

/**
 * Display an info notification
 *
 * @param message - The info message to display
 * @param options - Optional configuration
 */
export const showInfo = (message: string, options?: ToastNotificationOptions): void => {
  showToast(message, { type: 'info', ...options });
};

/**
 * Dismiss all active toast notifications
 */
export const dismissAllToasts = (): void => {
  toast.dismiss();
};

/**
 * Dismiss a specific toast notification
 *
 * @param toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId: number | string): void => {
  toast.dismiss(toastId);
};
