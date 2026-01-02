# AGENTS.md

## Project Overview

This project is a **Leave Request Application** built with **React**, **TypeScript**, and **Zustand** for state management. It allows employees to submit leave requests, manage their profile information, and generate PDF documents of their requests. The application uses **React Hook Form** for form handling and validation with **Zod** schemas. PDF generation is handled using `@react-pdf/renderer`.

The application is a PWA (Progressive Web App) that works offline and persists user data in local storage. It many features including:

- Employee profile management
- Leave request form with date range selection and absence days calculation
- PDF generation of leave requests with digital signatures
- State persistence with selective data storage
- Import/Export and Clear of permanent data
- Greek and English localization

## Context Layering

To reduce token usage and maintain focus, this project uses **Context Layering**:

1.  **Global Context (`AGENTS.md`)**: Contains project-wide rules, stack information, and global standards.
2.  **Feature Context (`src/features/<feature>/CONTEXT.md`)**: Contains rules specific to a feature (domain logic, state slices, specific UI patterns).
3.  **Shared Context (`src/shared/CONTEXT.md`)**: Contains rules for reusable primitives and libraries.

**Agent Instruction**: Before starting work in a specific directory, check if a `CONTEXT.md` file exists in that directory or its parent. If it does, its rules take precedence over global rules for that specific scope.

## GitHub Copilot Integration

This repository is optimized for GitHub Copilot.

- **Custom Instructions**: See [.github/copilot-instructions.md](.github/copilot-instructions.md) for project-specific guidance.
- **VS Code Recommendations**: See [.vscode/extensions.json](.vscode/extensions.json) for recommended extensions.
- **Workspace Settings**: See [.vscode/settings.json](.vscode/settings.json) for optimized editor settings.

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

**State Management:** Zustand with persist middleware. Persist only stable data (profile data and signature data), not the leaveDraft data. Use `partialize` for selective persistence. Separate state concerns into logical slices (profile, leaveDraft, signature, ui, holidays). Export inferred types from store for external use. Use refs to prevent infinite loops when syncing form changes to store.

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

## Available MCP Servers

I have access to **7 Model Context Protocol (MCP) servers** that provide specialized capabilities:

### 1. zai-mcp-server

AI-powered image and video analysis:

- `ui_to_artifact` - Convert UI screenshots to code, prompts, design specs, or natural language descriptions
- `extract_text_from_screenshot` - OCR for extracting text from screenshots (code, terminal, docs)
- `diagnose_error_screenshot` - Analyze error messages, stack traces, and exception screenshots
- `understand_technical_diagram` - Explain architecture diagrams, flowcharts, UML, ER diagrams
- `analyze_data_visualization` - Extract insights from charts, graphs, dashboards, and data visualizations
- `ui_diff_check` - Compare expected vs actual UI screenshots for QA
- `analyze_image` - General-purpose image analysis (fallback when specialized tools don't fit)
- `analyze_video` - Analyze video content, extract key moments, identify actions/objects

**Use cases:** Debugging from screenshots, generating code from UI designs, analyzing error screenshots, understanding documentation diagrams, data viz insights, UI regression testing

### 2. web-search-prime

Web search with filtering capabilities:

- `webSearchPrime` - Search web with optional filters for:
  - Search domain (limit to specific websites)
  - Time range (oneDay, oneWeek, oneMonth, oneYear, noLimit)
  - Content size (medium=400-600 words, high=2500 words)
  - Location (cn=Chinese, us=non-Chinese)

**Use cases:** Finding documentation, researching solutions, checking latest information

### 3. web-reader

Content fetching and conversion:

- `webReader` - Fetch URLs and convert to markdown/text with:
  - Retain or strip images
  - Include or exclude links summary
  - Preserve GitHub Flavored Markdown
  - Keep image data URLs if needed

**Use cases:** Reading documentation, fetching web content, analyzing external resources

### 4. zread

GitHub repository exploration:

- `search_doc` - Search docs, issues, commits in GitHub repos (supports Greek/English)
- `read_file` - Read full code content from specific files in GitHub repos
- `get_repo_structure` - Get directory structure and file listings from GitHub repos

**Use cases:** Exploring open-source codebases, researching implementations, finding patterns

### 5. context7

Documentation and code examples for programming libraries and frameworks:

- `resolve-library-id` - Resolves package/product names to Context7-compatible library IDs. Returns matching libraries ranked by relevance, name similarity, description, documentation coverage, and benchmark score
- `query-docs` - Retrieves up-to-date documentation and code examples from Context7 for any programming library. Requires a valid Context7 library ID (in format `/org/project` or `/org/project/version`)

**Usage pattern:** Always call `resolve-library-id` first to obtain the exact Context7 library ID before calling `query-docs`, unless the user explicitly provides a library ID in the correct format. Do not call more than 3 times per question.

**Use cases:** Finding documentation for React, TypeScript, Zustand, or any other library/framework; getting code examples; learning API usage patterns

### 6. chrome-devtools

Browser interaction and debugging via Chrome DevTools:

- Page management: list, new, navigate, select, close tabs
- Interaction: click, hover, drag, type, fill forms, press keys, upload files
- Data capture: take snapshots, take screenshots, list console messages, list network requests
- Scripting: evaluate JavaScript
- Testing: handle dialogs, emulate (geolocation, network, CPU throttling), resize window
- Performance: start/stop trace recording, analyze performance insights

**Use cases:** Manual testing, debugging web apps, capturing screenshots, network debugging

### 7. playwright

Cross-browser automation and testing:

- Navigation: navigate, go back
- Page management: list, new, close, select browser tabs
- Interaction: click, hover, drag, type, fill forms, select options, press keys, upload files
- Data capture: take snapshots, take screenshots, get console messages, get network requests
- Scripting: evaluate JavaScript, run Playwright code snippets
- Advanced: handle dialogs, wait for elements/text/time, resize browser window

**Use cases:** Automated testing, cross-browser testing, end-to-end testing, UI automation

**Tool selection:** Playwright is test-focused with cross-browser support; Chrome DevTools provides deeper debugging and performance analysis. Choose based on task requirements.

## Tool Selection Heuristics

To ensure efficient and autonomous operation, use the following heuristics to select the appropriate tool for a given task.

### 1. UI Interaction & Debugging (Chrome DevTools / Playwright)

**Triggers:**

- **Visual Verification:** When a task involves UI changes, layout fixes, or styling updates. **Requirement:** Run `npm run capture-baselines` before and after changes, and use `ui_diff_check` to verify the visual impact.
- **Runtime Debugging:** When investigating console errors, network request failures, or state synchronization issues in the browser.
- **Form Automation:** When testing complex form flows, validation triggers, or multi-step interactions.
- **Performance Analysis:** When a task specifically mentions performance bottlenecks or slow UI responsiveness.

**Selection:**

- Use **Chrome DevTools** for deep debugging, performance tracing, and real-time DOM/CSS inspection.
- Use **Playwright** for automated end-to-end flows, cross-browser verification, and repeatable UI tests.
- Use **ZAI (`ui_diff_check`)** to compare screenshots captured via `npm run capture-baselines` to ensure no unintended visual regressions.

### 2. Library & Framework Research (Context7)

**Triggers:**

- **API Reference:** When using a library for the first time or needing specific method signatures (e.g., `zod`, `zustand`, `react-hook-form`).
- **Best Practices:** When implementing a new pattern and needing authoritative examples from official documentation.
- **Version Migration:** When upgrading libraries (e.g., `react-day-picker` v8 to v9) to understand breaking changes.

**Heuristic:**

- Always call `resolve-library-id` first to get the correct ID before querying documentation.

### 3. Visual Analysis & OCR (ZAI)

**Triggers:**

- **UI-to-Code:** When given a screenshot of a design or an existing UI and asked to replicate it or extract its structure.
- **Error Diagnosis:** When provided with a screenshot of an error message or a broken UI state that is hard to describe in text.
- **Technical Diagrams:** When needing to understand architecture diagrams, flowcharts, or ERDs provided as images.

### 4. Repository Exploration (Zread)

**Triggers:**

- **External Patterns:** When looking for implementation patterns in other open-source repositories.
- **Documentation Search:** When searching for specific issues or commits in external GitHub repos.

## Handover Protocol

To ensure continuity across sessions, agents must provide a handover note for any task that is not yet `committed`.

1. **Update Task State:** Use `npm run task -- <id> <state>` to update the task status.
2. **Write Handover Note:** If a task is in-progress or blocked, add a summary of the current state to the `notes` field in `docs/tasks/state.json`.
3. **Template:** For complex handovers, refer to the structure in `docs/templates/HANDOVER-TEMPLATE.md`.

