---
name: xl_finalize_feature
description: Update global workflow artifacts after a feature is merged when ticket learnings affect architecture, standards, decisions, or reusable patterns.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Finalize Feature skill.

## Artifact boundary — HARD STOP
Allowed writes: `workflow/artifacts/` (global docs + archive move) only.
Product source code must NEVER be edited, created, or deleted by this skill.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket artifacts root: `workflow/artifacts/features/<ticket>/`
- Archived artifacts root: `workflow/artifacts/archived/<ticket>/`
- Global artifacts:
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/decisions.md
  - workflow/artifacts/patterns/README.md

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Goal:
Run after merge to keep global workflow artifacts accurate when a completed feature introduces significant reusable practices or architecture updates.

Significance policy (anti-bloat):
- Default to NO global documentation updates.
- Update global docs only for significant, broadly reusable changes.

Sources policy:
- Add source links only for significant global updates.
- Add one concise `Sources:` line per changed section.
- Source links should point to archived ticket artifacts, preferring:
  - `workflow/artifacts/archived/$1/README.md`

Process:

1) Validate post-merge context
- Read `workflow/artifacts/features/$1/status.md`.
- If merge is not confirmed in status context, ask for confirmation.
- If not merged, stop and recommend re-running after merge.

2) Load ticket artifacts
- Read required files if present:
  - workflow/artifacts/features/$1/requirements.md
  - workflow/artifacts/features/$1/implementation-plan.md
  - workflow/artifacts/features/$1/code-review.md
  - workflow/artifacts/features/$1/decisions.md
  - workflow/artifacts/features/$1/status.md
- Read optional files if present:
  - workflow/artifacts/features/$1/architecture.md
  - workflow/artifacts/features/$1/test-instructions.md
  - workflow/artifacts/features/$1/notes.md

3) Determine global sync impact
Evaluate whether the feature introduces any of the following:
- Cross-feature architecture changes
- New coding standards or conventions worth standardizing
- Reusable pattern worth documenting under `workflow/artifacts/patterns/`
- Decision that belongs in global `workflow/artifacts/decisions.md`

3.1) Apply significance gate
- Only edit global docs if at least one is true:
  - Cross-feature architectural impact is confirmed.
  - A team-wide standard/convention changed.
  - A reusable pattern is proven in 2+ places (or formally adopted for upcoming work).
  - A decision materially changes future implementation direction.
- If none are true:
  - Skip global doc edits.
  - Record "No global sync changes required" in status.
  - Continue to archive step.

4) Update global artifacts minimally
- Update only relevant sections in:
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/decisions.md
  - workflow/artifacts/patterns/README.md
- If a new pattern is warranted, create `workflow/artifacts/patterns/<pattern-name>.md` and add it to patterns index.
- Keep updates concise and evidence-based from ticket artifacts.
- Prefer omission over noise: if significance is uncertain, do not update global docs.
- For each changed section, add a concise `Sources:` line with an archived ticket link.

5) Update ticket status
- Append a "Global sync" note to `workflow/artifacts/features/$1/status.md`:
  - Date
  - Global docs updated (or "No global sync changes required")
  - Short rationale

6) Archive merged feature folder
- Ensure `workflow/artifacts/archived/` exists.
- Update active index `workflow/artifacts/features/README.md`:
  - Remove `- [$1](./$1/README.md)` entry if present.
- Move folder:
  - from `workflow/artifacts/features/$1/`
  - to `workflow/artifacts/archived/$1/`
- Update `workflow/artifacts/archived/README.md` index with:
  - linked ticket path (`[$1](./$1/README.md)`)
  - archive date
  - short summary

Output format:
- Merge status check result
- Global artifacts updated (list)
- Rationale per updated file
- Final status note added to ticket status
- Archive move completed + archived index updated

Rules:
- Do not modify product source code.
- Do not copy ticket-specific implementation details into global docs unless generalized.
- Do not add source links unless global sections were actually updated.
- Archive only after merge confirmation.
- If no meaningful global impact exists, write "No global sync changes required", skip global edits, and continue with archive.
