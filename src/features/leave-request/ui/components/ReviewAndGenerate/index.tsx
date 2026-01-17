import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../../../shared/lib/dates';
import { showError, showSuccess } from '../../../../../shared/lib/toast';
import { Button, Card, TruncatedText } from '../../../../../shared/ui';
import { PwaInstallToast } from '../../../../../shared/ui/PwaInstallToast/PwaInstallToast';
import type { LeaveType, UserProfile } from '../../../model/leaveRequest.types';
import { calculateAbsenceDays } from '../../../services/absenceDays';
import { downloadLeaveRequestPdf } from '../../../services/pdf/pdf.service';
import { exportProfileToJson, importProfileFromJson } from '../../../services/persistence';
import { useLeaveRequestStore } from '../../../state/leaveRequest.store';
import { useLocaleStore } from '../../../state/locale.store';
import { PdfLanguageSelector } from '../PdfLanguageSelector';

/**
 * ReviewAndGenerate component displays a summary of the form data and provides
 * actions for exporting/importing profile data and generating the PDF document.
 */
export const ReviewAndGenerate: React.FC = () => {
  const { t } = useTranslation('forms') as {
    t: (key: string, options?: Record<string, unknown>) => string;
  };
  const { t: tCommon } = useTranslation('common') as {
    t: (key: string, options?: Record<string, unknown>) => string;
  };

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const profile = useLeaveRequestStore(state => state.profile);
  const leaveDraft = useLeaveRequestStore(state => state.leaveDraft);
  const userPreferences = useLeaveRequestStore(state => state.userPreferences);
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
  const incrementPdfGenerationCount = useLeaveRequestStore(
    state => state.incrementPdfGenerationCount
  );
  const setUserPreferences = useLeaveRequestStore(state => state.setUserPreferences);
  const refreshFormField = useLeaveRequestStore(state => state.ui.refreshFormField);

  // Component state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate absence days if dates are selected
  const absenceBreakdown =
    leaveDraft.startDate && leaveDraft.endDate
      ? calculateAbsenceDays(leaveDraft.startDate, leaveDraft.endDate, holidays.holidaySet)
      : null;

  const decreaseAbsenceAllowanceIfNeeded = () => {
    if (
      userPreferences.leaveAllowance === null ||
      userPreferences.leaveAllowance === undefined ||
      !absenceBreakdown
    )
      return;

    const newAllowance =
      userPreferences.leaveAllowance - (absenceBreakdown ? absenceBreakdown.absenceDays : 0);
    setUserPreferences({ leaveAllowance: newAllowance });
    refreshFormField?.();
  };

  // Format leave type for display
  const leaveTypeLabels: Record<LeaveType, string> = {
    annual: t('leave.types.annual'),
    sick: t('leave.types.sick'),
    unpaid: t('leave.types.unpaid'),
    other: t('leave.types.other'),
  };

  /**
   * Handles exporting the current profile to a JSON file.
   */
  const handleExport = () => {
    try {
      exportProfileToJson(t);
      showSuccess(t('persistence.exportSuccess', { ns: 'messages' }));
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
      showSuccess(t('persistence.importSuccess', { ns: 'messages' }));
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
    showSuccess(tCommon('cleared'));
  };

  /**
   * Handles generating the PDF document.
   */
  const handleGeneratePdf = async () => {
    if (triggerValidation) {
      const isValid = await triggerValidation();
      if (!isValid) {
        showError(t('pdf.validationErrors', { ns: 'messages' }));
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
      showError(t('pdf.missingDetails', { ns: 'messages' }));
      return;
    }

    if (!leaveDraft.startDate || !leaveDraft.endDate) {
      showError(t('pdf.missingDates', { ns: 'messages' }));
      return;
    }

    if (
      userPreferences.leaveAllowance !== null &&
      userPreferences.leaveAllowance !== undefined &&
      absenceBreakdown &&
      absenceBreakdown.absenceDays > userPreferences.leaveAllowance
    ) {
      showError(t('exceedsAllowance'));
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const leaveRequestData = {
        profile: profile as UserProfile,
        leaveType: leaveDraft.leaveType ?? 'other',
        leaveAllowance: userPreferences.leaveAllowance ?? undefined,
        startDate: leaveDraft.startDate,
        endDate: leaveDraft.endDate,
        reason: leaveDraft.reason,
        createdAt: new Date(),
        signatureDataUrl: signature.signatureDataUrl,
      };

      await downloadLeaveRequestPdf(leaveRequestData, holidays.holidaySet, t);

      showSuccess(t('pdf.generationSuccess', { ns: 'messages' }));
      incrementPdfGenerationCount();
      decreaseAbsenceAllowanceIfNeeded();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF';
      showError(t('pdf.generationFailed', { ns: 'messages', message }));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <aside
      aria-label={t('review.heading')}
      className={`space-y-6 ${!hasAnimated ? 'animate-fade-in-up animate-stagger-1' : ''}`}
    >
      {/* Profile Summary Section */}
      <section aria-labelledby="review-personal-details-heading">
        <Card>
          <h2
            id="review-personal-details-heading"
            className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]"
          >
            {t('personal.summaryHeading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.fullName', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.fullName} maxLength={50} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.fathersName', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.fathersName} maxLength={50} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.email', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.email} maxLength={40} className="break-all" />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.phone', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.phone} maxLength={25} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.identityNumber', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.identityNumber} maxLength={25} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.employeeId', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.employeeId} maxLength={30} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.companyName', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.companyName} maxLength={60} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.department', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.department} maxLength={60} />
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('fields.position', { ns: 'messages' })}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                <TruncatedText text={profile.position} maxLength={60} />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section aria-labelledby="review-leave-details-heading">
        <Card>
          <h2
            id="review-leave-details-heading"
            className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]"
          >
            {t('leave.summaryHeading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-col justify-between">
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('leave.leaveType')}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.leaveType ? leaveTypeLabels[leaveDraft.leaveType] : '—'}
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('dateRange.leaveAllowance')}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                {userPreferences.leaveAllowance !== null &&
                userPreferences.leaveAllowance !== undefined
                  ? `${userPreferences.leaveAllowance} ${t('dateRange.days')}`
                  : '—'}
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('dateRange.startDate')}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.startDate ? formatDate(leaveDraft.startDate, locale) : '—'}
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('dateRange.endDate')}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.endDate ? formatDate(leaveDraft.endDate, locale) : '—'}
              </div>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {t('leave.reason')}
              </span>
              <div className="font-medium text-[color:var(--color-text-primary)]">
                {leaveDraft.reason || '—'}
              </div>
            </div>
          </div>

          {/* Absence Days Breakdown */}
          {absenceBreakdown && (
            <div className="mt-4 p-4 bg-[color:var(--color-surface-hover)] rounded-lg">
              <h3 className="font-semibold mb-2 text-[color:var(--color-text-primary)]">
                {t('leave.absence.calculationHeading')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">
                    {t('leave.absence.totalDays')}
                  </span>
                  <span className="font-medium text-lg text-[color:var(--color-text-primary)]">
                    {absenceBreakdown.totalDays}
                  </span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">
                    {t('leave.absence.weekendDays')}
                  </span>
                  <span className="font-medium text-lg text-[color:var(--color-text-muted)]">
                    {absenceBreakdown.weekendDays}
                  </span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">
                    {t('leave.absence.holidayDays')}
                  </span>
                  <span className="font-medium text-lg text-[color:var(--color-text-muted)]">
                    {absenceBreakdown.holidayDays}
                  </span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)] block">
                    {t('leave.absence.absenceDays')}
                  </span>
                  <span className="font-medium text-lg text-[color:var(--color-info-700)] dark:text-[color:var(--color-info-300)]">
                    {absenceBreakdown.absenceDays}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Signature Status */}
          <div className="mt-4">
            <span className="text-sm text-[color:var(--color-text-secondary)]">
              {t('signature.label')}
            </span>
            <div className="flex items-center justify-between mt-1">
              <div className="font-medium text-[color:var(--color-text-primary)]">
                {signature.signatureDataUrl ? (
                  <span className="text-[color:var(--color-success)]">
                    {t('status.signed', { ns: 'common' })}
                  </span>
                ) : (
                  <span className="text-[color:var(--color-error-text)]">
                    {t('status.notSigned', { ns: 'common' })}
                  </span>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={toggleSignatureModal}>
                {signature.signatureDataUrl
                  ? t('status.update', { ns: 'common' })
                  : t('status.add', { ns: 'common' })}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Action Buttons Section */}
      <section aria-labelledby="review-actions-heading">
        <Card>
          <h2
            id="review-actions-heading"
            className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]"
          >
            {t('actions.heading')}
          </h2>
          <div className="space-y-4">
            <div>
              <Button
                variant="secondary"
                onClick={() => {
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
                  triggerForceFormReset();
                  showSuccess(tCommon('cleared'));
                }}
                size="md"
              >
                {tCommon('buttons.reset')}
              </Button>
            </div>

            <hr className="border-[color:var(--color-border)]" />

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleExport} size="md">
                {tCommon('buttons.exportProfile')}
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} size="md">
                {tCommon('buttons.importProfile')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                aria-label={t('actions.importProfileAria')}
              />
              <Button variant="danger" onClick={handleClearProfile} size="md">
                {tCommon('buttons.clearProfile')}
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
                loadingText={t('pdf.loadingMessage', { ns: 'messages' })}
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
                  absenceBreakdown?.absenceDays === 0 ||
                  (userPreferences.leaveAllowance !== null &&
                    userPreferences.leaveAllowance !== undefined &&
                    absenceBreakdown !== undefined &&
                    absenceBreakdown !== null &&
                    absenceBreakdown.absenceDays > userPreferences.leaveAllowance)
                }
                className="w-full md:w-auto"
              >
                {tCommon('buttons.generatePdf')}
              </Button>

              <p className="text-sm text-[color:var(--color-text-secondary)] mt-2">
                {isGeneratingPdf
                  ? t('pdf.loadingMessage', { ns: 'messages' })
                  : t('pdf.clickToGenerate', { ns: 'messages' })}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <PwaInstallToast />
    </aside>
  );
};

