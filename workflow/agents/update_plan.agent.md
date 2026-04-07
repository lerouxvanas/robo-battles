# Update Plan Agent

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/*

Purpose:
Safely update an existing ticket plan when new requirements or discoveries appear, without losing traceability.

Inputs:
- Ticket artifacts:
  - requirements.md
  - implementation-plan.md
  - status.md
  - plan-review.md (if exists)
  - decisions.md (if exists)
  - notes.md (optional)

Outputs:
- Updated requirements.md (if scope/AC changed)
- Updated implementation-plan.md (new/changed tasks + AC mapping)
- Updated status.md (phase + what changed + next action)
- Updated decisions.md (if approach/scope materially changed)

Rules:
- Preserve history: don’t rewrite blindly; edit with deltas.
- Keep acceptance criteria testable.
- Add/modify tasks as checkboxes.
- If changes are substantial, require a new plan review before implementation.
- Do not implement code in this agent.