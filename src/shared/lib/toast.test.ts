/**
 * Toast Notification Utility Tests
 *
 * Tests the centralized toast notification utility.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import { dismissAllToasts, dismissToast, showError, showInfo, showSuccess, showWarning, showToast } from './toast';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
  ToastContainer: () => null,
}));

describe('Toast Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('showToast', () => {
    it('should display success toast with default options', () => {
      const message = 'Success message';
      showToast(message, { type: 'success' });

      expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
        position: 'top-right',
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        pauseOnFocusLoss: true,
        theme: 'light',
      }));
    });

    it('should display error toast', () => {
      const message = 'Error message';
      showToast(message, { type: 'error' });

      expect(toast.error).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should display warning toast', () => {
      const message = 'Warning message';
      showToast(message, { type: 'warning' });

      expect(toast.warning).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should display info toast (default)', () => {
      const message = 'Info message';
      showToast(message);

      expect(toast.info).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should display info toast when explicitly specified', () => {
      const message = 'Info message';
      showToast(message, { type: 'info' });

      expect(toast.info).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should apply custom duration', () => {
      const message = 'Message with custom duration';
      showToast(message, { type: 'success', duration: 5000 });

      expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
        autoClose: 5000,
      }));
    });

    it('should merge custom options with defaults', () => {
      const message = 'Message with custom options';
      const customOptions = {
        type: 'success' as const,
        draggable: false,
        pauseOnHover: false,
      };

      showToast(message, customOptions);

      expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
        position: 'top-right',
        autoClose: 8000,
        draggable: false,
        pauseOnHover: false,
      }));
    });
  });

  describe('showSuccess', () => {
    it('should display success toast', () => {
      const message = 'Operation completed successfully!';
      showSuccess(message);

      expect(toast.success).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should accept custom options', () => {
      const message = 'Success with options';
      const customOptions = { duration: 3000 };

      showSuccess(message, customOptions);

      expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
        autoClose: 3000,
      }));
    });
  });

  describe('showError', () => {
    it('should display error toast', () => {
      const message = 'An error occurred!';
      showError(message);

      expect(toast.error).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should accept custom options', () => {
      const message = 'Error with options';
      const customOptions = { duration: 10000 };

      showError(message, customOptions);

      expect(toast.error).toHaveBeenCalledWith(message, expect.objectContaining({
        autoClose: 10000,
      }));
    });
  });

  describe('showWarning', () => {
    it('should display warning toast', () => {
      const message = 'This is a warning!';
      showWarning(message);

      expect(toast.warning).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should accept custom options', () => {
      const message = 'Warning with options';
      const customOptions = { duration: 6000 };

      showWarning(message, customOptions);

      expect(toast.warning).toHaveBeenCalledWith(message, expect.objectContaining({
        autoClose: 6000,
      }));
    });
  });

  describe('showInfo', () => {
    it('should display info toast', () => {
      const message = 'This is info!';
      showInfo(message);

      expect(toast.info).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should accept custom options', () => {
      const message = 'Info with options';
      const customOptions = { duration: 4000 };

      showInfo(message, customOptions);

      expect(toast.info).toHaveBeenCalledWith(message, expect.objectContaining({
        autoClose: 4000,
      }));
    });
  });

  describe('dismissAllToasts', () => {
    it('should dismiss all active toasts', () => {
      dismissAllToasts();

      expect(toast.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('dismissToast', () => {
    it('should dismiss specific toast by ID', () => {
      const toastId = 'toast-123';
      dismissToast(toastId);

      expect(toast.dismiss).toHaveBeenCalledWith(toastId);
    });

    it('should dismiss toast with numeric ID', () => {
      const toastId = 123;
      dismissToast(toastId);

      expect(toast.dismiss).toHaveBeenCalledWith(toastId);
    });
  });
});
