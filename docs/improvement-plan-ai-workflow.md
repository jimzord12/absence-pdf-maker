# AI Workflow Improvement Plan

**Date:** 2026-01-02
**Status:** Proposed
**Priority:** High

## Overview

This plan aims to evolve the current AI-agent collaboration framework into a more autonomous, reliable, and context-aware system. By standardizing tool usage, automating state management, and improving cross-session handovers, we can ensure that agents operate with higher efficiency and lower error rates.

## Tasks Breakdown

### 056-ai-tool-heuristics-matrix

**Description:** Update `AGENTS.md` with a "Tool Selection & Heuristics" section.
**Constraints:** Must define specific triggers for Playwright, Chrome DevTools, Context7, and ZAI MCP servers.
**Acceptance Criteria:**

- [ ] New section "Tool Selection Heuristics" added to `AGENTS.md`.
- [ ] Triggers defined for UI changes (DevTools/Playwright).
- [ ] Triggers defined for library research (Context7).
- [ ] Triggers defined for visual analysis (ZAI).

### 057-task-state-automation-cli

**Description:** Create a Node.js script to automate `state.json` updates.
**Constraints:** Use TypeScript, handle ISO timestamps, and validate state transitions.
**Acceptance Criteria:**

- [ ] Script created at `scripts/task-cli.ts`.
- [ ] Command `npm run task -- <id> <state>` works.
- [ ] Updates `lastUpdated` automatically.
- [ ] Prevents invalid state transitions (e.g., `not_started` to `completed`).

### 058-ai-handover-protocol

**Description:** Implement a handover protocol for cross-session context.
**Constraints:** Update `state.schema.json` and create a template.
**Acceptance Criteria:**

- [ ] `state.schema.json` updated with an optional `notes` field.
- [ ] `docs/templates/HANDOVER-TEMPLATE.md` created.
- [ ] `AGENTS.md` updated to require a handover note for unfinished tasks.

### 059-feature-context-mapping

**Description:** Implement "Context Layering" to reduce token usage and provide localized rules.
**Constraints:** De-clutter subagent files by moving static rules to `AGENTS.md` or local `CONTEXT.md` files.
**Acceptance Criteria:**

- [ ] `src/features/leave-request/CONTEXT.md` created with feature-specific rules.
- [ ] `src/shared/CONTEXT.md` created for UI primitives.
- [ ] Subagent files (`.opencode/agent/*.md`) stripped of redundant static rules.
- [ ] `AGENTS.md` updated to instruct agents to look for local `CONTEXT.md` files.

### 060-ai-review-workflow

**Description:** Integrate the dedicated `reviewer` agent and implement mandatory self-reflection steps.
**Constraints:** Update `docs/tasks/README.md` and subagent definitions.
**Acceptance Criteria:**

- [ ] `frontend-dev.md` and `tester.md` updated with a "Self-Reflection Checklist".
- [ ] `orchestrator.md` updated to automatically deploy the `reviewer` agent after `unit_tested`.
- [ ] `README.md` updated to reflect that `review_pass/fail` is determined by the `reviewer` agent.
- [ ] Reviewer output is summarized in the task's `notes` field.

### 061-issue-to-task-prompt

**Description:** Create a prompt template for converting Issue Reports to Tasks.
**Constraints:** Must output valid Markdown for `TASKS.md`.
**Acceptance Criteria:**

- [ ] `docs/prompts/003-issue-to-task.txt` created.
- [ ] Prompt handles parsing "Technical Details" and "Requirements" from issue reports.
- [ ] Output format matches the existing `TASKS.md` structure.

### 062-visual-regression-baseline

**Description:** Setup a script for AI-driven visual verification.
**Constraints:** Use Playwright to capture screenshots of key components.
**Acceptance Criteria:**

- [ ] `scripts/capture-baselines.ts` created.
- [ ] Captures screenshots of Personal Details, Employment Details, and Leave Details.
- [ ] `AGENTS.md` updated to require a `ui_diff_check` after UI modifications.
