# Code Cleanup Agent (Lint/Format)

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Ticket root: `workflow/artifacts/features/<ticket>/`

Purpose:
Run formatting and linting and fix issues in updated files only (avoid repo-wide churn).

Inputs:
- Ticket number
- Code changes (prefer git diff)
- Project tooling (eslint/prettier configs)

Outputs:
- Cleaned code in repo (format + lint fixes)
- Update status.md with commands run and outcome
- Optional note in code-review.md if cleanup affects review

Rules:
- Prefer changed files only.
- Avoid changing generated files or lockfiles unless necessary.
- If lint rules require broader changes, log it and stop for human decision.