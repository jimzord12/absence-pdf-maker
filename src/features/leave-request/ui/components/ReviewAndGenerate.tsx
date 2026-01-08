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
import { useTranslation } from 'react-i18next';
import { PdfLanguageSelector } from './PdfLanguageSelector';

/**
 * ReviewAndGenerate component displays a summary of the form data and provides
 * actions for exporting/importing profile data and generating the PDF document.
 */
export const ReviewAndGenerate: React.FC = () => {
  const { t } = useTranslation() as { t: (key: string, options?: Record<string, unknown>) => string };

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

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
    annual: t('forms.leave.types.annual'),
    sick: t('forms.leave.types.sick'),
    unpaid: t('forms.leave.types.unpaid'),
    other: t('forms.leave.types.other'),
  };

  /**
   * Handles exporting the current profile to a JSON file.
   */
  const handleExport = () => {
    try {
      exportProfileToJson(t);
      showSuccess(t('messages.persistence.exportSuccess'));
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
      await importProfileFromJson(file, t, () => {
        triggerForceFormReset();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import profile';
      showError(message);
    }

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
    triggerForceFormReset();
    showSuccess(t('common.cleared'));
  };

  /**
   * Handles generating the PDF document.
   * Shows a loading state for at least 2 seconds to ensure the spinner is visible.
   */
  const handleGeneratePdf = async () => {
    if (triggerValidation) {
      const isValid = await triggerValidation();
      if (!isValid) {
        showError(t('pdf.validationErrors'));
        return;
      }
    }

    if (
      !profile.fullName ||
      !profile.fathersName ||
      !profile.email ||
      !profile.identityNumber ||
      !profile.companyName
    ) {
      showError(t('pdf.missingDetails'));
      return;
    }

    if (!leaveDraft.startDate || !leaveDraft.endDate) {
      showError(t('pdf.missingDates'));
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
        downloadLeaveRequestPdf(leaveRequestData, holidays.holidaySet, t),
        minLoadTime,
      ]);

      showSuccess(t('pdf.generationSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF';
      showError(t('pdf.generationFailed', { message }));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <aside
      aria-label={t('forms.review.heading')}
      className={`space-y-6 ${!hasAnimated ? 'animate-fade-in-up animate-stagger-1' : ''}`}
    >
      {/* Profile Summary Section */}
      <section aria-labelledby="review-personal-details-heading">
        <Card>
          <h2 id="review-personal-details-heading" className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]">
            {t('forms.personal.heading')}
          </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.fullName')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.fullName || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.fathersName')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.fathersName || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.email')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.email || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.phone')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.phone || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.identityNumber')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.identityNumber || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.employeeId')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.employeeId || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.companyName')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.companyName || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.department')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.department || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('messages.fields.position')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{profile.position || '—'}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Leave Details Summary Section */}
      <section aria-labelledby="review-leave-details-heading">
        <Card>
          <h2 id="review-leave-details-heading" className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]">
            {t('forms.leave.heading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-col justify-between">
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('forms.leave.leaveType')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.leaveType ? leaveTypeLabels[leaveDraft.leaveType] : '—'}
              </p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('forms.dateRange.leaveAllowance')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{leaveDraft.leaveAllowance ? t('common.yes') : t('common.no')}</p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('forms.dateRange.startDate')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.startDate ? formatDate(leaveDraft.startDate, locale) : '—'}
              </p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('forms.dateRange.endDate')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.endDate ? formatDate(leaveDraft.endDate, locale) : '—'}
              </p>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">{t('forms.leave.reason')}</span>
              <p className="font-medium text-[color:var(--color-text-primary)]">{leaveDraft.reason || '—'}</p>
            </div>
          </div>

          {/* Absence Days Breakdown */}
          {absenceBreakdown && (
            <div className="mt-4 p-4 bg-[color:var(--color-surface-hover)] rounded-lg">
              <h3 className="font-semibold mb-2 text-[color:var(--color-text-primary)]">{t('forms.leave.absence.calculationHeading')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">{t('forms.leave.absence.totalDays')}</span>
                  <span className="font-medium text-lg text-[color:var(--color-text-primary)]">{absenceBreakdown.totalDays}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">{t('forms.leave.absence.weekendDays')}</span>
                  <span className="font-medium text-lg text-[color:var(--color-text-muted)]">
                    {absenceBreakdown.weekendDays}
                  </span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">{t('forms.leave.absence.holidayDays')}</span>
                  <span className="font-medium text-lg text-[color:var(--color-text-muted)]">
                    {absenceBreakdown.holidayDays}
                  </span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">{t('forms.leave.absence.absenceDays')}</span>
                  <span className="font-medium text-lg text-[color:var(--color-info-700)] dark:text-[color:var(--color-info-300)]">
                    {absenceBreakdown.absenceDays}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Signature Status */}
          <div className="mt-4">
            <span className="text-sm text-[color:var(--color-text-secondary)]">{t('forms.signature.label')}</span>
              <div className="flex items-center justify-between mt-1">
                <p className="font-medium text-[color:var(--color-text-primary)]">
                  {signature.signatureDataUrl ? (
                    <span className="text-[color:var(--color-success)]">{t('common.status.signed')}</span>
                  ) : (
                    <span className="text-[color:var(--color-error)]">{t('common.status.notSigned')}</span>
                  )}
                </p>
                <Button variant="secondary" size="sm" onClick={toggleSignatureModal}>
                  {signature.signatureDataUrl ? t('common.status.update') : t('common.status.add')}
                </Button>
             </div>
          </div>
        </Card>
      </section>

      {/* Action Buttons Section */}
      <section aria-labelledby="review-actions-heading">
        <Card>
          <h2 id="review-actions-heading" className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]">
            {t('forms.actions.heading')}
          </h2>
          <div className="space-y-4">
            {/* Profile Management */}
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleExport} size="md">
                {t('common.buttons.exportProfile')}
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} size="md">
                {t('common.buttons.importProfile')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                aria-label={t('common.buttons.importProfile')}
              />
              <Button variant="danger" onClick={handleClearProfile} size="md">
                {t('common.buttons.clearProfile')}
              </Button>
            </div>

            <hr className="border-[color:var(--color-border)]" />

            {/* PDF Generation */}
            <div className="space-y-4">
              <PdfLanguageSelector />
               <Button
                variant="primary"
                onClick={handleGeneratePdf}
                isLoading={isGeneratingPdf}
                loadingText={t('pdf.loadingMessage')}
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
                  !signature.signatureDataUrl ||
                  absenceBreakdown?.absenceDays === 0
                }
                className="w-full md:w-auto"
              >
                {t('pdf.clickToGenerate')}
              </Button>
              <p className="text-sm text-[color:var(--color-text-secondary)] mt-2">
                {isGeneratingPdf
                  ? t('pdf.loadingMessage')
                  : t('pdf.clickToGenerate')}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </aside>
  );
};

