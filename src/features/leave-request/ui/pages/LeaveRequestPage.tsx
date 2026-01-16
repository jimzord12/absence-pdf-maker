import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeveloperPresence, StarsWarsRobotToggle } from '../../../../shared/ui';
import { loadHolidays } from '../../services/holidays/holidays.service';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { useThemeStore } from '../../../../shared/state/theme.store';
import { LeaveRequestForm } from '../components/LeaveRequestForm';
import { LocaleSelector } from '../components/LocaleSelector';
import { ReviewAndGenerate } from '../components/ReviewAndGenerate';
import { SignatureModal } from '../components/SignatureModal';

/**
 * LeaveRequestPage - Page component that wraps the leave request form
 * and manages overall layout, header, and page-level state.
 */
export const LeaveRequestPage: React.FC = () => {
  const { t } = useTranslation('common');
  const setHolidays = useLeaveRequestStore(state => state.setHolidays);
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  // Load holidays on page mount
  useEffect(() => {
    const holidaySet = loadHolidays();
    setHolidays({ holidaySet });

    if (import.meta.env.DEV) {
      console.log('[LeaveRequestPage] Holidays loaded:', holidaySet.size, 'dates');
    }
  }, [setHolidays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[color:var(--color-background)] to-[color:var(--color-surface)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
          <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text-primary)]">{t('page.title')}</h1>
              <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                {t('page.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StarsWarsRobotToggle
                checked={theme === 'dark'}
                onChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
              <LocaleSelector />
            </div>
          </div>
        </div>

        {/* Page Content - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <LeaveRequestForm />
          </div>

          {/* Sidebar - Review and Generate - Takes 1 column on desktop */}
          <div className="lg:col-span-1">
            <ReviewAndGenerate />
          </div>
        </div>

        <div className="mt-12">
          <DeveloperPresence
            avatarUrl="src/assets/images/Dimitrios-Stamatakis-github-img.png"
            name="Dimitrios Stamatakis"
            size="lg"
          />
        </div>
      </div>
      <SignatureModal />
    </div>
  );
};

