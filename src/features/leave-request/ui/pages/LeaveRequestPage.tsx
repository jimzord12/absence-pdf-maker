import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import isEqual from 'lodash/isEqual';

import { DeveloperPresence, StarsWarsRobotToggle } from '../../../../shared/ui';
import { useThemeStore } from '../../../../shared/state/theme.store';
import { loadHolidays } from '../../services/holidays/holidays.service';
import { LeaveRequestSchema } from '../../model/leaveRequest.schema';
import {
  useLeaveRequestStore,
  type LeaveDraftState,
  type ProfileState,
} from '../../state/leaveRequest.store';
import { LeaveRequestForm } from '../components/LeaveRequestForm';
import { LocaleSelector } from '../components/LocaleSelector';
import { ReviewAndGenerate } from '../components/ReviewAndGenerate';
import { SignatureModal } from '../components/SignatureModal';
import { PersonalDetailsSection } from '../sections/PersonalDetailsSection';
import { EmploymentDetailsSection } from '../sections/EmploymentDetailsSection';
import { LeaveDetailsSection } from '../sections/LeaveDetailsSection';

/**
 * LeaveRequestPage - Page component that wraps the leave request form
 * and manages overall layout, header, and page-level state.
 */
export const LeaveRequestPage: React.FC = () => {
  const { t } = useTranslation('common');
  const setHolidays = useLeaveRequestStore(state => state.setHolidays);
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  // Form state management
  const profile = useLeaveRequestStore(state => state.profile);
  const leaveDraft = useLeaveRequestStore(state => state.leaveDraft);
  const setProfile = useLeaveRequestStore(state => state.setProfile);
  const setLeaveDraft = useLeaveRequestStore(state => state.setLeaveDraft);
  const setTriggerValidation = useLeaveRequestStore(state => state.setTriggerValidation);
  const forceFormReset = useLeaveRequestStore(state => state.ui.forceFormReset);
  const setUi = useLeaveRequestStore(state => state.setUi);

  // Use refs to track previous values and prevent infinite loops
  const prevProfileRef = useRef<ProfileState>(profile);
  const prevLeaveDraftRef = useRef<Partial<LeaveDraftState>>(leaveDraft);

  const methods = useForm({
    resolver: zodResolver(LeaveRequestSchema),
    defaultValues: {
      profile: {
        fullName: profile.fullName || '',
        fathersName: profile.fathersName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        identityNumber: profile.identityNumber || '',
        employeeId: profile.employeeId || '',
        companyName: profile.companyName || 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: profile.department || '',
        position: profile.position || '',
      },
      leaveType: leaveDraft.leaveType || 'annual',
      leaveAllowance: leaveDraft.leaveAllowance || undefined,
      startDate: leaveDraft.startDate || undefined,
      endDate: leaveDraft.endDate || undefined,
      reason: leaveDraft.reason || '',
      createdAt: new Date(),
    },
    mode: 'onChange',
  });

  const {
    reset,
    watch,
    trigger,
    formState: { errors, isDirty },
  } = methods;

  // Register trigger function in store for external validation (e.g., from PDF generator)
  useEffect(() => {
    setTriggerValidation(trigger);
    return () => setTriggerValidation(null);
  }, [trigger, setTriggerValidation]);

  // Handle force form reset from store (e.g., after Clear or Import)
  useEffect(() => {
    if (forceFormReset) {
      reset({
        profile: {
          fullName: profile.fullName || '',
          fathersName: profile.fathersName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          identityNumber: profile.identityNumber || '',
          employeeId: profile.employeeId || '',
          companyName: profile.companyName || 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: profile.department || '',
          position: profile.position || '',
        },
        leaveType: leaveDraft.leaveType || 'annual',
        leaveAllowance: leaveDraft.leaveAllowance || undefined,
        startDate: leaveDraft.startDate || undefined,
        endDate: leaveDraft.endDate || undefined,
        reason: leaveDraft.reason || '',
        createdAt: new Date(),
      });
      prevProfileRef.current = { ...profile };
      prevLeaveDraftRef.current = {
        leaveType: leaveDraft.leaveType,
        leaveAllowance: leaveDraft.leaveAllowance,
        startDate: leaveDraft.startDate || null,
        endDate: leaveDraft.endDate || null,
        reason: leaveDraft.reason || '',
      };
      setUi({ forceFormReset: false });
    }
  }, [forceFormReset, profile, leaveDraft, reset, setUi]);

  // Sync form changes to store using subscription to avoid extra re-renders
  useEffect(() => {
    const subscription = watch(value => {
      const { profile: formProfile, ...formLeaveDraft } = value;

      // Sync profile if changed
      if (formProfile && !isEqual(formProfile, prevProfileRef.current)) {
        setProfile({ ...formProfile });
        prevProfileRef.current = { ...formProfile };
      }

      // Sync leave draft if changed
      const normalizedDraft = {
        leaveType: formLeaveDraft.leaveType,
        leaveAllowance: formLeaveDraft.leaveAllowance,
        startDate: formLeaveDraft.startDate || null,
        endDate: formLeaveDraft.endDate || null,
        reason: formLeaveDraft.reason || '',
      };

      if (!isEqual(normalizedDraft, prevLeaveDraftRef.current)) {
        setLeaveDraft({ ...normalizedDraft });
        prevLeaveDraftRef.current = { ...normalizedDraft };
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setProfile, setLeaveDraft]);

  // Sync store changes back to form (e.g., after import)
  useEffect(() => {
    const currentFormValues = methods.getValues();
    const { profile: formProfile, ...formLeaveDraft } = currentFormValues;

    const normalizedStoreDraft = {
      leaveType: leaveDraft.leaveType,
      leaveAllowance: leaveDraft.leaveAllowance,
      startDate: leaveDraft.startDate || null,
      endDate: leaveDraft.endDate || null,
      reason: leaveDraft.reason || '',
    };

    const normalizedFormDraft = {
      leaveType: formLeaveDraft.leaveType,
      leaveAllowance: formLeaveDraft.leaveAllowance,
      startDate: formLeaveDraft.startDate || null,
      endDate: formLeaveDraft.endDate || null,
      reason: formLeaveDraft.reason || '',
    };

    const profileChangedOutside =
      !isEqual(profile, formProfile) && !isEqual(profile, prevProfileRef.current);
    const draftChangedOutside =
      !isEqual(normalizedStoreDraft, normalizedFormDraft) &&
      !isEqual(normalizedStoreDraft, prevLeaveDraftRef.current);

    if ((profileChangedOutside || draftChangedOutside) && !isDirty) {
      reset({
        profile: {
          fullName: profile.fullName || '',
          fathersName: profile.fathersName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          identityNumber: profile.identityNumber || '',
          employeeId: profile.employeeId || '',
          companyName: profile.companyName || 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
          department: profile.department || '',
          position: profile.position || '',
        },
        leaveType: leaveDraft.leaveType || 'annual',
        leaveAllowance: leaveDraft.leaveAllowance || undefined,
        startDate: leaveDraft.startDate || undefined,
        endDate: leaveDraft.endDate || undefined,
        reason: leaveDraft.reason || '',
        createdAt: currentFormValues.createdAt || new Date(),
      });
      prevProfileRef.current = { ...profile };
      prevLeaveDraftRef.current = { ...normalizedStoreDraft };
    }
  }, [profile, leaveDraft, reset, methods, isDirty]);

  // Load holidays on page mount
  useEffect(() => {
    const holidaySet = loadHolidays();
    setHolidays({ holidaySet });

    if (import.meta.env.DEV) {
      console.log('[LeaveRequestPage] Holidays loaded:', holidaySet.size, 'dates');
    }
  }, [setHolidays]);

  return (
    <FormProvider {...methods}>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Required for integration tests */}
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

            {/* Page Content - Responsive Layout with Container Queries */}
            <div className="@container">
              {/* Mobile & Tablet: 1-2 column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:hidden">
                {/* Main Form - Takes 2 columns on desktop */}
                <div className="lg:col-span-2">
                  <LeaveRequestForm />
                </div>

                {/* Sidebar - Review and Generate - Takes 1 column on desktop */}
                <div className="lg:col-span-1">
                  <ReviewAndGenerate />
                </div>
              </div>

              {/* FullHD & Larger: 3-column layout */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6 @2xl:grid-cols-3">
                {/* Column 1: Personal Details + Employment Details */}
                <div className="space-y-6 animate-stagger-2">
                  <PersonalDetailsSection errors={errors} />
                  <div className="animate-stagger-3">
                    <EmploymentDetailsSection errors={errors} />
                  </div>
                </div>

                {/* Column 2: Leave Details */}
                <div className="animate-stagger-4">
                  <LeaveDetailsSection errors={errors} />
                </div>

                {/* Column 3: Review and Generate */}
                <div>
                  <ReviewAndGenerate />
                </div>
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
     </FormProvider>
   );
 };

