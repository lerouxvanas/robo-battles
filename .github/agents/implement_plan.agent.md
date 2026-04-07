---
name: xl_implement_plan
description: "Use when executing an approved implementation plan in small, verifiable steps."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/implement_plan.agent.md`
- Execution playbook: `.claude/skills/xl_implement_plan/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Keep status and progress updated in ticket artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
