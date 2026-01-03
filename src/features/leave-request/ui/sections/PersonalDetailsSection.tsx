import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Card, Input } from '../../../../shared/ui';
import type { LeaveRequest } from '../../model/leaveRequest.types';

interface PersonalDetailsSectionProps {
  errors?: FieldErrors<LeaveRequest>;
}

/**
 * PersonalDetailsSection component
 *
 * Displays form fields for personal information (Personal Details Form):
 * - Full Name (text input)
 * - Email (email type input with validation)
 * - Phone Number (tel type input)
 *
 * Integrates with React Hook Form for validation and state management.
 * Uses shared UI components (Card, Input) for consistent styling.
 */
export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({ errors }) => {
  // Access form context for register function if not passed directly
  // This allows the component to work both with and without FormContext
  const methods = useFormContext<LeaveRequest>();

  const { register } = methods || {};

  return (
    <section aria-labelledby="personal-details-heading">
      <Card>
        <h2 id="personal-details-heading" className="text-xl font-semibold mb-4">
          Personal Details Form
        </h2>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            inputType="text"
            required
            {...register?.('profile.fullName')}
            error={errors?.profile?.fullName?.message}
          />

          <Input
            label="Father's Name"
            placeholder="Enter father's name"
            inputType="text"
            required
            {...register?.('profile.fathersName')}
            error={errors?.profile?.fathersName?.message}
          />

          <Input
            label="Identity Number (ADT)"
            placeholder="Enter identity number"
            inputType="text"
            required
            {...register?.('profile.identityNumber')}
            error={errors?.profile?.identityNumber?.message}
          />

          <Input
            label="Email Address"
            placeholder="your.email@company.com"
            inputType="email"
            required
            {...register?.('profile.email')}
            error={errors?.profile?.email?.message}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            inputType="tel"
            required
            {...register?.('profile.phone')}
            error={errors?.profile?.phone?.message}
          />
        </div>
      </Card>
    </section>
  );
};

