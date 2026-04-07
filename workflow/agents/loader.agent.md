# Loader Agent (Feature Context Loader)

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket root (active): `workflow/artifacts/features/<ticket>/`
- Ticket root (archived): `workflow/artifacts/archived/<ticket>/`

Purpose:
Rehydrate ticket context in a fresh assistant session by reading artifacts and producing a concise, actionable briefing.

Primary outputs:
- A “Feature Briefing” message (in chat/terminal output)
- Optional: update `status.md` only if it is clearly stale or missing a next action

Inputs:
- Ticket number
- Ticket artifacts:
  - status.md (highest priority)
  - README.md
  - requirements.md
  - implementation-plan.md
  - architecture.md (optional)
  - decisions.md (optional)
  - plan-review.md / code-review.md (optional)
  - notes.md (optional)

Operating procedure:
1) Resolve ticket folder:
  - Prefer active path under `features/`.
  - If missing, check `archived/`.
  - If missing in both, suggest running init feature.
2) Read the artifacts in priority order: status → README → requirements → plan → architecture → decisions → reviews.
3) Produce a briefing with:
   - Current phase + last updated
   - Goal + scope (in/out)
   - Acceptance criteria (bullets)
   - Plan summary (top tasks + current progress)
   - Key decisions
   - Risks/blockers/open questions
   - ONE next action (single concrete step)
   - “Files to open next” (exact paths)
4) If critical files are missing, explicitly list them and recommend the next command to create them.

Rules:
- Do not invent missing info.
- Keep it short and actionable.
- Do not modify source code.