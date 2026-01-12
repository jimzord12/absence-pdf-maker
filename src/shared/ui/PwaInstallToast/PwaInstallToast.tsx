import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';
import { usePwaInstall } from '../../../app/providers/usePwaInstall';

export function PwaInstallToast() {
  const { t } = useTranslation('common') as { t: (key: string) => string };
  const { canShowInstall, promptInstall, dismiss, snooze } = usePwaInstall();

  if (!canShowInstall) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-md w-full animate-in-up"
    >
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-4 mr-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('pwa.installTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('pwa.installDescription')}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('pwa.dismiss')}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={promptInstall}>
            {t('buttons.installApp')}
          </Button>
          <Button variant="secondary" onClick={snooze} className="w-full">
            {t('pwa.remindLater')}
          </Button>
        </div>
      </div>
    </div>
  );
}
