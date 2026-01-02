import { useEffect } from 'react';
import { usePwaInstall } from '../../../../app/providers/usePwaInstall';
import { Button } from '../../../../shared/ui';
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
  const setHolidays = useLeaveRequestStore(state => state.setHolidays);
  const { isInstallable, promptInstall } = usePwaInstall();

  // Load holidays on page mount
  useEffect(() => {
    const holidaySet = loadHolidays();
    setHolidays({ holidaySet });

    if (import.meta.env.DEV) {
      console.log('[LeaveRequestPage] Holidays loaded:', holidaySet.size, 'dates');
    }
  }, [setHolidays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Request</h1>
              <p className="mt-2 text-sm text-gray-600">
                Submit your leave request and generate a PDF document
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isInstallable && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => promptInstall()}
                  className="mt-0 sm:mt-1"
                >
                  Install App
                </Button>
              )}
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
      </div>
      <SignatureModal />
    </div>
  );
};

