# 051-fix-issue-012-personal-details-validation

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Implement comprehensive field validation for Personal Details section, including Greek Identity Number (ADT) format validation with support for multiple valid formats.

## Constraints

- Must use Zod schema validation
- Support multiple Greek identity number formats (ADT, AMKA, Passport)
- Validation errors must display in UI
- Must integrate with existing React Hook Form setup
- Maintain Greek (default) and English error messages

## Acceptance Criteria

- [ ] Personal Details fields show validation errors for invalid data
- [ ] Full Name: min 2 characters, Greek and Latin letters
- [ ] Father's Name: min 2 characters, Greek and Latin letters
- [ ] Email: valid email format with clear error message
- [ ] Phone: Greek phone format (+30 or 10 digits)
- [ ] Identity Number (ADT): validates against Greek formats:
  - Standard ADT: 8 digits (LLLDDDDD format)
  - AMKA: 11 digits with checksum
  - Passport: 2 letters + 7 digits
- [ ] Validation errors display below each field in red text
- [ ] Form cannot submit with invalid personal details
- [ ] All validation messages are user-friendly
- [ ] Tests for Greek ADT validation formats
- [ ] Tests for email and phone validation

## Notes

No notes.
