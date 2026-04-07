---
name: xl_gather_requirements
description: "Use when gathering and refining ticket requirements into a testable artifact."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/requirements.agent.md`
- Execution playbook: `.claude/skills/xl_gather_requirements/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Update `requirements.md` and `status.md` in the ticket folder.
- If this wrapper conflicts with canonical docs, canonical docs win.
