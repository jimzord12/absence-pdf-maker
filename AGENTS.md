# AGENTS.md

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run test` - Run all tests
- `npm run test -- <file>` - Run single test file (e.g., `npm run test -- absenceDays.test.ts`)
- `npm run lint` - Run linter
- `npm run typecheck` - Run TypeScript type checking

## Code Style

**Architecture:** Vertical slice/feature-first. Each feature owns its UI, model, state, services. Shared primitives (Button, Input, Modal, etc.) in `src/shared/`.

**Imports:** Absolute imports preferred. Order: React/third-party → internal shared → feature modules.

**Formatting:** Consistent spacing, no trailing whitespace.

**Types:** TypeScript strict mode enabled. Use Zod schemas for validation; infer types from schemas where possible.

**Naming:** PascalCase for components, camelCase for variables/functions. Service files: `*.service.ts`, schemas: `*.schema.ts`, types: `*.types.ts`.

**State:** Zustand with persist middleware. Persist only stable data (profile), not drafts/signature. Use `partialize` for selective persistence.

**Forms:** React Hook Form with Zod resolver. Sync initial values from Zustand store.

**Dates:** Handle timezones consistently (use UTC or local and document choice). Return immutable Date objects.

**Error Handling:** Graceful errors with user-friendly messages. Validate JSON imports against schemas.

**PDF:** Template-based generation using jsPDF. Templates defined in `src/features/leave-request/services/pdf/templates/`.

**Tests:** Unit tests for schemas, services, calculations. Integration/E2E for user flows. Test with valid/invalid data.
