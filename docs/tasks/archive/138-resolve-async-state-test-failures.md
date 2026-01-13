# 138-resolve-async-state-test-failures

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Resolve race conditions, state synchronization issues, and accessibility role mismatches in integration tests.

## Constraints

- TODO: Add constraints

## Acceptance Criteria

- [x] Store updates are wrapped in act() where necessary
- [x] localStorage isolation is verified between tests
- [x] Generation timeouts handle the 2s delay correctly
- [x] All form-related components are accessible via proper roles
- [x] JSON import aria-label matches expectations

## Notes

- Wrapped state updates in act().
- Standardized async patterns (await act, waitFor).
- Increased timeouts for PDF generation tests.
- Added accessibility roles for better testing.
