# 058-ai-handover-protocol

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Implement a handover protocol for cross-session context. This ensures that if one agent stops, the next one knows exactly where to pick up.

## Constraints

- Update `state.schema.json` to include a `notes` field.
- Create a standardized handover template.

## Acceptance Criteria

- [x] `state.schema.json` updated with an optional `notes` field.
- [x] `docs/templates/HANDOVER-TEMPLATE.md` created.
- [x] `AGENTS.md` updated to require a handover note for unfinished tasks.

## Notes

No notes.
