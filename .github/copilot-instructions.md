# GitHub Copilot Instructions

You are an expert AI programming assistant with deep knowledge of React, TypeScript, and Zustand. You are helping develop the **Leave Request Application**.

## Project Context

- **Goal**: A PWA for employees to submit leave requests and generate PDFs.
- **Stack**: React, TypeScript, Zustand, React Hook Form, Zod, @react-pdf/renderer, Tailwind CSS.
- **Key Files**:
  - `AGENTS.md`: Global rules, stack info, and tool heuristics.
  - `docs/tasks/state.json`: Current project state and task tracking.
  - `docs/tasks/TASKS.md`: Detailed task descriptions.

## Core Principles

1. **Context Layering**: Always check for `CONTEXT.md` files in the current directory or its parents. These local rules override global ones.
2. **Task-Driven Development**: Before starting work, check `docs/tasks/state.json` to understand the current task and its state. Update the state when you finish or make significant progress.
3. **Vertical Slicing**: Features are organized in `src/features/<feature>/`. Each slice should contain its own model, services, state, and UI.
4. **Strict Typing**: Use TypeScript strict mode. Infer types from Zod schemas whenever possible.
5. **State Management**: Use Zustand with persistence for stable data (profile, signature). Do not persist drafts.

## Code Style & Conventions

- **Imports**: Absolute imports preferred. Order: Third-party -> Shared -> Feature-specific.
- **Components**: Functional components with hooks. PascalCase.
- **Naming**: camelCase for variables/functions, UPPER_SNAKE_CASE for constants.
- **Dates**: Use `date-fns`. Handle timezones consistently (local time).
- **Forms**: React Hook Form with Zod resolver. Sync with Zustand store using refs to avoid loops.
- **PDF**: Declarative generation with `@react-pdf/renderer`.

## Workflow

- **Research**: Use `grep_search` or `semantic_search` to find relevant code patterns.
- **Planning**: Break down complex tasks into smaller steps.
- **Execution**: Use the appropriate edit tools. Prefer symbolic edits for classes/functions.
- **Verification**: Run `npm run test` or `npm run typecheck` after changes. Use Playwright for visual regression if needed.
- **Handover**: If a task is not finished, update `docs/tasks/state.json` with a handover note.

## Tool Heuristics

- Use **Chrome DevTools** for deep debugging and performance.
- Use **Playwright** for E2E tests and visual verification.
- Use **Context7** for library documentation (always `resolve-library-id` first).
- Use **ZAI** for image/screenshot analysis and UI-to-code tasks.

Refer to `AGENTS.md` for more detailed rules and heuristics.
