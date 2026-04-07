---
name: xl_write_test_instructions
description: Generate step-by-step testing instructions (manual + automated) for a ticket. Writes test-instructions.md and updates status.md.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Write Test Instructions skill.

## Artifact boundary — HARD STOP
Allowed writes: `workflow/artifacts/features/$1/` only.
Source code may be READ for context. It must NEVER be edited, created, or deleted.
This skill documents how to test — it does not run tests or fix code.

Source of truth:
- workflow/workflow.yaml
- Ticket root: workflow/artifacts/features/<ticket>/

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Gates:
- Ticket folder exists: workflow/artifacts/features/$1/
- requirements.md and implementation-plan.md exist
If missing: route to /xl_gather_requirements or /xl_plan_implementation and stop.

Process:

1) Read context
- workflow/artifacts/features/$1/requirements.md
- workflow/artifacts/features/$1/implementation-plan.md
- workflow/artifacts/features/$1/status.md
Optional:
- workflow/artifacts/features/$1/code-review.md
- workflow/artifacts/features/$1/notes.md
- If available, use git diff to identify touched areas for accuracy.

2) Ask minimal clarifying questions (only if needed)
Max 5:
- Where in the UI is the feature accessible (route/screen)?
- Any required roles/permissions?
- Any feature flags?
- Any required test data / existing records?
- Any environment prerequisites?

3) Write `workflow/artifacts/features/$1/test-instructions.md` with:

# Test instructions — Ticket $1

## Preconditions
- Environment:
- Feature flags:
- User role/permissions:
- Test data needed:

## Manual test steps
For each step include “Action” and “Expected”.
1) Action:
   Expected:
2) ...

## Acceptance criteria verification
Map each AC checkbox to:
- Manual step(s) that verify it
- Automated test(s) that verify it (if any)

## Automated checks
List exact commands (from package scripts if possible):
- Lint:
- Unit tests:
- Integration tests:
- E2E tests (Playwright):

## Edge cases to verify
- ...

## Notes / troubleshooting
- Common pitfalls, logs to check, how to reset state

4) Update `status.md`
- Last updated: today
- What I did last: “Generated test instructions”
- Add/Update a short section in status.md called “How to test (summary)” with 3–6 bullets.
- Next action:
  - If implementation incomplete: “Continue /xl_implement_plan $1”
  - Else: “Run tests and prepare PR/merge”

Rules:
- Be specific and sequential.
- Prefer real script commands discovered from package.json.
- Do not invent behavior; call out assumptions.
- Do not implement code.