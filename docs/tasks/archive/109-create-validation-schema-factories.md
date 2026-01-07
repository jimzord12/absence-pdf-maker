# task-109-create-validation-schema-factories

**Priority:** high
**Blocks:** task-110-migrate-personal-details-section, task-111-migrate-employment-details-section, task-112-migrate-leave-details-section, task-113-migrate-date-range-field, task-114-migrate-signature-modal, task-115-migrate-leave-request-form, task-116-migrate-review-and-generate, task-117-migrate-leave-request-page
**Blocked By:** task-101-install-i18next-dependencies, task-104-create-translation-files, task-106-update-locale-store-with-i18next
**Issue:** N/A

---

## Description

Refactor validation schemas to use factory pattern with i18next t function for localized error messages.

## Constraints

- Create factory functions that accept TFunction parameter
- Use t() for all validation error messages
- Maintain existing regex patterns and validation logic
- Keep TypeScript types exported
- Update LeaveRequestFormData type to use factory return type

## Acceptance Criteria

- [ ] createLeaveRequestSchema factory created
- [ ] All validation messages use t('validation.*') keys
- [ ] Regex patterns unchanged from original
- [ ] LeaveRequestFormData type correctly inferred
- [ ] leaveRequest.schema.ts exports both factory and types

## Notes

No notes.
