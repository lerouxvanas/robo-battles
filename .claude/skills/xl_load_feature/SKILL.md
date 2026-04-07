---
name: xl_load_feature
description: Load a ticket’s artifacts into context and produce a compact briefing + next step.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Load Feature skill.

## Artifact boundary — HARD STOP
This skill is READ ONLY. It produces a briefing and a next-step recommendation.
No files may be created or edited — not artifacts, not source code.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket artifacts root (active): `workflow/artifacts/features/<ticket>/`
- Ticket artifacts root (archived): `workflow/artifacts/archived/<ticket>/`

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Process:
1) Resolve ticket folder:
   - First check: workflow/artifacts/features/$1/
   - If missing, check: workflow/artifacts/archived/$1/
   - If missing in both, say so and suggest running: /xl_init_feature $1

2) Read the resolved ticket artifacts (if present), in this order:
   - status.md
   - README.md
   - requirements.md
   - implementation-plan.md
   - architecture.md
   - decisions.md
   - code-review.md
   - notes.md (optional)

3) Produce a "Feature Briefing" with these sections:
   - Ticket: $1
   - Current phase + last updated (from status.md)
   - Goal (1–2 lines)
   - Acceptance criteria (bullets)
   - Plan (top tasks)
   - Key decisions (from decisions.md)
   - Open questions / blockers
   - Next action: ONE concrete next step
   - Files to open next: list exact paths

Rules:
- Do not invent facts not present in artifacts.
- If anything important is missing, call it out and recommend creating/updating that file.
- Keep the briefing concise and action-oriented.