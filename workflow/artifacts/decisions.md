# Decisions

Use this file for ADR-lite entries that change how future work should be done.

## ADR template

- Date:
- Status: proposed | accepted | superseded
- Decision:
- Context:
- Consequences:

---

## 2026-03-27 - Adopt artifacts-based workflow

- Status: accepted
- Decision:
  Use `workflow/artifacts/` as the persistent source of truth for project standards, ticket planning, review, and finalization.
- Context:
  Chat history is not a reliable long-term project record. The repo needs lightweight, file-based workflow state that works across assistants.
- Consequences:
  - Global standards live under `workflow/artifacts/`.
  - Ticket work should be documented under `workflow/artifacts/features/<ticket>/`.
  - Compatibility wrappers should stay thin and defer to canonical workflow files.

## 2026-03-27 - Prefer styled-components for new UI work

- Status: accepted
- Decision:
  Use `styled-components` as the default styling approach for new component-level UI work.
- Context:
  The repo is a React frontend and now includes `styled-components`. The goal is to keep styles closer to components while avoiding growth in broad global CSS.
- Consequences:
  - New UI should default to component-scoped styles.
  - Existing CSS files may remain until there is a clear reason to migrate them.
  - Global CSS should stay limited to resets, tokens, and true app-wide concerns.

## 2026-03-27 - Grow toward feature folders

- Status: accepted
- Decision:
  As the app expands beyond starter-template size, prefer feature-oriented folders under `src/features/`.
- Context:
  The current root-level `src/` layout is fine for a starter app, but it will become harder to navigate as features accumulate.
- Consequences:
  - Small changes may still touch root files.
  - New multi-file work should usually live in a feature folder.
  - Shared code should be extracted only when reuse is proven.