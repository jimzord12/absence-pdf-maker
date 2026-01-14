# 140-form-logic-and-messaging-enhancements

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Enhance form validation logic for Leave Allowance and update error messaging for better user experience.

## Constraints

- Update Zod schemas in model/.
- Update i18next translation files (en/el).
- Write unit tests for validation changes.

## Acceptance Criteria

- [ ] exceedsAllowance toast message updated to "You have exceeded your Leave Days allowance." in both English and Greek.
- [ ] Leave Allowance (Days) field is optional in the personal details form.
- [ ] Validation for Leave Allowance only applies if the field is not empty.
- [ ] Unit tests verify the optional validation logic.

## Notes

No notes.
