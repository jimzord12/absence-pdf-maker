import React, { useId } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Card, Input } from '../../../../shared/ui';
import type { LeaveRequest } from '../../model/leaveRequest.types';

interface EmploymentDetailsSectionProps {
  errors?: FieldErrors<LeaveRequest>;
}

/**
 * EmploymentDetailsSection component
 *
 * Displays form fields for employment information (Employment Details Form):
 * - Employee ID (text input, optional)
 * - Company Name (text input, with default value)
 * - Department (text input)
 * - Position (text input)
 *
 * Integrates with React Hook Form for validation and state management.
 * Uses shared UI components (Card, Input) for consistent styling.
 * Follows the same pattern as PersonalDetailsSection.
 */
export const EmploymentDetailsSection: React.FC<EmploymentDetailsSectionProps> = ({ errors }) => {
  // Access form context for register function if not passed directly
  // This allows the component to work both with and without FormContext
  const methods = useFormContext<LeaveRequest>();

  const { register } = methods || {};
  const { t } = useTranslation('forms') as { t: (key: string, options?: Record<string, unknown>) => string };

  // Generate unique ID for accessibility (WCAG 2.1 Level A: unique id attribute values)
  const headingId = useId();

  return (
    <section aria-labelledby={`employment-details-heading-${headingId}`}>
      <Card>
        <h2 id={`employment-details-heading-${headingId}`} className="text-xl font-semibold mb-4 text-[color:var(--color-text-primary)]">
          {t('employment.heading')}
        </h2>
        <div className="space-y-4">
          <Input
            label={t('employment.employeeId')}
            placeholder={t('employment.employeeIdPlaceholder')}
            inputType="text"
            {...register?.('profile.employeeId')}
            error={errors?.profile?.employeeId?.message}
          />

          <Input
            label={t('employment.companyName')}
            placeholder={t('employment.companyNamePlaceholder')}
            inputType="text"
            required
            {...register?.('profile.companyName')}
            error={errors?.profile?.companyName?.message}
          />

          <Input
            label={t('employment.department')}
            placeholder={t('employment.departmentPlaceholder')}
            inputType="text"
            required
            {...register?.('profile.department')}
            error={errors?.profile?.department?.message}
          />

          <Input
            label={t('employment.position')}
            placeholder={t('employment.positionPlaceholder')}
            inputType="text"
            required
            {...register?.('profile.position')}
            error={errors?.profile?.position?.message}
          />
        </div>
      </Card>
    </section>
  );
};

