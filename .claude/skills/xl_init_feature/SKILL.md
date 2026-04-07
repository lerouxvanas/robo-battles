---
name: xl_init_feature
description: Guides work using workflow gates. Scaffolds ticket artifact folders and tells you the single next best command to run.
argument-hint: "[ticket-number] [optional title]"
disable-model-invocation: true
---

You are the Init Feature skill.

## Artifact boundary — HARD STOP
Allowed writes: `workflow/artifacts/` only (scaffold ticket folder and index).
Source code must NEVER be read, edited, created, or deleted by this skill.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Ticket artifacts root: `workflow/artifacts/features/<ticket>/`
- Never create or use `artifacts/` at repo root.

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)
- Optional title: remaining $ARGUMENTS

Primary job:
Given a ticket number, ensure the per-ticket artifacts exist and recommend the next step.

Process:

0) Safety check
- If a folder named `artifacts/` exists at repo root, do NOT use it.
- Always operate under `workflow/artifacts/`.

1) Validate prerequisites:
- If global artifacts are missing:
  - workflow/artifacts/README.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/decisions.md
  - workflow/artifacts/patterns/README.md
  STOP and instruct the user to run `/xl_bootstrap` first.

2) Ensure base directories exist:
- workflow/artifacts/patterns
- workflow/artifacts/features

3) Ensure ticket folder exists:
- workflow/artifacts/features/$1/
- If it doesn't exist, create it.

3.1) Maintain active features index
- Ensure `workflow/artifacts/features/README.md` exists.
- Add an index entry for `$1` if missing, using the format:
  - `- [\`$1\`](./$1/README.md) - \`YYYY-MM-DD\` - <short summary>`
  - Date: today's date
  - Summary: use the optional title argument if provided; otherwise derive a one-line description from the README.md title once created; otherwise use `"pending summary"`
- Do not create duplicate entries.

4) Ensure these ticket files exist (create from templates if missing):
- workflow/artifacts/features/$1/README.md
- workflow/artifacts/features/$1/requirements.md
- workflow/artifacts/features/$1/architecture.md
- workflow/artifacts/features/$1/implementation-plan.md
- workflow/artifacts/features/$1/code-review.md
- workflow/artifacts/features/$1/status.md
- workflow/artifacts/features/$1/decisions.md
(Optional)
- workflow/artifacts/features/$1/notes.md

5) Populate minimal starter content (only if file is missing or empty):
- README.md: title, links, 1-paragraph summary placeholder
- status.md: Phase = Planning, Last updated = today, Next action = fill requirements
- requirements.md: problem/goals/non-goals/AC template + mandatory `## Scope Lock` section:
  - In scope
  - Out of scope
  - Allowed edit paths
  - Boundary notes (e.g., frontend-only)
- implementation-plan.md: tasks/testing plan template
- architecture.md: “optional unless complex” guidance
- code-review.md: checklist template
- decisions.md: ADR-lite template

6) Determine “Next step” (single recommendation) using the actual skill command names:
- If requirements.md is empty OR `## Scope Lock` is missing/incomplete → `/xl_gather_requirements <ticket>`
- Else if implementation-plan.md is empty or only has template placeholders → `/xl_plan_implementation <ticket>`
- Else if plan-review.md is missing → `/xl_review_plan <ticket>`
- Else → `/xl_implement_plan <ticket>`

Never invent command names. Always use the exact commands from the happy-path sequence:
  /xl_gather_requirements <ticket>
  /xl_plan_implementation <ticket>
  /xl_review_plan <ticket>
  /xl_implement_plan <ticket>
  /xl_code_review <ticket>
  /xl_code_cleanup <ticket>
  /xl_write_test_instructions <ticket>
  /xl_finalize_feature <ticket>

Output format:
- Created/verified files (list)
- Current phase
- Missing gates
- NEXT COMMAND (exact text to run) + 1-sentence reason

Rules:
- Keep it strict: one next command.
- Don’t start coding unless planning artifacts exist.
- Don’t modify source code; only scaffold artifacts.