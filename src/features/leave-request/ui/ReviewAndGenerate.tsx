import React, { useEffect, useRef, useState } from 'react';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { exportProfileToJson, importProfileFromJson } from '../services/persistence';
import { calculateAbsenceDays } from '../services/absenceDays';
import { formatDate } from '../../../shared/lib/dates';
import { Button, Card, Alert } from '../../../shared/ui';
import type { LeaveType } from '../model/leaveRequest.types';

/**
 * ReviewAndGenerate component displays a summary of the form data and provides
 * actions for exporting/importing profile data and generating the PDF document.
 */
export const ReviewAndGenerate: React.FC = () => {
  // Track if component has mounted to prevent animation replay on re-renders
  const [hasAnimated, setHasAnimated] = useState(false);

  // Set hasAnimated to true after animation completes (300ms + 100ms delay)
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);
  // Store selectors
  const profile = useLeaveRequestStore((state) => state.profile);
  const leaveDraft = useLeaveRequestStore((state) => state.leaveDraft);
  const signature = useLeaveRequestStore((state) => state.signature);
  const holidays = useLeaveRequestStore((state) => state.holidays);
  const isGeneratingPdf = useLeaveRequestStore((state) => state.ui.isGeneratingPdf);
  const errorMessage = useLeaveRequestStore((state) => state.ui.errorMessage);

  // Store actions
  const setProfile = useLeaveRequestStore((state) => state.setProfile);
  const setIsGeneratingPdf = useLeaveRequestStore((state) => state.setIsGeneratingPdf);
  const clearSignature = useLeaveRequestStore((state) => state.clearSignature);
  const clearErrorMessage = useLeaveRequestStore((state) => state.clearErrorMessage);

  // Component state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate absence days if dates are selected
  const absenceBreakdown =
    leaveDraft.startDate && leaveDraft.endDate
      ? calculateAbsenceDays(leaveDraft.startDate, leaveDraft.endDate, holidays.holidaySet)
      : null;

  // Format leave type for display
  const leaveTypeLabels: Record<LeaveType, string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leave',
    other: 'Other',
  };

  /**
   * Handles exporting the current profile to a JSON file.
   */
  const handleExport = () => {
    setImportError(null);
    try {
      exportProfileToJson();
      setSuccessMessage('Profile exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export profile';
      setImportError(message);
      setTimeout(() => setImportError(null), 5000);
    }
  };

  /**
   * Handles importing profile data from a JSON file.
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setSuccessMessage(null);

    try {
      await importProfileFromJson(file);
      setSuccessMessage('Profile imported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import profile';
      setImportError(message);
      setTimeout(() => setImportError(null), 5000);
    }

    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles clearing the stored profile data.
   */
  const handleClearProfile = () => {
    setProfile({
      fullName: '',
      email: '',
      phone: '',
      employeeId: '',
      department: '',
      position: '',
    });
    clearSignature();
    setSuccessMessage('Profile cleared successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /**
   * Handles generating the PDF document.
   * Shows a loading state for at least 2 seconds to ensure the spinner is visible.
   */
  const handleGeneratePdf = async () => {
    // Validation: Check if required fields are filled
    if (!profile.fullName || !profile.email || !profile.employeeId) {
      setImportError('Please fill in your name, email, and employee ID before generating.');
      setTimeout(() => setImportError(null), 5000);
      return;
    }

    if (!leaveDraft.startDate || !leaveDraft.endDate) {
      setImportError('Please select start and end dates for your leave.');
      setTimeout(() => setImportError(null), 5000);
      return;
    }

    setImportError(null);
    setSuccessMessage(null);
    setIsGeneratingPdf(true);

    // Ensure minimum 2 second loading time
    const minLoadTime = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // TODO: This will be connected to the actual PDF service in task 024
      await minLoadTime;

      setSuccessMessage('PDF generated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF';
      setImportError(message);
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className={`space-y-6 ${!hasAnimated ? 'animate-fade-in-up animate-stagger-1' : ''}`}>
      {/* Success/Error Messages */}
      {errorMessage && (
        <Alert variant="error" onDismiss={clearErrorMessage}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {importError && (
        <Alert variant="error" onDismiss={() => setImportError(null)}>
          {importError}
        </Alert>
      )}

      {/* Profile Summary Section */}
      <section aria-labelledby="review-personal-details-heading">
        <Card>
          <h2 id="review-personal-details-heading" className="text-xl font-semibold mb-4">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Full Name</span>
            <p className="font-medium">{profile.fullName || '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Email</span>
            <p className="font-medium">{profile.email || '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Phone</span>
            <p className="font-medium">{profile.phone || '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Employee ID</span>
            <p className="font-medium">{profile.employeeId || '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Department</span>
            <p className="font-medium">{profile.department || '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Position</span>
            <p className="font-medium">{profile.position || '—'}</p>
          </div>
        </div>
        </Card>
      </section>

      {/* Leave Details Summary Section */}
      <section aria-labelledby="review-leave-details-heading">
        <Card>
          <h2 id="review-leave-details-heading" className="text-xl font-semibold mb-4">Leave Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Leave Type</span>
            <p className="font-medium">{leaveDraft.leaveType ? leaveTypeLabels[leaveDraft.leaveType] : '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Start Date</span>
            <p className="font-medium">{leaveDraft.startDate ? formatDate(leaveDraft.startDate) : '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">End Date</span>
            <p className="font-medium">{leaveDraft.endDate ? formatDate(leaveDraft.endDate) : '—'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Reason</span>
            <p className="font-medium">{leaveDraft.reason || '—'}</p>
          </div>
        </div>

        {/* Absence Days Breakdown */}
        {absenceBreakdown && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Absence Days Calculation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Total Days</span>
                <span className="font-medium text-lg">{absenceBreakdown.totalDays}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Weekend Days</span>
                <span className="font-medium text-lg text-gray-600">{absenceBreakdown.weekendDays}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Holiday Days</span>
                <span className="font-medium text-lg text-gray-600">{absenceBreakdown.holidayDays}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Absence Days</span>
                <span className="font-medium text-lg text-blue-600">{absenceBreakdown.absenceDays}</span>
              </div>
            </div>
          </div>
        )}

        {/* Signature Status */}
        <div className="mt-4">
          <span className="text-sm text-gray-500">Signature</span>
          <p className="font-medium">
            {signature.signatureDataUrl ? (
              <span className="text-green-600">✓ Signed</span>
            ) : (
              <span className="text-red-500">✗ Not signed</span>
            )}
            </p>
          </div>
        </Card>
      </section>

      {/* Action Buttons Section */}
      <section aria-labelledby="review-actions-heading">
        <Card>
          <h2 id="review-actions-heading" className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-y-4">
          {/* Profile Management */}
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport} size="md">
              Export Profile
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} size="md">
              Import Profile
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import profile from JSON file"
            />
            <Button variant="danger" onClick={handleClearProfile} size="md">
              Clear Profile
            </Button>
          </div>

          <hr className="border-gray-200" />

          {/* PDF Generation */}
          <div>
            <Button
              variant="primary"
              onClick={handleGeneratePdf}
              isLoading={isGeneratingPdf}
              loadingText="Generating PDF..."
              size="lg"
              disabled={!profile.fullName || !profile.employeeId || !leaveDraft.startDate || !leaveDraft.endDate}
              className="w-full md:w-auto"
            >
              Generate PDF
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {isGeneratingPdf
                ? 'Please wait while we generate your PDF document...'
                : 'Click to generate and download your leave request PDF'}
            </p>
          </div>
        </div>
        </Card>
      </section>
    </div>
  );
};
