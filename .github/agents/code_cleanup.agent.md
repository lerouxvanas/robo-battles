---
name: xl_code_cleanup
description: "Use when formatting and linting changed files after implementation and review."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/code_cleanup.agent.md`
- Execution playbook: `.claude/skills/xl_code_cleanup/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Keep cleanup actions and results in ticket status artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
