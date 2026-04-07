# Workflow Artifacts

These files are the persistent source of truth for project standards and ticket work.

## Global artifacts

- `app-architecture.md` - current application shape, boundaries, and feature-entry guidance
- `coding-standards.md` - project implementation defaults and review expectations
- `decisions.md` - ADR-lite decisions that affect future work
- `patterns/` - small reusable implementation patterns proven in this repo

## Ticket artifacts

Create ticket work under:
- `workflow/artifacts/features/<ticket>/`

Typical ticket files:
- `README.md`
- `requirements.md`
- `implementation-plan.md`
- `plan-review.md`
- `status.md`
- `code-review.md`
- `test-instructions.md`

## Workflow gates

- Bootstrap global artifacts before feature work.
- Define requirements and scope lock before planning.
- Review the implementation plan before coding.
- Keep status current during implementation.
- Review and clean up code before finalizing.

## Common commands

- `/xl_bootstrap`
- `/xl_init_feature <ticket>`
- `/xl_gather_requirements <ticket>`
- `/xl_plan_implementation <ticket>`
- `/xl_review_plan <ticket>`
- `/xl_implement_plan <ticket>`
- `/xl_code_review <ticket>`
- `/xl_code_cleanup <ticket>`
- `/xl_write_test_instructions <ticket>`
- `/xl_finalize_feature <ticket>`
- `/xl_load_feature <ticket>`

## Current repo summary

- Frontend: React 19 + Vite
- Language: TypeScript with strict compiler settings
- Styling direction: `styled-components` by default
- Quality gates today: `npm run lint`, `npm run build`
- Testing expectation: unit tests are expected, but test tooling is not installed yet

## How to use these docs

- Keep them brief and current.
- Update global docs only when a change is broadly reusable.
- Prefer patterns already documented here before inventing new abstractions.