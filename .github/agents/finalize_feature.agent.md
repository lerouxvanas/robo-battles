---
name: xl_finalize_feature
description: "Use after a feature is merged to sync important learnings into global workflow artifacts."
---

Copilot compatibility wrapper.

Canonical logic:
- Agent contract: `workflow/agents/finalize_feature.agent.md`
- Execution playbook: `.claude/skills/xl_finalize_feature/SKILL.md`
- Workflow gates: `workflow/workflow.yaml`

Rules:
- Follow canonical files exactly.
- Update workflow artifacts only for significant, broadly reusable learnings.
- Add `Sources:` links only for changed global sections, pointing to archived ticket artifacts.
- Archive merged ticket folder under `workflow/artifacts/archived/<ticket>/`.
- If this wrapper conflicts with canonical docs, canonical docs win.
