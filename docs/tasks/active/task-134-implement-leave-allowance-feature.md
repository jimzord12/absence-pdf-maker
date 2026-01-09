# task-134-implement-leave-allowance-feature

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#APPLICATION_ISSUES.md](../issues/open/APPLICATION_ISSUES.md.md)

---

## Description

Implement Leave Allowance feature that is currently showing "no" instead of an actual value. Users should be able to input their available leave allowance (e.g., 25 days), which should be displayed in the Review section and used for validation to prevent requesting more days than available.

## Constraints

- Leave request model likely in `src/features/leave-request/model/leaveRequest.schema.ts`
- Form component likely in `src/features/leave-request/ui/LeaveRequestForm.tsx`
- Use React Hook Form with Zod resolver (project standard)
- Persist allowance data in Zustand store
- Follow existing form field patterns (like fullName, email, etc.)
- Add validation to prevent negative numbers or zero

## Acceptance Criteria

- [ ] Leave Allowance field accepts numeric input in the form
- [ ] Allowance value is persisted to Zustand store
- [ ] Review section displays actual numeric allowance value (not "no")
- [ ] Leave request validation checks if absence days <= available allowance
- [ ] User can update allowance value in Personal Details section
- [ ] Field has proper Zod schema validation (positive numbers only)
- [ ] Greek and English labels/translations exist

## Notes

No notes.
