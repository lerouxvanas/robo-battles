---
name: xl_bootstrap
description: Scaffold global workflow artifacts (architecture, coding standards, patterns) by analyzing the repo and asking a few targeted questions. Run this once per project.
argument-hint: "[optional project context]"
disable-model-invocation: true
---

You are the Bootstrap skill for this repository.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Never create or use `artifacts/` at repo root.

Goal:
Create or update the GLOBAL artifacts under `workflow/artifacts/` so that future feature work (ticket folders) has clear standards and a shared architectural baseline.

When invoked:

0) Safety check
- If a folder named `artifacts/` exists at repo root, do NOT use it.
- Always operate under `workflow/artifacts/`.

1) Confirm or create these paths (do not touch feature folders yet):
   - workflow/artifacts/README.md
   - workflow/artifacts/app-architecture.md
   - workflow/artifacts/coding-standards.md
   - workflow/artifacts/decisions.md
   - workflow/artifacts/patterns/README.md

Also ensure directories exist:
- workflow/artifacts/patterns
- workflow/artifacts/features

2) Repo scan (read-only first):
   - Identify the stack (framework, language, build tooling).
   - Identify lint/format/test setup (eslint/prettier/jest/vitest/playwright/etc).
   - Identify architecture signals (monorepo, Nx, workspace packages, src layout).
  - Identify key domains (API layer, data-fetching approach, UI library, state management).

3) Ask the user ONLY the minimum questions needed to avoid wrong standards.
   - Max 10 questions.
   - Use checkboxes and short options.
   - Provide sensible defaults if unanswered.
   Questions should focus on:
  - Preferred coding style choices (naming, folder structure, error handling, async/state conventions if applicable)
   - Testing expectations (unit vs integration vs e2e)
   - UI conventions (design system / component patterns)
  - API/data contract conventions
   - Review/PR expectations

4) Draft the global artifact files with pragmatic, concise content:
   - workflow/artifacts/README.md
     - What artifacts are
     - Where ticket artifacts go: workflow/artifacts/features/<ticket>/
     - Workflow gates (planning before implementation)
     - How to run the skills (/xl_init_feature, /xl_load_feature, etc.)
   - workflow/artifacts/app-architecture.md
     - C4-lite: system context, major modules, key flows, boundaries
     - Where core concerns live (auth, data, UI, routing, state)
     - “How to add a new feature” section
   - workflow/artifacts/coding-standards.md
     - Naming, structure, TypeScript conventions, error handling, logging
     - UI patterns (components, forms, dialogs)
     - Testing conventions
     - “Avoid” section for anti-patterns
   - workflow/artifacts/decisions.md
     - ADR-lite format + a first entry: “Adopt artifacts-based workflow”
   - workflow/artifacts/patterns/README.md
     - Index of patterns to add over time + how to propose a new pattern

5) Output format:
   A) Brief summary of findings from repo scan
   B) The questions (if any), clearly grouped
   C) Then write/update the files

Rules:
- Don’t implement features.
- Don’t make invasive refactors.
- If writing files, keep them short and “team-readable”.
- Prefer bullets over essays.