# 059-feature-context-mapping

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Implement "Context Layering" to reduce token usage. Move static rules (Stack, Naming, Imports) from individual agent files to `AGENTS.md` and create feature-specific `CONTEXT.md` files.

## Constraints

- De-clutter `frontend-dev.md`, `tester.md`, and `reviewer.md`.
- Follow a standard `CONTEXT.md` structure.

## Acceptance Criteria

- [ ] `src/features/leave-request/CONTEXT.md` created with feature-specific rules.
- [ ] `src/shared/CONTEXT.md` created for UI primitives.
- [ ] Subagent files (`.opencode/agent/*.md`) stripped of redundant static rules.
- [ ] `AGENTS.md` updated to instruct agents to look for local `CONTEXT.md` files.

## Notes

No notes.
