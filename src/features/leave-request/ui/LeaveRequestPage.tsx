import { useEffect } from 'react';
import { LeaveRequestForm } from './LeaveRequestForm';
import { ReviewAndGenerate } from './ReviewAndGenerate';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { loadHolidays } from '../services/holidays/holidays.service';

/**
 * LeaveRequestPage - Page component that wraps the leave request form
 * and manages overall layout, header, and page-level state.
 */
export const LeaveRequestPage: React.FC = () => {
  const setHolidays = useLeaveRequestStore((state) => state.setHolidays);

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
          <h1 className="text-3xl font-bold text-gray-900">
            Leave Request
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Submit your leave request and generate a PDF document
          </p>
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
    </div>
  );
};
