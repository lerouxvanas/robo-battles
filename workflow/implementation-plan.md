# Workflow Implementation Plan

Purpose: Track workflow-system improvements over time in one place so work can pause/resume without losing context.

## How to use

- Keep this file as the single backlog for workflow enhancements.
- Add or update items before making workflow-level changes.
- Mark status as `todo`, `in_progress`, `done`, or `deferred`.
- Link any relevant files in the `Files` field.

## Current status

- Last updated: 2026-03-23
- Focus area: reliability gates, review quality, simplicity bias, and agent behavior consistency

## Backlog

### WIP-001 Verified vs Hypothesis review tags
- Status: todo
- Goal: Reduce overconfident or unverified review statements.
- Scope:
  - Add explicit `Verified` and `Hypothesis` tags to review output formats.
  - Require evidence snippets or command output references for `Verified` claims.
  - Keep uncertain findings as `Hypothesis` with validation steps.
- Files:
  - `workflow/agents/code_review.agent.md`
  - `workflow/agents/branch_review.agent.md`
  - `.claude/skills/xl_code_review/SKILL.md`
  - `.claude/skills/xl_branch_review/SKILL.md`
- Acceptance criteria:
  - Review templates include both tags.
  - Rules require evidence for `Verified` claims.
  - Existing severity model still works unchanged.

### WIP-002 Bugfix exhaustive sweep mode
- Status: todo
- Goal: Ensure bug fixes address all occurrences, not only first match.
- Scope:
  - Add an optional bugfix mode checklist to plan/implement skills.
  - Require pre-edit pattern search and file list capture.
  - Require post-edit confirmation that all occurrences were handled.
- Files:
  - `.claude/skills/xl_review_plan/SKILL.md`
  - `.claude/skills/xl_implement_plan/SKILL.md`
  - `workflow/agents/reviewer.agent.md`
  - `workflow/agents/implement_plan.agent.md`
- Acceptance criteria:
  - Bugfix plans include "all occurrences" strategy.
  - Status updates record searched patterns and affected files.

### WIP-003 Workflow gate validator command (optional)
- Status: deferred
- Goal: Make gate checks easier to run consistently.
- Scope:
  - Define a lightweight command/skill that validates required artifacts and gate readiness.
  - Report missing files, missing sections, and blocked next actions.
- Files:
  - `workflow/workflow.yaml`
  - `workflow/agents/` (new validator contract)
  - `.claude/skills/` (new validator skill)
- Acceptance criteria:
  - Single command outputs pass/fail by gate with actionable next command.

### WIP-004 Finalize knowledge capture tuning
- Status: todo
- Goal: Capture high-value lessons without bloating global docs.
- Scope:
  - Add a small checklist for "significant" vs "not significant" updates.
  - Add optional anti-pattern note section for major incidents.
- Files:
  - `workflow/agents/finalize_feature.agent.md`
  - `.claude/skills/xl_finalize_feature/SKILL.md`
  - `workflow/artifacts/decisions.md`
- Acceptance criteria:
  - Finalize output clearly states why global docs were or were not updated.
  - Anti-pattern notes are concise and only used when impact is material.

### WIP-005 Prefer simple, pattern-aligned solutions
- Status: done
- Goal: Reduce over-engineering by biasing the workflow toward minimal changes that reuse existing patterns.
- Scope:
  - Add the principle to workflow standards and ADRs.
  - Require planning to identify an existing pattern or justify why none fits.
  - Require review to flag unjustified abstractions as maintainability risks.
  - Keep implementation guidance advisory rather than a new hard gate.
- Files:
  - `workflow/workflow.yaml`
  - `workflow/artifacts/coding-standards.md`
  - `workflow/artifacts/decisions.md`
  - `workflow/agents/planner.agent.md`
  - `workflow/agents/reviewer.agent.md`
  - `workflow/agents/implement_plan.agent.md`
  - `workflow/agents/code_review.agent.md`
  - `.claude/skills/xl_plan_implementation/SKILL.md`
  - `.claude/skills/xl_review_plan/SKILL.md`
  - `.claude/skills/xl_implement_plan/SKILL.md`
  - `.claude/skills/xl_code_review/SKILL.md`
  - `workflow/User-guide.md`
- Acceptance criteria:
  - The workflow explicitly prefers the smallest viable, pattern-aligned solution.
  - New abstractions require concrete current justification in plan/review artifacts.
  - No new workflow phase or blocking gate is introduced solely for complexity control.

## Notes

- Canonical precedence remains:
  1. `workflow/workflow.yaml`
  2. `workflow/agents/*.agent.md`
  3. `.claude/skills/*/SKILL.md`
  4. `.github/agents/*.agent.md`
- Keep wrappers thin; put behavior changes in canonical files first.
