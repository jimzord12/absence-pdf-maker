import React, { useEffect, useRef, useState } from 'react';
import { formatDate } from '../../../../shared/lib/dates';
import { showError, showSuccess } from '../../../../shared/lib/toast';
import { Button, Card } from '../../../../shared/ui';
import type { LeaveType, UserProfile } from '../../model/leaveRequest.types';
import { calculateAbsenceDays } from '../../services/absenceDays';
import { downloadLeaveRequestPdf } from '../../services/pdf/pdf.service';
import { exportProfileToJson, importProfileFromJson } from '../../services/persistence';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { useLocaleStore } from '../../state/locale.store';

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
  const profile = useLeaveRequestStore(state => state.profile);
  const leaveDraft = useLeaveRequestStore(state => state.leaveDraft);
  const signature = useLeaveRequestStore(state => state.signature);
  const holidays = useLeaveRequestStore(state => state.holidays);
  const isGeneratingPdf = useLeaveRequestStore(state => state.ui.isGeneratingPdf);
  const triggerValidation = useLeaveRequestStore(state => state.ui.triggerValidation);
  const { locale } = useLocaleStore(state => state);

  // Store actions
  const setProfile = useLeaveRequestStore(state => state.setProfile);
  const setIsGeneratingPdf = useLeaveRequestStore(state => state.setIsGeneratingPdf);
  const clearSignature = useLeaveRequestStore(state => state.clearSignature);
  const toggleSignatureModal = useLeaveRequestStore(state => state.toggleSignatureModal);
  const triggerForceFormReset = useLeaveRequestStore(state => state.triggerForceFormReset);

  // Component state
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
    try {
      exportProfileToJson();
      showSuccess('Profile exported successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export profile';
      showError(message);
    }
  };

  /**
   * Handles importing profile data from a JSON file.
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importProfileFromJson(file, () => {
        // Force form reset after successful import to sync with updated store
        triggerForceFormReset();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import profile';
      showError(message);
    }

    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles clearing the stored profile data and form.
   */
  const handleClearProfile = () => {
    setProfile({
      fullName: '',
      fathersName: '',
      email: '',
      phone: '',
      identityNumber: '',
      employeeId: '',
      companyName: '',
      department: '',
      position: '',
    });
    clearSignature();
    triggerForceFormReset(); // Force form to reset
    showSuccess('Profile cleared successfully!');
  };

  /**
   * Handles generating the PDF document.
   * Shows a loading state for at least 2 seconds to ensure the spinner is visible.
   */
  const handleGeneratePdf = async () => {
    // Validate all fields using the form's trigger function
    // This ensures validation runs on all fields, even untouched ones
    if (triggerValidation) {
      const isValid = await triggerValidation();
      if (!isValid) {
        showError('Please correct the validation errors before generating the PDF.');
        return;
      }
    }

    // Fallback validation if trigger is not available
    if (
      !profile.fullName ||
      !profile.fathersName ||
      !profile.email ||
      !profile.identityNumber ||
      !profile.companyName
    ) {
      showError('Please fill in all required personal and employment details before generating.');
      return;
    }

    if (!leaveDraft.startDate || !leaveDraft.endDate) {
      showError('Please select start and end dates for your leave.');
      return;
    }

    setIsGeneratingPdf(true);

    // Ensure minimum 2 second loading time
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const leaveRequestData = {
        profile: profile as UserProfile,
        leaveType: leaveDraft.leaveType ?? 'other',
        leaveAllowance: leaveDraft.leaveAllowance || false,
        startDate: leaveDraft.startDate,
        endDate: leaveDraft.endDate,
        reason: leaveDraft.reason,
        createdAt: new Date(),
        signatureDataUrl: signature.signatureDataUrl,
      };

      await Promise.all([
        downloadLeaveRequestPdf(leaveRequestData, holidays.holidaySet),
        minLoadTime,
      ]);

      showSuccess('PDF generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF';
      showError(message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Review and Generate"
      className={`space-y-6 ${!hasAnimated ? 'animate-fade-in-up animate-stagger-1' : ''}`}
    >
      {/* Profile Summary Section */}
      <section aria-labelledby="review-personal-details-heading">
        <Card>
          <h2 id="review-personal-details-heading" className="text-xl font-semibold mb-4">
            Personal Details Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Full Name</span>
              <p className="font-medium">{profile.fullName || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Father's Name</span>
              <p className="font-medium">{profile.fathersName || '—'}</p>
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
              <span className="text-sm text-gray-500">Identity Number</span>
              <p className="font-medium">{profile.identityNumber || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Employee ID</span>
              <p className="font-medium">{profile.employeeId || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Company Name</span>
              <p className="font-medium">{profile.companyName || '—'}</p>
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
          <h2 id="review-leave-details-heading" className="text-xl font-semibold mb-4">
            Leave Details Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-col justify-between">
              <span className="text-sm text-gray-500">Leave Type</span>
              <p className="font-medium">
                {leaveDraft.leaveType ? leaveTypeLabels[leaveDraft.leaveType] : '—'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Leave Allowance</span>
              <p className="font-medium">{leaveDraft.leaveAllowance ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Start Date</span>
              <p className="font-medium">
                {leaveDraft.startDate ? formatDate(leaveDraft.startDate, locale) : '—'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">End Date</span>
              <p className="font-medium">
                {leaveDraft.endDate ? formatDate(leaveDraft.endDate, locale) : '—'}
              </p>
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
                  <span className="font-medium text-lg text-gray-600">
                    {absenceBreakdown.weekendDays}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Holiday Days</span>
                  <span className="font-medium text-lg text-gray-600">
                    {absenceBreakdown.holidayDays}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Absence Days</span>
                  <span className="font-medium text-lg text-blue-600">
                    {absenceBreakdown.absenceDays}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Signature Status */}
          <div className="mt-4">
            <span className="text-sm text-gray-500">Signature</span>
            <div className="flex items-center justify-between mt-1">
              <p className="font-medium">
                {signature.signatureDataUrl ? (
                  <span className="text-green-600">✓ Signed</span>
                ) : (
                  <span className="text-red-500">✗ Not signed</span>
                )}
              </p>
              <Button variant="secondary" size="sm" onClick={toggleSignatureModal}>
                {signature.signatureDataUrl ? 'Update Signature' : 'Add Signature'}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Action Buttons Section */}
      <section aria-labelledby="review-actions-heading">
        <Card>
          <h2 id="review-actions-heading" className="text-xl font-semibold mb-4">
            Actions
          </h2>
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
                disabled={
                  !profile.fullName ||
                  !profile.email ||
                  !profile.identityNumber ||
                  !profile.companyName ||
                  !profile.department ||
                  !profile.position ||
                  !leaveDraft.startDate ||
                  !leaveDraft.endDate ||
                  !signature.signatureDataUrl
                }
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
    </aside>
  );
};
