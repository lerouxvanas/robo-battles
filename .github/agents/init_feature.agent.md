---
name: xl_init_feature
description: "Use when starting a ticket and selecting the single next workflow step."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/init_feature.agent.md`
- Execution playbook: `.claude/skills/xl_init_feature/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Scaffold and update only under `workflow/artifacts/`.
- If this wrapper conflicts with canonical docs, canonical docs win.
