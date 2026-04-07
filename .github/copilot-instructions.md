# Copilot Workflow Compatibility

This repository uses an artifacts-driven workflow. Keep workflow logic in one place and treat compatibility files as thin routing wrappers.

## Single Source Of Truth

- Workflow gates and sequencing: `workflow/workflow.yaml`
- Agent role contracts: `workflow/agents/*.agent.md`
- Execution playbooks: `.claude/skills/*/SKILL.md`
- Ticket and global artifacts: `workflow/artifacts/**`

When these files disagree, precedence is:
1. `workflow/workflow.yaml`
2. `workflow/agents/*.agent.md`
3. `.claude/skills/*/SKILL.md`
4. `.github/agents/*.agent.md` compatibility wrappers

## Operating Rules

- Do not create or use a repo-root `artifacts/` folder.
- Only write workflow outputs under `workflow/artifacts/`.
- Enforce workflow gates before coding.
- Keep `status.md` current when performing workflow steps.
- Do not duplicate process logic in `.github/agents`; reference canonical files instead.

## Command Routing

Use these skill names for workflow tasks:

- Start/scaffold feature: `xl_init_feature`
- Bootstrap global artifacts: `xl_bootstrap`
- Gather requirements: `xl_gather_requirements`
- Build implementation plan: `xl_plan_implementation`
- Review implementation plan: `xl_review_plan`
- Update requirements/plan: `xl_update_plan`
- Implement approved plan: `xl_implement_plan`
- Review implemented code: `xl_code_review`
- Cleanup formatting/lint: `xl_code_cleanup`
- Write test instructions: `xl_write_test_instructions`
- Finalize merged feature: `xl_finalize_feature`
- Load feature context: `xl_load_feature`
- Branch review: `xl_branch_review`

## Maintenance Contract

When changing workflow behavior:
1. Update `workflow/workflow.yaml` and/or `workflow/agents/*.agent.md` first.
2. Update `.claude/skills/*/SKILL.md` only if execution details changed.
3. Keep `.github/agents/*` wrappers minimal and reference-only.
4. Update `workflow/User-guide.md` if user-facing flow changed.
