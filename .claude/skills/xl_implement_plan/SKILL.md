---
name: xl_implement_plan
description: Execute a ticket’s implementation-plan.md step-by-step, updating status.md as progress is made. Implements code changes in the repo.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Implement Plan skill.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket artifacts root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/*

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

High-level objective:
Implement the work described in `workflow/artifacts/features/$1/implementation-plan.md` in small, verifiable steps, while continuously updating `status.md` to reflect real progress.

Gates (must pass before code changes):
1) Ticket folder exists: `workflow/artifacts/features/$1/`
   - If missing: instruct to run `/xl_init_feature $1 "<title>"` and stop.
2) Required files exist and are non-empty:
   - requirements.md
   - implementation-plan.md
   - status.md
   - If any missing/empty: recommend `/xl_gather_requirements $1` or `/xl_plan_implementation $1` and stop.

3) Plan review gate (required):
   - plan-review.md must exist.
   - If missing: instruct the user to run `/xl_review_plan $1` and stop.
   - If verdict is "⚠️ Needs changes" (or equivalent): stop and instruct the user to revise the plan and re-run `/xl_review_plan $1`.

4) Scope lock gate (required):
  - `requirements.md` must include `## Scope Lock` with clear in-scope/out-of-scope boundaries and allowed edit paths.
  - If missing/incomplete: stop and instruct the user to complete Scope Lock.

Process:

0) Load context
  - Read:
    - workflow/artifacts/features/$1/status.md
    - workflow/artifacts/features/$1/requirements.md
    - workflow/artifacts/features/$1/implementation-plan.md
    - workflow/artifacts/features/$1/plan-review.md
    - Optional: architecture.md, decisions.md
- Read global standards if they exist.

0.1) Baseline verification (before edits)
- Run a baseline build/type-check for impacted project(s) before changing code.
- If baseline fails:
  - Stop implementation.
  - Record failure summary in status.md.
  - Ask for guidance before proceeding.

1) Extract the task list
- Identify the plan’s checklist items under “Work breakdown” and “Testing”.
- Treat these checkboxes as the authoritative task list.
- If tasks are too vague to implement safely:
  - Ask up to 5 clarifying questions OR propose concrete task wording edits
  - Update implementation-plan.md first (no code changes yet)

2) Update status.md before starting
Write a new entry to status.md with:
- Phase: Build
- Last updated: today
- What I did last: “Starting implementation”
- Next action: “Implement task 1: <task name>”
- Add a “Progress” section if not present:
  - Planned tasks (copied list)
  - Completed tasks (empty initially)

3) Implement iteratively (one task at a time)
For each task in order:
A) Announce the task you are about to do (briefly).
B) Make the smallest reasonable code changes to complete ONLY that task, following existing local patterns before introducing new abstractions.
C) Run appropriate checks:
   - If repo has a standard command, prefer:
     - frontend lint/test/build commands if applicable
   - If unsure, run the lightest safe check first (e.g., unit tests) and escalate if needed.
  - Always run build/type-check after each logical implementation chunk (not just at the end).
D) Failure handling:
  - Track consecutive failures for the same underlying issue.
  - If the same failure happens twice in a row, stop and ask the user for clarification instead of guessing.
E) Update status.md immediately after completing the task:
   - Mark the task as completed in “Progress”
   - What I did last: summary of what changed + where
   - Next action: next task
   - Risks/blockers: any failures or follow-ups

4) Handle discoveries (scope control)
If you discover missing requirements, hidden dependencies, or needed refactors:
- Do NOT continue as if it is part of the plan.
- Instead:
  - Add a checkbox task to implementation-plan.md under the right section
  - Note the discovery in status.md under “Risks / blockers”
  - If it changes approach, append an entry to decisions.md
- Then ask the user whether to proceed with the plan change (briefly) OR route to /xl_review_plan.

(If you must choose without asking, prefer the safest minimal change and record it as a plan change.)

5) Testing phase (must happen)
- Ensure the “Testing” section tasks are executed.
- If no tests are specified, add at least:
  - one unit/integration test (where appropriate)
  - or one e2e check (if this is UI-critical)
- Record test commands run and outcomes in status.md.

6) Finish
When all planned tasks are completed:
- Update status.md:
  - Phase: Review
  - What I did last: “Implementation completed”
  - Next action: “Run /xl_code_review $1” (or manual review if that skill doesn’t exist yet)
  - Include a short “Summary of changes” and “How to test” section.

Rules:
- Implement only what is in the plan (no scope creep).
- No broad refactors unless explicitly planned or required for correctness.
- Keep changes aligned with coding-standards.md.
- Keep commits/changes logically grouped (even if you’re not committing).
- Never leave status.md stale after meaningful work.
- If a new helper/service/abstraction seems necessary but is not already justified in the plan, stop and record a plan change instead of inventing it during implementation.