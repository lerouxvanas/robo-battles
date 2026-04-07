---
name: xl_write_test_instructions
description: "Use when generating testing instructions for a ticket after implementation planning or coding."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/testing.agent.md`
- Execution playbook: `.claude/skills/xl_write_test_instructions/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Keep test instructions in ticket workflow artifacts.
- If this wrapper conflicts with canonical docs, canonical docs win.
