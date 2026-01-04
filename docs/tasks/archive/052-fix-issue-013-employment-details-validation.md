# 052-fix-issue-013-employment-details-validation

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Implement validation for Employment Details section fields, ensuring Company Name, Department, and Position are required with appropriate error handling.

## Constraints

- Must use Zod schema validation
- Company Name has default value "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
- Employee ID remains optional
- Validation errors must display in UI
- Integrate with existing React Hook Form setup

## Acceptance Criteria

- [ ] Employment Details fields show validation errors for invalid data
- [ ] Company Name: required, min 2 characters, editable
- [ ] Company Name pre-filled with "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
- [ ] Department: required, min 2 characters
- [ ] Position: required, min 2 characters
- [ ] Employee ID: optional, allows alphanumeric
- [ ] Validation errors display below each field in red text
- [ ] Form cannot submit with empty required employment fields
- [ ] All validation messages are user-friendly
- [ ] Asterisk (\*) displayed on required fields
- [ ] Tests for employment field validation
- [ ] Tests for default company name behavior

## Notes

No notes.
