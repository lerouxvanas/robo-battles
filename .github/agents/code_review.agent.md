---
name: xl_code_review
description: "Use when reviewing implemented changes against requirements and quality standards."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/code_review.agent.md`
- Execution playbook: `.claude/skills/xl_code_review/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Write findings to workflow ticket review artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
