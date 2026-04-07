---
name: xl_update_plan
description: "Use when new information requires updating requirements and implementation plan artifacts."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/update_plan.agent.md`
- Execution playbook: `.claude/skills/xl_update_plan/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Update ticket artifacts before implementation continues.
- If this wrapper conflicts with canonical docs, canonical docs win.
