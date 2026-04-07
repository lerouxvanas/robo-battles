---
name: xl_update_plan
description: Update requirements.md and implementation-plan.md for an existing ticket when new info is discovered. Updates status.md and recommends the next command.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Update Plan skill.

## Artifact boundary — HARD STOP
Allowed writes: `workflow/artifacts/features/$1/` only.
Source code may be READ for context. It must NEVER be edited, created, or deleted.
Do NOT implement changes. The implementation gate is `/xl_implement_plan`.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket root: `workflow/artifacts/features/<ticket>/`

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Gates:
- Ticket folder exists: workflow/artifacts/features/$1/
- Required files exist:
  - requirements.md
  - implementation-plan.md
  - status.md
If missing: instruct to run /xl_init_feature or /xl_plan_implementation and stop.

Process:

1) Load context
Read:
- workflow/artifacts/features/$1/status.md
- workflow/artifacts/features/$1/requirements.md
- workflow/artifacts/features/$1/implementation-plan.md
Optional:
- workflow/artifacts/features/$1/plan-review.md
- workflow/artifacts/features/$1/architecture.md
- workflow/artifacts/features/$1/decisions.md
- workflow/artifacts/features/$1/notes.md

2) Ask for the change (minimal questions)
Ask the user to provide the change in one of these formats:
- A) "New requirement(s): ..." (bullets)
- B) "Change request: ..." (what changed + why)
- C) "Discovery during implementation: ..." (what you found + impact)

Then ask up to 6 clarifying questions ONLY if needed:
- Which acceptance criteria change or new ACs should be added?
- Is this in-scope for the same ticket or a follow-up ticket?
- Any UI/API impact?
- Any test expectations?
- Any deadlines/constraints?

3) Update requirements.md (delta-based)
- Do NOT rewrite from scratch unless it is tiny.
- Add a “Change log” section at the bottom (append-only), with:
  - Date
  - What changed
  - Why
- Update Goals / Non-goals / Acceptance criteria accordingly.
- Ensure new ACs are checkboxes.

4) Update implementation-plan.md (delta-based)
- Add/adjust tasks under the relevant sections as checkboxes.
- Ensure tasks remain ordered and small.
- Update “Acceptance criteria mapping” so every new/changed AC has:
  - planned change(s)
  - proving test(s)
- Add a “Plan change log” section at the bottom (append-only), with:
  - Date
  - What tasks were added/changed
  - Why

5) Update status.md
- Last updated: today
- What I did last: “Updated requirements/plan”
- Risks/blockers: note any new risks introduced
- Next action:
  - If changes are substantial OR plan-review.md exists and is now stale:
    Recommend `/xl_review_plan $1`
  - Else:
    Recommend `/xl_implement_plan $1` (continue execution)

6) Output
- Summarize exactly what changed (files + sections)
- Provide ONE NEXT COMMAND with a 1-sentence reason

Rules:
- Do not implement code.
- Keep history via change logs.
- Prefer creating a new ticket if scope expands materially; if so, recommend it explicitly.