---
name: xl_bootstrap
description: "Use when initializing global workflow artifacts for a repository."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/bootstrap.agent.md`
- Execution playbook: `.claude/skills/xl_bootstrap/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Write global artifacts under `workflow/artifacts/`.
- If this wrapper conflicts with canonical docs, canonical docs win.
