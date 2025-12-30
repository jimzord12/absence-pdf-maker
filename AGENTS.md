# AGENTS.md

## Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (outputs to `dist/`, runs `tsc -b && vite build`)
- `npm run test` - Run all tests (Vitest)
- `npm run test -- <file>` - Run single test file (e.g., `npm run test -- absenceDays.test.ts`)
- `npm run test -- --reporter=verbose` - Run tests with verbose output
- `npm run lint` - Run ESLint linter
- `npm run typecheck` - Run TypeScript type checking (`tsc --noEmit`)

## Code Style

**Architecture:** Vertical slice/feature-first. Each feature (`src/features/<feature>/`) owns its UI, model, state, services. Shared primitives (Button, Input, Modal, etc.) in `src/shared/`. Feature structure:
- `model/` - Zod schemas and TypeScript types
- `services/` - Business logic, external integrations, utilities
- `state/` - Zustand stores
- `ui/` - React components

**Imports:** Absolute imports preferred. Order: React/third-party imports → internal shared imports → feature-specific imports. Group related imports together with blank lines between groups. Example:
```tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

import { LeaveRequestSchema } from '../model/leaveRequest.schema';
import { useLeaveRequestStore } from '../state/leaveRequest.store';
```

**Formatting:** Consistent spacing, no trailing whitespace. Use 2-space indentation.

**Types:** TypeScript strict mode enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). Use Zod schemas for validation; infer types from schemas where possible (`z.infer<typeof Schema>`). Define explicit types in `*.types.ts` files when schemas are insufficient or for clarity.

**Naming Conventions:**
- Components: PascalCase (e.g., `LeaveRequestForm`, `PersonalDetailsSection`)
- Variables/Functions: camelCase (e.g., `calculateAbsenceDays`, `setProfile`)
- Constants: UPPER_SNAKE_CASE (e.g., `SIGNATURE_WIDTH`, `DATE_LOCALE`)
- File naming:
  - Components: `*.tsx`
  - Schemas: `*.schema.ts`
  - Types: `*.types.ts`
  - Services: `*.service.ts`
  - Tests: `*.test.ts` or `*.test.tsx` (colocated with source)

**State Management:** Zustand with persist middleware. Persist only stable data (profile), not drafts or signatures. Use `partialize` for selective persistence. Separate state concerns into logical slices (profile, leaveDraft, signature, ui, holidays). Export inferred types from store for external use. Use refs to prevent infinite loops when syncing form changes to store.

**Forms:** React Hook Form with Zod resolver (`@hookform/resolvers/zod`). Sync initial values from Zustand store. Use `setValueAs` for date field transformations to Date objects. Use `watch()` to track changes and sync to store, with deep equality checks to prevent unnecessary updates.

**Dates:** Handle timezones consistently (local time by default, documented in code). Return immutable Date objects. Use date-fns for date manipulations. Validate date ranges in Zod schemas (e.g., `startDate <= endDate`). Use `toLocaleDateString` with explicit locale for user-facing dates.

**Error Handling:** Graceful errors with user-friendly messages. Validate JSON/data imports against schemas before use. Use try-catch blocks with specific error handling. Log errors with context in development mode (`import.meta.env.DEV`). Display error messages via Alert components or user-friendly notifications. Throw descriptive errors from services for callers to handle.

**React Conventions:**
- Use functional components with hooks
- Define constants outside components (e.g., arrays, objects)
- Use refs to track previous values and prevent unnecessary effects
- Clean up side effects in useEffect cleanup functions
- Use proper dependency arrays in useEffect
- Destructure props explicitly at component top
- Use semantic HTML and ARIA attributes (e.g., `role="form"`)

**PDF Generation:** Declarative generation using `@react-pdf/renderer`. PDF layout defined as React components (e.g., `src/features/leave-request/services/pdf/LeaveRequestPdf.tsx`). Register fonts (e.g., Roboto) for Greek character support. Handle signature images and dynamic data via props. Generate filenames with sanitized employee ID and ISO date.

**Testing:**
- Unit tests for schemas, services, calculations (colocated with source)
- Integration tests for component interactions and user flows
- Use Vitest with jsdom environment
- Test with valid data, invalid data, and edge cases
- Mock external dependencies (localStorage, window.URL, etc.)
- Use `@testing-library/react` for component testing
- Use `describe`, `it`/`test` conventions
- Test files should be `*.test.ts` or `*.test.tsx`
- Setup file: `src/vitest.setup.ts` (configures @testing-library/jest-dom)
- Test rules relaxed in test files (`@typescript-eslint/no-explicit-any: off`)

**Linting & Type Checking:** Always run `npm run lint` and `npm run typecheck` before committing. ESLint config includes TypeScript strict mode, React Hooks rules, and React Refresh optimization. Fix all linting errors before submission.
