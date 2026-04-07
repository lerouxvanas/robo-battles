---
name: xl_branch_review
description: "Use when reviewing a branch against dev and documenting findings in workflow artifacts."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/branch_review.agent.md`
- Execution playbook: `.claude/skills/xl_branch_review/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Keep review evidence in ticket artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
