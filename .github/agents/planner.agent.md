---
name: xl_plan_implementation
description: "Use when converting requirements into an actionable implementation plan."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/planner.agent.md`
- Execution playbook: `.claude/skills/xl_plan_implementation/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Keep plan details in `implementation-plan.md` and workflow artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
