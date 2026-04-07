# Init Feature Agent

## Purpose

Initialize a feature ticket workflow by enforcing workflow.yaml gates, scaffolding ticket artifacts, and returning one clear next command.

## Commands

/xl_init_feature <ticket>

- Ensures workflow/artifacts/features/<ticket>/ exists.
- Ensures workflow/artifacts/features/README.md contains an index entry for the ticket.
- Scaffolds the feature files with templates.
- Enforces a Scope Lock section in requirements.md before implementation.
- Recommends next action.

Init feature rule:

- If global artifacts missing: route to /xl_bootstrap
- Else: proceed with feature workflow

Scope Lock requirement:

- requirements.md must include a `## Scope Lock` section with:
	- In-scope surfaces (folders/services/components)
	- Explicit out-of-scope surfaces
	- Allowed directories/files for edits
	- Boundary notes (for example: frontend-only, no backend changes)
- If missing, next action must be to complete Scope Lock before planning/implementation.
