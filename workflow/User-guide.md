# Workflow Guide (Agentic, Artifacts-Driven)

This workflow is a lightweight, guided system for running ticket work with LLM assistance while keeping **the source of truth in files**, not chat history.

It is designed to work in Claude Code (via skills) and GitHub Copilot (via workspace instructions and thin compatibility wrappers).

---

## Cross-tool compatibility

Keep workflow behavior canonical in `workflow/` and `.claude/skills/`.

- Canonical gates and sequencing: `workflow/workflow.yaml`
- Canonical role contracts: `workflow/agents/*.agent.md`
- Canonical execution playbooks: `.claude/skills/*/SKILL.md`
- Copilot compatibility layer: `.github/copilot-instructions.md` and `.github/agents/*.agent.md`

When these sources disagree, precedence is:
1. `workflow/workflow.yaml`
2. `workflow/agents/*.agent.md`
3. `.claude/skills/*/SKILL.md`
4. `.github/agents/*.agent.md`

Maintenance rule:
- Update canonical files first.
- Keep `.github/agents/*` as routing wrappers only.
- Do not duplicate process logic in the compatibility layer.

---

## Key ideas

### Artifacts are the source of truth
All decisions, requirements, plans, progress, reviews, and test steps live in `workflow/artifacts/`.

### Prefer simple, pattern-aligned solutions
The workflow prefers the smallest viable change that meets the requirement and follows an existing local pattern. New helpers, services, abstractions, or mini-frameworks should only be introduced when there is a concrete current need that existing patterns do not handle cleanly.

### One ticket = one folder
Each ticket gets its own folder under:

- `workflow/artifacts/features/<ticket>/`

After merge and finalization, the ticket folder is moved to:

- `workflow/artifacts/archived/<ticket>/`

This makes it easy to resume work, hand over to someone else, and audit what changed.

### Skills are runnable commands
Skills live under:

- `.claude/skills/<skill>/SKILL.md`

They are invoked in Claude Code as `/skill_name <args>`.

### Agents are specs/contracts
Agent docs live under:

- `workflow/agents/*.agent.md`

These describe responsibilities and quality bars. Skills implement the agent behavior.

---

## Where to start

Start with `workflow/workflow.yaml`.

It defines the gates and next-step routing. Every ticket flow decision should follow this file first.

Before starting any ticket work:

1. Confirm global artifacts exist under `workflow/artifacts/`:
- `README.md`
- `app-architecture.md`
- `coding-standards.md`
- `decisions.md`
- `patterns/README.md`
2. If any are missing, run the bootstrap step (`xl_bootstrap`) and create them first.
3. Only then initialize the ticket (`xl_init_feature <ticket>`).

Example:

```bash
/xl_bootstrap
/xl_init_feature 2501 "Add Teilenummer field"
```

---

## Quickstart (Happy Path)

Use this sequence for a normal feature ticket.

```bash
/xl_init_feature <ticket> [optional title]
/xl_gather_requirements <ticket>
/xl_plan_implementation <ticket>
/xl_review_plan <ticket>
/xl_implement_plan <ticket>
/xl_code_review <ticket>
/xl_code_cleanup <ticket>
/xl_write_test_instructions <ticket>
/xl_finalize_feature <ticket>
```

Notes:
- `xl_review_plan` is required before `xl_implement_plan`.
- `requirements.md` must include `## Scope Lock` (in-scope, out-of-scope, allowed edit paths, boundary notes).
- Plans should identify the existing pattern to follow when one exists and justify any new abstraction with a concrete current need.
- `xl_implement_plan` runs baseline and per-chunk build/type-check verification gates.
- Use `xl_load_feature <ticket>` at any time to resume context.

---

## Step-by-step ticket flow

Use this as the default path for any new ticket.

1. Start the ticket
- Run `xl_init_feature <ticket> [optional title]`.
- This creates or verifies `workflow/artifacts/features/<ticket>/` and base ticket files.

2. Gather requirements
- Run `xl_gather_requirements <ticket>`.
- Produce or refine `requirements.md` with testable acceptance criteria.
- Include `## Scope Lock` with in-scope, out-of-scope, allowed edit paths, and boundary notes.

3. Plan implementation
- Run `xl_plan_implementation <ticket>`.
- Produce `implementation-plan.md` with ordered tasks, test strategy, and the intended pattern to follow or a concrete reason to deviate.

4. Review plan
- Run `xl_review_plan <ticket>`.
- If review requests changes, update with `xl_update_plan <ticket>` and re-review.
- Gate: `plan-review.md` must have a Ready verdict before implementation.
- Gate: plan must include explicit affected files/components and relevant API/schema/type impact checks.
- Gate: plan should prefer the simplest pattern-aligned solution and justify any new abstraction with a concrete current need.

5. Implement approved plan
- Run `xl_implement_plan <ticket>`.
- Execute tasks incrementally and keep `status.md` current after each meaningful step.
- Reuse existing local patterns where possible and avoid introducing new abstraction unless the plan explicitly justifies it.
- Verification gate: run baseline build/type-check before edits and build/type-check after each logical chunk.

6. Review code
- Run `xl_code_review <ticket>`.
- Record findings in `code-review.md` and resolve required changes.

7. Cleanup and quality checks
- Run `xl_code_cleanup <ticket>`.
- Apply formatting and lint fixes for changed files.

8. Produce test instructions
- Run `xl_write_test_instructions <ticket>`.
- Document manual and automated verification steps in `test-instructions.md`.

9. Finalize merged feature into global docs
- After merge, run `xl_finalize_feature <ticket>`.
- Sync important architecture/standards/decision/pattern learnings into global artifacts.
- Archive ticket artifacts to `workflow/artifacts/archived/<ticket>/`.

10. Resume later when needed
- Run `xl_load_feature <ticket>` to load current state and next action.
- `xl_load_feature` checks both active (`features/`) and archived (`archived/`) ticket folders.

11. Branch-level review (optional)
- Run `xl_branch_review <ticket>` for comprehensive review against `dev`.

Expected artifacts by phase:
- After `xl_init_feature`: `README.md`, `requirements.md`, `implementation-plan.md`, `status.md`, `code-review.md`, `decisions.md` (and optional `notes.md`)
- After `xl_gather_requirements`: completed `requirements.md`
- After `xl_plan_implementation`: completed `implementation-plan.md`
- After `xl_review_plan`: `plan-review.md` with verdict
- During/after `xl_implement_plan`: updated `status.md`, optional `decisions.md`/`notes.md`
- After `xl_code_review`: updated `code-review.md`
- After `xl_write_test_instructions`: `test-instructions.md`
- After `xl_finalize_feature`: global artifacts synced when warranted + ticket moved to `archived/`

---

## External Branch Review Flow

Use this when reviewing a branch you did not implement end-to-end in this workflow.

1. Run `xl_branch_review <ticket> [optional title]`.
2. Review `code-review.md` findings and verdict.
3. If changes are required, address findings and run `xl_branch_review <ticket>` again.
4. If approved, proceed to merge readiness.

This path can scaffold missing ticket artifacts from code and diff context.

---

## Decision shortcuts

Use these quick rules when uncertain.

1. Missing global artifacts: run `xl_bootstrap`.
2. New ticket with no folder: run `xl_init_feature <ticket>`.
3. Requirements unclear: run `xl_gather_requirements <ticket>`.
4. Plan missing or weak: run `xl_plan_implementation <ticket>` then `xl_review_plan <ticket>`.
5. New discoveries during implementation: run `xl_update_plan <ticket>` before continuing.
6. Unsure what is next: run `xl_load_feature <ticket>`.

---

## Folder structure

```text
workflow/
  workflow.yaml
  artifacts/
    README.md
    app-architecture.md
    coding-standards.md
    decisions.md
    archived/
      README.md
      2487/
        README.md
        requirements.md
        implementation-plan.md
        architecture.md
        plan-review.md
        code-review.md
        status.md
        decisions.md
        notes.md
    patterns/
      README.md
    features/
      2479/
        README.md
        requirements.md
        implementation-plan.md
        architecture.md
        plan-review.md
        code-review.md
        test-instructions.md
        status.md
        decisions.md
        notes.md

workflow/agents/
  architect.agent.md
  bootstrap.agent.md
  init_feature.agent.md
  requirements.agent.md
  planner.agent.md
  reviewer.agent.md
  update_plan.agent.md
  implement_plan.agent.md
  code_review.agent.md
  code_cleanup.agent.md
  testing.agent.md
  loader.agent.md
  branch_review.agent.md
  finalize_feature.agent.md

.claude/skills/
  xl_bootstrap/SKILL.md
  xl_init_feature/SKILL.md
  xl_gather_requirements/SKILL.md
  xl_plan_implementation/SKILL.md
  xl_review_plan/SKILL.md
  xl_update_plan/SKILL.md
  xl_implement_plan/SKILL.md
  xl_code_review/SKILL.md
  xl_code_cleanup/SKILL.md
  xl_write_test_instructions/SKILL.md
  xl_finalize_feature/SKILL.md
  xl_load_feature/SKILL.md
  xl_branch_review/SKILL.md

.github/
  copilot-instructions.md
  agents/
    architect.agent.md
    bootstrap.agent.md
    init_feature.agent.md
    requirements.agent.md
    planner.agent.md
    reviewer.agent.md
    update_plan.agent.md
    implement_plan.agent.md
    code_review.agent.md
    code_cleanup.agent.md
    testing.agent.md
    loader.agent.md
    branch_review.agent.md
    finalize_feature.agent.md
```