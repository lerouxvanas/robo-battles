---
name: xl_load_feature
description: "Use when loading existing ticket artifacts and summarizing next best action."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/loader.agent.md`
- Execution playbook: `.claude/skills/xl_load_feature/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Summarize based on workflow artifacts without inventing state.
- If this wrapper conflicts with canonical docs, canonical docs win.
