# 137-refactor-test-selectors-tailwind-v4

**Priority:** high
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Refactor UI test selectors to be robust against Tailwind v4 semantic variable classes and JSDOM selector limitations.

## Constraints

- TODO: Add constraints

## Acceptance Criteria

- [x] querySelector calls do not use exact class strings with complex characters
- [x] Styling assertions use semantic variables or structural selectors
- [x] Hardcoded Tailwind v3 colors are replaced with v4 variable checks
- [x] Tests pass regardless of exact class order

## Notes

- Replaced brittle class-based selectors with role-based and semantic queries.
- Updated styling assertions to target Tailwind v4 variables.
- Verified across all feature sections.
