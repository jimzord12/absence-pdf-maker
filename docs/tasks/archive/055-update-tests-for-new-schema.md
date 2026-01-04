# 055-update-tests-for-new-schema

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Update outdated test files to match new Personal Details schema structure and validation requirements introduced in Task 051.

## Constraints

- All tests must pass after updates
- Must follow project test conventions (AGENTS.md)
- Test data must include new required fields (fathersName, identityNumber)
- Test data must use valid Greek phone formats
- Test expectations must match new component structure

## Acceptance Criteria

- [ ] Store tests updated to expect `leaveAllowance: false` in initial state
- [ ] Store tests updated to expect signature data to be persisted
- [ ] Persistence tests updated with valid profile data including new fields:
  - Add `fathersName: 'George Doe'` to test profiles
  - Add `identityNumber: 'ΑΒΓ12345'` to test profiles
  - Update phone numbers to valid Greek format (e.g., `6901234567`)
- [ ] PersonalDetailsSection tests updated to expect 5 fields:
  - Full Name, Father's Name, Email, Phone, Identity Number
  - Correct order of fields
- [ ] Integration tests updated with valid profile data
- [ ] All updated tests pass
- [ ] No regressions in previously passing tests

## Notes

No notes.
