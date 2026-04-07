---
name: xl_plan_implementation
description: Turn requirements into an actionable implementation plan for a ticket under workflow/artifacts/features/<ticket>/. Writes implementation-plan.md and updates status.md.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Plan Implementation skill.

## Artifact boundary — HARD STOP
Allowed writes: `workflow/artifacts/features/$1/` only.
Source code may be READ for context. It must NEVER be edited, created, or deleted.
If you discover a fix or solution while researching: record it in `implementation-plan.md`, then STOP.
Do NOT implement it. The implementation gate is `/xl_implement_plan`.

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

2) Read existing artifacts (if present), in this order:
- workflow/artifacts/features/$1/status.md
- workflow/artifacts/features/$1/README.md
- workflow/artifacts/features/$1/requirements.md
- workflow/artifacts/features/$1/architecture.md (if exists)
- workflow/artifacts/features/$1/decisions.md (if exists)
Also read global docs if they exist:
- workflow/artifacts/coding-standards.md
- workflow/artifacts/app-architecture.md

3) If requirements are missing or too vague:
- Ask up to 6 targeted questions to clarify ONLY what is needed to plan.
Examples:
- Where in the app should the UI surface appear?
- Which API endpoints, server actions, or schema operations are involved?
- Any permissions/roles or feature flags?
- Any performance constraints?
- Definition of done for tests?

4) Create or update `workflow/artifacts/features/$1/implementation-plan.md` with this structure:

# Implementation plan

## Goal
One paragraph summary based on requirements.

## Scope recap
- In-scope:
- Out-of-scope:

## Approach (high level)
3–8 bullets describing the intended solution, aligned with global standards.
- Identify the existing local pattern to follow when one exists.
- If introducing a new helper/service/abstraction, justify it with a concrete current need.

## Work breakdown
### 1) Prep / research
- [ ] ...

### 2) Data / API / schema
- [ ] Endpoints/operations to add or update:
- [ ] Contract/schema considerations (if any):
- [ ] Error cases + retries/timeouts:
- [ ] Telemetry/logging (if relevant):

### 3) UI / UX
- [ ] Components to create/update:
- [ ] States: loading/empty/error/success
- [ ] Validation rules:
- [ ] Accessibility / i18n considerations:

### 4) State management / side effects (if relevant)
- [ ] ...

### 5) Testing
- Unit:
  - [ ] ...
- Integration:
  - [ ] ...
- E2E (Playwright):
  - [ ] ...
- Test data setup / fixtures:
  - [ ] ...

### 6) Rollout
- [ ] Feature flag (yes/no):
- [ ] Backwards compatibility:
- [ ] Migration notes (if any):

## Acceptance criteria mapping
Map each acceptance criterion in requirements.md to:
- Planned change(s)
- Test(s) that prove it

## Risks & mitigations
- Risk:
  - Mitigation:

## Open questions
- ...

5) Update `workflow/artifacts/features/$1/status.md`:
- Phase: Planning (or Design if architecture is required)
- Last updated: today
- What I did last: “Created implementation plan”
- Next action:
  - If architecture.md is required/empty: “Draft feature architecture”
  - Else: “Begin implementation”

Rules:
- Do not implement code.
- Do not invent requirements; ask questions if needed.
- Keep tasks concrete, ordered, and small enough to execute.
- Prefer checklists and explicit file/component names over vague steps.
- Align with global standards and reference them where relevant.
- Prefer the smallest viable change and existing local patterns over speculative abstraction.