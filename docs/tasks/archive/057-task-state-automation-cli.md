# 057-task-state-automation-cli

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Create a Node.js script to automate `state.json` updates. This prevents manual editing errors and ensures consistent timestamps and valid state transitions.

## Constraints

- Use TypeScript.
- Handle ISO timestamps.
- Validate state transitions (e.g., cannot skip `unit_tested`).

## Acceptance Criteria

- [x] Script created at `scripts/task-cli.ts`.
- [x] Command `npm run task -- <id> <state>` works.
- [x] Updates `lastUpdated` automatically.
- [x] Prevents invalid state transitions.

## Notes

No notes.
