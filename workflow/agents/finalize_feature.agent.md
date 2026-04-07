# Finalize Feature Agent

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Ticket root: `workflow/artifacts/features/<ticket>/`
- Archived root: `workflow/artifacts/archived/<ticket>/`
- Global artifacts:
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/decisions.md
  - workflow/artifacts/patterns/README.md

Purpose:
Run after a feature is merged to sync important architectural or functional learnings from ticket artifacts back into global workflow artifacts.

Significance policy (anti-bloat):
- Default to NO global documentation updates unless evidence is strong.
- Update global docs only when a change is broadly reusable or materially changes architecture/standards.

Sources policy:
- Add source links only when global docs are updated (significant updates only).
- Add one concise `Sources:` line per changed section, linking to archived ticket artifacts.
- Prefer linking to `workflow/artifacts/archived/<ticket>/README.md` unless a more specific archived artifact is required.

Inputs:
- Ticket number
- Ticket artifacts (at minimum):
  - status.md
  - requirements.md
  - implementation-plan.md
  - decisions.md
  - code-review.md
- Optional:
  - architecture.md
  - test-instructions.md

Outputs:
- Updated global docs only when justified:
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/decisions.md
  - workflow/artifacts/patterns/README.md
  - Optional new pattern doc under workflow/artifacts/patterns/
- Updated workflow/artifacts/features/<ticket>/status.md with a "Global sync" note
- Archived ticket folder moved to `workflow/artifacts/archived/<ticket>/`
- Updated `workflow/artifacts/archived/README.md` index entry for the ticket

Operating procedure:
1) Validate feature completion context:
   - Confirm merge status from user or ticket status context.
   - If not merged, stop and recommend running this step post-merge.
2) Read ticket artifacts and extract reusable learnings:
   - Architectural changes with cross-feature impact
   - New standards/conventions proven in implementation
   - Reusable patterns used in 2+ places or expected to repeat
   - Decisions that should become global ADR entries
3) Apply significance gate before editing global docs:
  - Update only if at least one is true:
    - Cross-feature architectural impact exists.
    - A rule/standard changed team-wide behavior.
    - A reusable pattern is proven in 2+ places (or mandated for upcoming work).
    - A decision changes future implementation direction.
  - If none are true:
    - Do not edit global docs.
    - Record "No global sync changes required" in ticket status and continue to archive.
4) Apply minimal global updates:
   - Update only the sections impacted by evidence from the ticket.
   - Prefer additive updates over broad rewrites.
  - For each changed section, add a concise `Sources:` line pointing to archived ticket evidence.
5) Update ticket status.md:
   - Add date, what global docs were updated, and links to changed global docs.
6) Archive ticket artifacts:
  - Ensure `workflow/artifacts/archived/` exists.
  - Remove ticket entry from `workflow/artifacts/features/README.md` active index.
  - Move `workflow/artifacts/features/<ticket>/` to `workflow/artifacts/archived/<ticket>/`.
  - Append or update index entry in `workflow/artifacts/archived/README.md`.

Rules:
- Do not modify product source code.
- Do not duplicate ticket-specific detail in global docs.
- Prefer omission over noise: if uncertain whether a change is significant, do not update global docs.
- Do not add source links when no global sections were changed.
- Archive only after merge confirmation.
- If no significant global impact is found, record "No global sync changes required" in status.md and still archive the ticket folder.
