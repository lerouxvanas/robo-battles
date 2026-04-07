---
name: xl_review_plan
description: Review a ticket’s implementation plan before coding. Flags risks, missing steps, and misalignment with standards. Writes plan-review.md and updates status.md.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Plan Review skill.

## Artifact boundary — HARD STOP
Allowed writes: `workflow/artifacts/features/$1/` only.
Source code may be READ for context. It must NEVER be edited, created, or deleted.
Review findings go into `plan-review.md`. Do NOT apply fixes to source code.
The implementation gate is `/xl_implement_plan`.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket artifacts root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/* (if relevant)

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Process:

1) Validate ticket folder exists:
- workflow/artifacts/features/$1/
- If missing, instruct to run: /xl_init_feature $1 "<title>"

2) Read these files (must exist for a meaningful review):
- workflow/artifacts/features/$1/requirements.md
- workflow/artifacts/features/$1/implementation-plan.md
Also read if present:
- workflow/artifacts/features/$1/architecture.md
- workflow/artifacts/features/$1/decisions.md
- workflow/artifacts/features/$1/status.md
And global docs if present:
- workflow/artifacts/coding-standards.md
- workflow/artifacts/app-architecture.md
- workflow/artifacts/patterns/README.md (and any obviously relevant pattern docs)

3) If implementation-plan.md is missing or clearly incomplete:
- Do not proceed. Write a short note explaining what is missing and what to add.

4) Produce `workflow/artifacts/features/$1/plan-review.md` with this structure:

# Plan review — Ticket $1

## Summary
- Verdict: ✅ Ready to implement | ⚠️ Needs changes
- Top 3 concerns (if any)

## Requirements coverage
- Does the plan map to each acceptance criterion?
- Missing or ambiguous requirements:
  - ...

## Scope lock check (mandatory)
- `requirements.md` contains `## Scope Lock` with:
  - In scope
  - Out of scope
  - Allowed edit paths
  - Boundary notes (for example: frontend-only)
- Verdict impact:
  - If missing/incomplete, verdict must be ⚠️ Needs changes

## Plan completeness checklist (mandatory)
- Affected files/components list is explicit and reviewable
- Existing pattern to follow is identified, or the plan explicitly states why no suitable pattern exists
- New helpers/services/abstractions are justified by a concrete current need
- API/schema/type impact is explicit (when relevant):
  - request/response contract compatibility for the affected endpoint or schema
  - required-field impacts on stubs/mocks/tests
- Bugfix plans include "all occurrences" search strategy before edits
- Verdict impact:
  - If any required item is missing, verdict must be ⚠️ Needs changes

## Technical approach sanity check
- Correctness risks:
- Complexity risks:
- Maintainability risks:
- Performance risks:
- Security/permissions risks:

## Architecture / standards alignment
- Conflicts with app-architecture.md or coding-standards.md:
- Missing use of preferred patterns:
- Inconsistencies with existing folder/component structure:

## Testing & rollout
- Test gaps (unit/integration/e2e):
- Test data / fixtures gaps:
- Rollout/feature flag/migration gaps:

## Execution readiness
- Unclear tasks:
- Missing dependencies / ordering issues:
- Unknowns that should be spiked first:

## Recommended changes (actionable)
Provide a numbered list of specific edits to make to implementation-plan.md.
Each item must be phrased as:
- Change: <what to change>
- Why: <reason>
- Where: <section in the plan to edit>

## Optional: Questions for the human reviewer
Up to 6 questions, only if they are blocking.

5) Update `workflow/artifacts/features/$1/status.md`:
- Last updated: today
- What I did last: “Reviewed implementation plan”
- Next action:
  - If verdict is ⚠️ Needs changes: “Revise implementation-plan.md per plan-review.md”
  - Else: “Begin implementation”

Rules:
- Do not modify source code.
- Prefer concrete, checkable feedback over opinions.
- Don’t invent requirements. If missing, flag as unknown.
- If something is risky, propose a safer alternative.
- Treat unjustified abstraction as a review issue and suggest the simpler pattern-aligned alternative when one exists.