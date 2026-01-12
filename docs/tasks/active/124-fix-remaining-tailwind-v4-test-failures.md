# task-124-fix-remaining-tailwind-v4-test-failures

**Priority:** medium
**Blocks:** task-127-end-to-end-testing
**Blocked By:** task-123-update-component-tests-for-translations
**Issue:** # TBD

---

## Description

Fix remaining 22 test failures related to Tailwind CSS v4 migration. Tests expect hardcoded Tailwind classes (e.g., `text-gray-700`, `border-red-500`) but components now use CSS variables (e.g., `text-[color:var(--color-text-primary)]`, `border-[color:var(--color-error)]`).

## Constraints

- Update test expectations to match actual component CSS variable usage
- Do NOT change component implementation (CSS variables are correct)
- Preserve test logic, only update class name assertions

## Acceptance Criteria

- [ ] All Modal tests pass (3 failures related to aria-label duplicates, close button rendering)
- [ ] All Select tests pass (2 failures: error styling expects `border-red-500`, default styling expects `border-gray-300`)
- [ ] All Textarea tests pass (2 failures: error styling expects `border-red-500`, default styling expects `border-gray-300`)
- [ ] All EmploymentDetailsSection tests pass (1 failure: Card styling expects `border-gray-200`)
- [ ] All PersonalDetailsSection tests pass (1 failure: Card styling expects `bg-white`)
- [ ] All globals.test.ts tests pass (4 failures: utility class expectations)
- [ ] Test pass rate reaches 100% (1191/1191 tests passing)

## Notes

### Analysis of Remaining Failures (22 total):

1. **Modal component tests (3 failures):**
   - Tests find multiple elements with same `aria-label` text ("Close modal" appears in both backdrop and button)
   - Close button rendering tests failing due to selector ambiguity

2. **Select/Textarea error styling tests (4 failures):**
   - Expect `border-red-500` / `border-gray-300`
   - Components use: `border-[color:var(--color-error)]` / `border-[color:var(--color-border)]`

3. **EmploymentDetailsSection/PersonalDetailsSection Card tests (2 failures):**
   - Expect `bg-white` class selector
   - Components use: `bg-[color:var(--color-surface)]`

4. **globals.test.ts utility tests (4 failures):**
   - Tests expect specific utility class implementations
   - Need to verify `.sr-only`, `.focus-visible-custom`, `.animate-stagger-*` utilities

5. **Other failures** (9 failures in various files):
   - Similar pattern: hardcoded class names vs CSS variables

### Recommended Approach:

For each test file with failures:
1. Read the component source to identify actual CSS class names
2. Update test assertions to use CSS variable syntax: `color:var(--variable-name)`
3. For aria-label conflicts in Modal, use more specific selectors (e.g., `button[aria-label="Close modal"]`)
4. For class selectors (e.g., `.bg-white`), update to escaped CSS variable syntax: `.bg-\\[color\\:var\\(--color-surface\\)]`

### Component CSS Variable Reference:

- Primary: `var(--color-primary)`, `--color-primary-hover`, `--color-primary-light`
- Secondary: `var(--color-secondary)`, `--color-secondary-hover`
- Error: `var(--color-error)`, `var(--color-error-bg)`, `--color-error-hover`
- Success: `var(--color-success)`, `var(--color-success-bg)`, `--color-success-hover`
- Warning: `var(--color-warning)`, `var(--color-warning-bg)`, `--color-warning-hover`
- Info: `var(--color-info)`, `var(--color-info-bg)`, `--color-info-hover)`
- Surface: `var(--color-surface)`, `--color-surface-hover)`
- Border: `var(--color-border)`
- Text: `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`
