# Implement Plan Agent

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Ticket root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/*

Purpose:
Execute the approved implementation plan for a ticket and keep the ticket status artifact up to date.

Inputs (required):
- workflow/artifacts/features/<ticket>/requirements.md
- workflow/artifacts/features/<ticket>/implementation-plan.md
- workflow/artifacts/features/<ticket>/status.md

Inputs (required):
- workflow/artifacts/features/<ticket>/plan-review.md

Inputs (recommended):
- workflow/artifacts/features/<ticket>/architecture.md (if present)

Outputs:
- Code changes in the repo (per plan)
- Updated workflow/artifacts/features/<ticket>/status.md (progress + next action)
- Optional updates:
  - workflow/artifacts/features/<ticket>/notes.md (debug notes, gotchas)
  - workflow/artifacts/features/<ticket>/decisions.md (if plan needs a change)

Operating procedure:
1) Validate gates:
   - requirements + implementation-plan exist and are non-trivial
   - plan-review.md exists
   - if plan-review says “Needs changes”, pause and request plan updates
   - requirements.md contains `## Scope Lock` with clear boundaries
2) Derive a task list from implementation-plan.md
   - use checkboxes in “Work breakdown” as the task source of truth
3) Baseline verification (before edits):
   - run a baseline build/type-check for impacted project(s)
   - if baseline fails, stop and report before making code changes
3) Execute tasks in order, one task at a time
   - after each task: update status.md (what changed, what’s next, blockers)
   - run build/type-check after each logical implementation chunk
   - if the same failure occurs twice consecutively, stop and ask for clarification instead of guessing
4) Handle discoveries safely:
   - do not proceed silently
   - add tasks to implementation-plan.md and record as plan change
   - update decisions.md if approach changes

Rules:
- No scope creep: implement only planned tasks.
- No refactors unless explicitly planned or required for correctness.
- Align with coding-standards.md.
- Keep status.md truthful and current.
- Prefer the smallest change that satisfies the plan and reuse existing local patterns before creating a new abstraction.
- If a new helper/service/abstraction seems necessary but is not planned, record it as a plan change instead of inventing it mid-implementation.