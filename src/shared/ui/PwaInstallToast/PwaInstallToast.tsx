import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui';
import { usePwaInstall } from '../../../app/providers/usePwaInstall';

const AUTO_DISMISS_DELAY = 5000; // 5 seconds

export function PwaInstallToast() {
  const { t } = useTranslation('common') as { t: (key: string) => string };
  const { canShowInstall, promptInstall, dismiss, snooze } = usePwaInstall();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(canShowInstall);

  useEffect(() => {
    setIsVisible(canShowInstall);
  }, [canShowInstall]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (!isVisible) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, AUTO_DISMISS_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  // Clear timeout if user manually dismisses
  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Clear timeout if user clicks install or snooze
  const handlePromptInstall = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    promptInstall();
  };

  const handleSnooze = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    snooze();
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
        key="pwa-install-toast"
        role="alert"
        aria-live="polite"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        onAnimationComplete={(definition) => {
          if (definition === 'exit') {
            dismiss();
          }
        }}
        className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
      >
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {t('pwa.installTitle')}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('pwa.installDescription')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t('pwa.dismiss')}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="primary"
              onClick={handlePromptInstall}
              className="flex-1 text-sm px-3 py-2"
            >
              {t('buttons.installApp')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSnooze}
              className="flex-1 text-sm px-3 py-2"
            >
              {t('pwa.remindLater')}
            </Button>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
