import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { LeaveRequestSchema } from '../model/leaveRequest.schema';
import type { LeaveRequest } from '../model/leaveRequest.types';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
import { calculateAbsenceDays } from '../services/absenceDays';
import { SignatureModal } from './SignatureModal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Textarea } from '../../../shared/ui/Textarea';
import { Card } from '../../../shared/ui/Card';
import { Alert } from '../../../shared/ui/Alert';

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
  } = useLeaveRequestStore();

  // Track if component has mounted to prevent animation replay on re-renders
  const [hasAnimated, setHasAnimated] = useState(false);

  // Set hasAnimated to true after animation completes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate absence days when dates change
  const absenceDaysCalculation =
    leaveDraft.startDate &&
    leaveDraft.endDate &&
    leaveDraft.startDate instanceof Date &&
    leaveDraft.endDate instanceof Date
      ? calculateAbsenceDays(leaveDraft.startDate, leaveDraft.endDate, holidaySet)
      : { totalDays: 0, holidayDays: 0, weekendDays: 0, absenceDays: 0 };

  // Setup React Hook Form with Zod resolver
  const {
    register,
    formState: { errors },
    watch,
    reset,
  } = useForm<LeaveRequest>({
    resolver: zodResolver(LeaveRequestSchema),
    mode: 'onSubmit',
    defaultValues: {
      profile: {
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        employeeId: profile.employeeId || '',
        department: profile.department || '',
        position: profile.position || '',
      },
      leaveType: leaveDraft.leaveType || 'annual',
      startDate: leaveDraft.startDate ?? undefined,
      endDate: leaveDraft.endDate ?? undefined,
      reason: leaveDraft.reason || '',
      createdAt: new Date(),
      signatureDataUrl: signature.signatureDataUrl || undefined,
    },
  });

  // Sync form changes to Zustand store
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.profile) {
        setProfile(value.profile);
      }
      setLeaveDraft({
        leaveType: value.leaveType,
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

  // Handle signature modal open

  // Handle signature modal open
  const handleOpenSignature = () => {
    toggleSignatureModal();
  };

  return (
    <>
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
              label="Department"
              placeholder="Engineering"
              {...register('profile.department')}
              error={errors.profile?.department?.message}
            />

            <Input
              label="Position"
              placeholder="Software Engineer"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                inputType="date"
                {...register('startDate', {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                error={errors.startDate?.message}
              />

              <Input
                label="End Date"
                inputType="date"
                {...register('endDate', {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                error={errors.endDate?.message}
              />
            </div>

            {/* Absence Days Calculation Display */}
            {absenceDaysCalculation.totalDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Absence Days Calculation</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Days:</span>
                    <span className="font-medium">{absenceDaysCalculation.totalDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Holidays:</span>
                    <span className="font-medium">{absenceDaysCalculation.holidayDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Weekends:</span>
                    <span className="font-medium">{absenceDaysCalculation.weekendDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-semibold">Absence Days:</span>
                    <span className="font-bold text-blue-900">
                      {absenceDaysCalculation.absenceDays}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Textarea
              label="Reason (Optional)"
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
                <img
                  src={signature.signatureDataUrl}
                  alt="Signature"
                  className="max-h-24"
                />
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleOpenSignature}
                  >
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
          <Button
            variant="secondary"
            type="button"
            onClick={() => reset()}
          >
            Reset Form
          </Button>
        </div>
      </form>

      {/* Signature Modal */}
      <SignatureModal />
    </>
  );
};
