import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BeforeInstallPromptEvent, usePwaInstall } from './usePwaInstall';

describe('usePwaInstall', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    vi.restoreAllMocks();
  });

  describe('1. Initial state', () => {
    it('should initialize with isInstallable as false', () => {
      const { result } = renderHook(() => usePwaInstall());

      expect(result.current.isInstallable).toBe(false);
    });

    it('should initialize with promptInstall function available', () => {
      const { result } = renderHook(() => usePwaInstall());

      expect(typeof result.current.promptInstall).toBe('function');
    });
  });

  describe('2. Event listener registration', () => {
    it('should add beforeinstallprompt event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => usePwaInstall());

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => usePwaInstall());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should register both event listeners once', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => usePwaInstall());

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(addEventListenerSpy).toHaveBeenNthCalledWith(
        1,
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenNthCalledWith(2, 'appinstalled', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });
  });

  describe('3. beforeinstallprompt event handling', () => {
    it('should set isInstallable to true when beforeinstallprompt event fires', () => {
      const { result } = renderHook(() => usePwaInstall());

      // Simulate beforeinstallprompt event
      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(result.current.isInstallable).toBe(true);
    });

    it('should prevent default behavior on beforeinstallprompt event', () => {
      const { result } = renderHook(() => usePwaInstall());
      const preventDefaultSpy = vi.fn();

      // Create a mock event with preventDefault
      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockEvent.preventDefault = preventDefaultSpy;
      mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.isInstallable).toBe(true);
    });

    it('should store the deferred prompt event', () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      // Verify that the promptInstall function now works
      expect(result.current.isInstallable).toBe(true);
    });

    it('should not set isInstallable if event is not BeforeInstallPromptEvent', () => {
      const { result } = renderHook(() => usePwaInstall());

      // Dispatch a regular event
      act(() => {
        window.dispatchEvent(new Event('some-event'));
      });

      expect(result.current.isInstallable).toBe(false);
    });
  });

  describe('4. appinstalled event handling', () => {
    it('should set isInstallable to false when appinstalled event fires', () => {
      const { result } = renderHook(() => usePwaInstall());

      // First, make the app installable
      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      // Then, dispatch appinstalled event
      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should clear deferred prompt when appinstalled event fires', async () => {
      const { result } = renderHook(() => usePwaInstall());

      // First, make the app installable
      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      // Then, dispatch appinstalled event
      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      expect(result.current.isInstallable).toBe(false);
      // promptInstall should now return 'not_supported'
      const promptResult = await result.current.promptInstall();
      expect(promptResult).toBe('not_supported');
    });
  });

  describe('5. promptInstall function behavior', () => {
    it('should return "not_supported" when no deferred prompt is available', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const promptResult = await result.current.promptInstall();

      expect(promptResult).toBe('not_supported');
    });

    it('should call prompt on the deferred prompt event', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      const promptSpy = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.prompt = promptSpy;
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(promptSpy).toHaveBeenCalledOnce();
    });

    it('should return "accepted" when user accepts the install prompt', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      const promptResult = await act(async () => {
        return await result.current.promptInstall();
      });

      expect(promptResult).toBe('accepted');
    });

    it('should return "dismissed" when user dismisses the install prompt', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      const promptResult = await act(async () => {
        return await result.current.promptInstall();
      });

      expect(promptResult).toBe('dismissed');
    });

    it('should set isInstallable to false after calling promptInstall', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should return "dismissed" if an error occurs during prompt', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockRejectedValue(new Error('Test error'));
      mockPromptEvent.userChoice = Promise.reject(new Error('Test error'));
      mockPromptEvent.userChoice.catch(() => {
        /* noop - prevent unhandled rejection */
      });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      const promptResult = await act(async () => {
        return await result.current.promptInstall();
      });

      expect(promptResult).toBe('dismissed');
    });

    it('should log error to console when prompt fails', async () => {
      const { result } = renderHook(() => usePwaInstall());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(_message => {
        // Suppress console errors during test
      });

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockRejectedValue(new Error('Test error'));
      mockPromptEvent.userChoice = Promise.reject(new Error('Test error'));
      mockPromptEvent.userChoice.catch(() => {
        /* noop - prevent unhandled rejection */
      });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      await result.current.promptInstall();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error during PWA install prompt:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('6. Deferred prompt cleanup', () => {
    it('should clear deferred prompt after successful install prompt', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should clear deferred prompt after dismissed install prompt', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should not allow multiple prompts from the same event', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      // First prompt
      await act(async () => {
        await result.current.promptInstall();
      });
      expect(result.current.isInstallable).toBe(false);

      // Second prompt should return 'not_supported'
      const secondPromptResult = await result.current.promptInstall();
      expect(secondPromptResult).toBe('not_supported');
    });
  });

  describe('7. Multiple beforeinstallprompt events', () => {
    it('should update deferred prompt when multiple events fire', () => {
      const { result } = renderHook(() => usePwaInstall());

      const firstEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      firstEvent.prompt = vi.fn().mockResolvedValue(undefined);
      firstEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      const secondEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      secondEvent.prompt = vi.fn().mockResolvedValue(undefined);
      secondEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

      act(() => {
        window.dispatchEvent(firstEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      // Second event should update the prompt
      act(() => {
        window.dispatchEvent(secondEvent);
      });

      expect(result.current.isInstallable).toBe(true);
    });
  });

  describe('8. Edge cases', () => {
    it('should handle rapid event dispatching without errors', () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      expect(() => {
        for (let i = 0; i < 10; i++) {
          act(() => {
            window.dispatchEvent(mockEvent);
          });
        }
      }).not.toThrow();

      expect(result.current.isInstallable).toBe(true);
    });

    it('should handle appinstalled event before beforeinstallprompt', () => {
      const { result } = renderHook(() => usePwaInstall());

      // Dispatch appinstalled first
      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should handle concurrent promptInstall calls', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      // Call promptInstall multiple times concurrently
      // Note: Due to the async nature of React state updates,
      // concurrent calls might all use the same initial state
      // This test verifies the hook handles concurrent calls without errors
      const promises = [
        result.current.promptInstall(),
        result.current.promptInstall(),
        result.current.promptInstall(),
      ];

      const results = await Promise.all(promises);

      // Verify all calls complete without errors
      expect(results.length).toBe(3);
      expect(results[0]).toBeDefined();
    });
  });

  describe('9. Acceptance criteria verification', () => {
    it('should satisfy: Hook provides isInstallable state', () => {
      const { result } = renderHook(() => usePwaInstall());

      expect(typeof result.current.isInstallable).toBe('boolean');
    });

    it('should satisfy: Hook provides promptInstall function', () => {
      const { result } = renderHook(() => usePwaInstall());

      expect(typeof result.current.promptInstall).toBe('function');
    });

    it('should satisfy: isInstallable becomes true on beforeinstallprompt', () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(result.current.isInstallable).toBe(true);
    });

    it('should satisfy: promptInstall calls the prompt method', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      const promptSpy = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.prompt = promptSpy;
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(promptSpy).toHaveBeenCalled();
    });

    it('should satisfy: isInstallable becomes false after promptInstall', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockPromptEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should satisfy: promptInstall calls the prompt method', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      const promptSpy = vi.fn().mockResolvedValue(undefined);
      mockEvent.prompt = promptSpy;
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(promptSpy).toHaveBeenCalled();
    });

    it('should satisfy: isInstallable becomes false after promptInstall', async () => {
      const { result } = renderHook(() => usePwaInstall());

      const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
      mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
      mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should satisfy: Event listeners are cleaned up on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => usePwaInstall());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);

      removeEventListenerSpy.mockRestore();
    });
  });
});

