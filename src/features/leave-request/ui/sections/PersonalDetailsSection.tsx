import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('forms') as { t: (key: string, options?: Record<string, unknown>) => string };

  return (
    <section aria-labelledby="personal-details-heading">
      <Card>
        <h2 id="personal-details-heading" className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]">
          {t('personal.heading')}
        </h2>
        <div className="space-y-4">
          <Input
            label={t('personal.fullName')}
            placeholder={t('personal.fullNamePlaceholder')}
            inputType="text"
            required
            {...register?.('profile.fullName')}
            error={errors?.profile?.fullName?.message}
          />

          <Input
            label={t('personal.fathersName')}
            placeholder={t('personal.fathersNamePlaceholder')}
            inputType="text"
            required
            {...register?.('profile.fathersName')}
            error={errors?.profile?.fathersName?.message}
          />

          <Input
            label={t('personal.identityNumber')}
            placeholder={t('personal.identityNumberPlaceholder')}
            inputType="text"
            required
            {...register?.('profile.identityNumber')}
            error={errors?.profile?.identityNumber?.message}
          />

          <Input
            label={t('personal.email')}
            placeholder={t('personal.emailPlaceholder')}
            inputType="email"
            required
            {...register?.('profile.email')}
            error={errors?.profile?.email?.message}
          />

          <Input
            label={t('personal.phone')}
            placeholder={t('personal.phonePlaceholder')}
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

