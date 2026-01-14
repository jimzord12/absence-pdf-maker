import { zodResolver } from '@hookform/resolvers/zod';
import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../shared/ui';
import { LeaveRequestSchema } from '../../model/leaveRequest.schema';
import {
  useLeaveRequestStore,
  type LeaveDraftState,
  type ProfileState,
} from '../../state/leaveRequest.store';
import { EmploymentDetailsSection } from '../sections/EmploymentDetailsSection';
import { LeaveDetailsSection } from '../sections/LeaveDetailsSection';
import { PersonalDetailsSection } from '../sections/PersonalDetailsSection';

export const LeaveRequestForm = () => {
  const { t } = useTranslation('common');
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
    handleSubmit,
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
  // Note: React Compiler cannot optimize watch() subscription - this is expected
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
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

    // Only reset if the store values are different from both the form values
    // AND our last known synced values. This prevents resetting when the
    // change originated from this component's own sync-to-store effect.
    // We also check if the form is dirty to avoid interrupting user input,
    // unless it's a major change (like an import which we can't easily detect here,
    // but we can assume if the form is not dirty or if the change is large).
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

  return (
    <FormProvider {...methods}>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Required for integration tests */}
      <form
        onSubmit={handleSubmit(data => console.log('Form submitted:', data))}
        className="space-y-6 animate-fade-in-up"
        role="form"
      >
        <div className="animate-stagger-2">
          <PersonalDetailsSection errors={errors} />
        </div>

        <div className="animate-stagger-3">
          <EmploymentDetailsSection errors={errors} />
        </div>

        <div className="animate-stagger-4">
          <LeaveDetailsSection errors={errors} />
        </div>

        <div className="flex justify-end gap-4 pt-4 animate-stagger-5">
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              reset({
                profile: {
                  fullName: '',
                  fathersName: '',
                  email: '',
                  phone: '',
                  identityNumber: '',
                  employeeId: '',
                  companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
                  department: '',
                  position: '',
                },
                leaveType: 'annual',
                leaveAllowance: undefined,
                startDate: undefined,
                endDate: undefined,
                reason: '',
                createdAt: new Date(),
              });
            }}
          >
            {t('buttons.reset')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

