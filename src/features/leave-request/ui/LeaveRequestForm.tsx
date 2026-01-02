import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert } from '../../../shared/ui/Alert';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Textarea } from '../../../shared/ui/Textarea';
import { LeaveRequestSchema } from '../model/leaveRequest.schema';
import type { LeaveRequest } from '../model/leaveRequest.types';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { useLocaleStore } from '../state/locale.store';
import { DateRangeField } from './DateRangeField';
import { SignatureModal } from './SignatureModal';

// Leave type options for the select dropdown
const leaveTypeOptions = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'other', label: 'Other' },
];

export const LeaveRequestForm: React.FC = () => {
  const {
    profile,
    leaveDraft,
    signature,
    holidays: { holidaySet },
    ui: { errorMessage },
    setProfile,
    setLeaveDraft,
    setSignature,
    toggleSignatureModal,
    clearErrorMessage,
    setTriggerValidation,
  } = useLeaveRequestStore();
  const { locale } = useLocaleStore();

  // Track if component has mounted to prevent animation replay on re-renders
  const [hasAnimated, setHasAnimated] = useState(false);

  // Set hasAnimated to true after animation completes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);



  const methods = useForm<LeaveRequest>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(LeaveRequestSchema) as any,
    mode: 'onTouched',
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
      leaveAllowance: leaveDraft.leaveAllowance ?? false,
      startDate: leaveDraft.startDate ?? undefined,
      endDate: leaveDraft.endDate ?? undefined,
      reason: leaveDraft.reason || '',
      createdAt: new Date(),
      signatureDataUrl: signature.signatureDataUrl || undefined,
    },
  });

  const {
    register,
    formState: { errors },
    watch,
    reset,
  } = methods;

  // Sync form changes to Zustand store
  useEffect(() => {
    const subscription = watch(value => {
      if (value.profile) {
        setProfile(value.profile);
      }
      setLeaveDraft({
        leaveType: value.leaveType,
        leaveAllowance: value.leaveAllowance,
        startDate: value.startDate,
        endDate: value.endDate,
        reason: value.reason,
      });
      if (value.signatureDataUrl) {
        setSignature({ signatureDataUrl: value.signatureDataUrl });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setProfile, setLeaveDraft, setSignature]);

  // Expose validation trigger function to store for PDF generation
  useEffect(() => {
    setTriggerValidation(async () => {
      const result = await methods.trigger();
      return result;
    });
  }, [methods, setTriggerValidation]);

  // Handle signature modal open
  const handleOpenSignature = () => {
    toggleSignatureModal();
  };

  return (
    <>
      <FormProvider {...methods}>
        <form className={`space-y-6 ${!hasAnimated ? 'animate-fade-in-up' : ''}`} role="form">
        {/* Error Message */}
        {errorMessage && (
          <Alert variant="error" onDismiss={clearErrorMessage} className="animate-stagger-1">
            {errorMessage}
          </Alert>
        )}

        {/* Personal Details Section */}
        <Card className="animate-stagger-2">
          <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              {...register('profile.fullName')}
              error={errors.profile?.fullName?.message}
            />

            <Input
              label="Father's Name"
              placeholder="Enter father's name"
              {...register('profile.fathersName')}
              error={errors.profile?.fathersName?.message}
            />

            <Input
              label="Identity Number (ADT)"
              placeholder="Enter identity number"
              {...register('profile.identityNumber')}
              error={errors.profile?.identityNumber?.message}
            />

            <Input
              label="Email Address"
              inputType="email"
              placeholder="your.email@company.com"
              {...register('profile.email')}
              error={errors.profile?.email?.message}
            />

            <Input
              label="Phone Number"
              inputType="tel"
              placeholder="+1 (555) 123-4567"
              {...register('profile.phone')}
              error={errors.profile?.phone?.message}
            />
          </div>
        </Card>

        {/* Employment Details Section */}
        <Card className="animate-stagger-3">
          <h2 className="text-xl font-semibold mb-4">Employment Details</h2>
          <div className="space-y-4">
            <Input
              label="Employee ID (Optional)"
              placeholder="Leave blank if not applicable"
              {...register('profile.employeeId')}
              error={errors.profile?.employeeId?.message}
            />

            <Input
              label="Company Name"
              placeholder="Enter company name"
              required
              {...register('profile.companyName')}
              error={errors.profile?.companyName?.message}
            />

            <Input
              label="Department"
              placeholder="Engineering"
              required
              {...register('profile.department')}
              error={errors.profile?.department?.message}
            />

            <Input
              label="Position"
              placeholder="Software Engineer"
              required
              {...register('profile.position')}
              error={errors.profile?.position?.message}
            />
          </div>
        </Card>

        {/* Leave Details Section */}
        <Card className="animate-stagger-4">
          <h2 className="text-xl font-semibold mb-4">Leave Details</h2>
          <div className="space-y-4">
            <Select
              label="Leave Type"
              options={leaveTypeOptions}
              {...register('leaveType')}
              error={errors.leaveType?.message}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="leaveAllowance"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                {...register('leaveAllowance')}
              />
              <label htmlFor="leaveAllowance" className="text-sm font-medium text-gray-700">
                Request Leave Allowance (Επίδομα Αδείας)
              </label>
            </div>

            <DateRangeField
              errors={errors}
              holidaySet={holidaySet}
              locale={locale}
            />

            <Textarea
              label="Reason"
              placeholder="Provide a reason for your leave request..."
              {...register('reason')}
              error={errors.reason?.message}
              rows={4}
            />
          </div>
        </Card>

        {/* Signature Section */}
        <Card className="animate-stagger-5">
          <h2 className="text-xl font-semibold mb-4">Signature</h2>
          <div className="space-y-4">
            {signature.signatureDataUrl ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Your Signature:</p>
                <img src={signature.signatureDataUrl} alt="Signature" className="max-h-24" />
                <div className="mt-2">
                  <Button variant="secondary" type="button" onClick={handleOpenSignature}>
                    Update Signature
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                type="button"
                onClick={handleOpenSignature}
                className="w-full"
              >
                Capture Signature
              </Button>
            )}
            {errors.signatureDataUrl && (
              <p className="text-sm text-red-600">{errors.signatureDataUrl.message}</p>
            )}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end animate-stagger-6">
          <Button variant="secondary" type="button" onClick={() => reset()}>
            Reset Form
          </Button>
        </div>
        </form>
      </FormProvider>

      {/* Signature Modal */}
      <SignatureModal />
    </>
  );
};

