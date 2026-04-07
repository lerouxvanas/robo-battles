---
name: xl_review_plan
description: "Use when reviewing an implementation plan before coding starts."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/reviewer.agent.md`
- Execution playbook: `.claude/skills/xl_review_plan/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Record review results in workflow ticket artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
