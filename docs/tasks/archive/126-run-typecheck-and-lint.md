# task-126-run-typecheck-and-lint

**Priority:** high
**Blocks:** task-127-end-to-end-testing
**Blocked By:** task-101-install-i18next-dependencies, task-102-create-i18n-config, task-103-create-i18n-type-declarations, task-104-create-translation-files, task-105-initialize-i18next-in-main, task-106-update-locale-store-with-i18next, task-107-create-pdf-language-store, task-108-create-pdf-language-selector, task-109-create-validation-schema-factories, task-110-migrate-personal-details-section, task-111-migrate-employment-details-section, task-112-migrate-leave-details-section, task-113-migrate-date-range-field, task-114-migrate-signature-modal, task-115-migrate-leave-request-form, task-116-migrate-review-and-generate, task-117-migrate-leave-request-page, task-118-update-persistence-service-messages, task-119-update-pdf-service-messages, task-120-update-shared-ui-components, task-121-refactor-pdf-component-for-bilingual, task-122-integrate-pdf-language-in-generation, task-123-update-component-tests-for-translations, task-124-test-language-switching-persistence, task-125-test-pdf-bilingual-generation
**Issue:** N/A

---

## Description

Run TypeScript type checking and ESLint to identify and fix any errors introduced by i18n implementation.

## Constraints

- Run npm run typecheck
- Run npm run lint
- Fix all type errors
- Fix all linting errors
- Do not suppress errors with @ts-ignore or similar

## Acceptance Criteria

- [x] npm run typecheck passes with no errors
- [x] npm run lint passes with no errors
- [x] No type errors in codebase
- [x] No linting errors in codebase

## Notes

**Completed 2026-01-13:**
- `npm run typecheck` passes with 0 errors
- `npm run lint` passes with 0 errors (1 expected warning about React Compiler + React Hook Form `watch()` incompatibility, documented in code)
- Pre-existing test failures from Tailwind v4 migration are unrelated to this task (they concern CSS class assertions, not typecheck/lint)
