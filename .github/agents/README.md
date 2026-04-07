# Copilot Agent Wrappers

Files in this folder are compatibility wrappers for GitHub Copilot.

Do not duplicate workflow logic here. Keep behavior authoritative in:

- `workflow/workflow.yaml`
- `workflow/agents/*.agent.md`
- `.claude/skills/*/SKILL.md`

If behavior changes, update canonical workflow files first and keep wrappers thin.

Notable wrappers:
- `init_feature.agent.md`: ticket entrypoint routing
- `finalize_feature.agent.md`: post-merge global artifact sync routing
