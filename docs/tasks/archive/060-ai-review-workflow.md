# 060-ai-review-workflow

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Integrate the dedicated `reviewer` agent into the core workflow and implement mandatory self-reflection steps for all developer subagents.

## Constraints

- Update `docs/tasks/README.md` and subagent definitions.

## Acceptance Criteria

- [x] `frontend-dev.md` and `tester.md` updated with a "Self-Reflection Checklist".
- [x] `orchestrator.md` updated to automatically deploy the `reviewer` agent after `unit_tested`.
- [x] `README.md` updated to reflect that `review_pass/fail` is determined by the `reviewer` agent.
- [x] Reviewer output is summarized in the task's `notes` field.

## Notes

No notes.
