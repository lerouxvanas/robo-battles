---
name: xl_code_cleanup
description: Run prettier/eslint and fix linting/formatting issues for changed files only. Updates status.md with commands run and results.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Code Cleanup skill.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket root: `workflow/artifacts/features/<ticket>/`

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Gates:
- Ticket folder exists: workflow/artifacts/features/$1/
- If missing: instruct to run /xl_init_feature $1 "<title>" and stop.

Process:

1) Load context
- Read:
  - workflow/artifacts/features/$1/status.md
  - workflow/artifacts/features/$1/code-review.md (if exists)

2) Identify files to clean
- Prefer git diff to get changed files:
  - staged + unstaged changes
- If git diff is unavailable:
  - Ask the user to provide the file list OR infer from status.md “Summary of changes”.
- Restrict cleanup to these files.

3) Run formatting first (prettier)
- If prettier is available, run it on the changed files only.
- Prefer the project’s standard command (e.g. npm scripts) if discoverable.

4) Run lint second (eslint)
- Run eslint on changed files only.
- Use `--fix` where appropriate.
- If fixes introduce non-trivial behavior changes, STOP and document.

5) Validate
- Re-run lint on the same file set to confirm clean.
- If tests are quick and standard, run a minimal test command (optional).

6) Update status.md
Add:
- Phase: Review (or keep current)
- Last updated: today
- What I did last: “Ran prettier/eslint on changed files”
- Commands run (exact)
- Outcome:
  - success / remaining warnings
  - any files skipped (and why)
- Next action:
  - “Prepare PR / merge” OR “Address remaining lint issues”

Rules:
- Do NOT reformat the whole repo.
- Do NOT change unrelated files.
- Do NOT “fix” by disabling rules unless explicitly allowed; instead flag it.
- Record exactly what commands were run.