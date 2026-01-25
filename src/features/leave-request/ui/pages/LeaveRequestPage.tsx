import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import creatorGithubLogo from '../../../../assets/images/Dimitrios-Stamatakis-github-img.png';
import { useThemeStore } from '../../../../shared/state/theme.store';
import { DeveloperPresence, StarsWarsRobotToggle, ThemeToggle } from '../../../../shared/ui';
import { loadHolidays } from '../../services/holidays/holidays.service';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
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
    <div className="min-h-screen bg-radial-[at_50%_80%] from-white to-blue-300 dark:bg-radial-[at_50%_50%] dark:from-(--color-background) dark:to-border py-8 px-4 sm:px-6 lg:px-8 overflow-scroll">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col max-sm:items-start items-center justify-start gap-4 md:flex-row md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text-primary)]">
                {t('page.title')}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                {t('page.subtitle')}
              </p>
              <div className="mt-4">
                <LocaleSelector />
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {/* Desktop: Show StarsWarsRobotToggle and LocaleSelector at @768px and above */}
              <div className="max-md:hidden flex flex-col gap-2 items-center">
                <StarsWarsRobotToggle
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  aria-label="Toggle dark mode"
                />
              </div>

              {/* Mobile: Show ThemeToggle and LocaleSelector below @768px */}
              <div className="md:hidden flex flex-row gap-3">
                <ThemeToggle aria-label="Toggle dark mode" />
              </div>
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
          <DeveloperPresence avatarUrl={creatorGithubLogo} name="Dimitrios Stamatakis" size="lg" />
        </div>
      </div>
      <SignatureModal />
    </div>
  );
};

