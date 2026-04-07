# Workflow Cheat Sheet

Use this page for daily execution. Canonical rules still live in `workflow/workflow.yaml`.

## 0) One-time bootstrap check

Required global artifacts:
- `workflow/artifacts/README.md`
- `workflow/artifacts/app-architecture.md`
- `workflow/artifacts/coding-standards.md`
- `workflow/artifacts/decisions.md`
- `workflow/artifacts/patterns/README.md`

If any are missing:

```bash
/xl_bootstrap
```

## 1) Standard feature flow

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

Gate notes:
- `requirements.md` must include `## Scope Lock` before implementation.
- `/xl_review_plan` must verify affected-file coverage and relevant API/schema/type impacts.
- `/xl_implement_plan` runs baseline + per-chunk build/type-check verification.

`/xl_finalize_feature` should be run after merge. It syncs global docs and archives the ticket folder under `workflow/artifacts/archived/<ticket>/`.

Example:

```bash
/xl_init_feature 2501 "Add Teilenummer field"
/xl_gather_requirements 2501
/xl_plan_implementation 2501
/xl_review_plan 2501
/xl_implement_plan 2501
/xl_code_review 2501
/xl_code_cleanup 2501
/xl_write_test_instructions 2501
/xl_finalize_feature 2501
```

## 2) Mandatory gates

Before implementation (`/xl_implement_plan`):
- `requirements.md` exists and is meaningful
- `implementation-plan.md` exists and is meaningful
- `plan-review.md` exists
- `plan-review.md` verdict is Ready

If `plan-review.md` says Needs changes:

```bash
/xl_update_plan <ticket>
/xl_review_plan <ticket>
```

## 3) Resume any ticket

```bash
/xl_load_feature <ticket>
```

Use this when returning to a ticket after a break.
The loader checks both active `features/` and archived `archived/` folders.

## 4) External branch review flow

Use this when reviewing work done outside this workflow.

```bash
/xl_branch_review <ticket> [optional title]
```

If changes are requested:
1. Apply fixes
2. Re-run `/xl_branch_review <ticket>`
3. Repeat until approved

## 5) Artifact expectations by phase

After `/xl_init_feature`:
- `README.md`
- `requirements.md`
- `implementation-plan.md`
- `status.md`
- `code-review.md`
- `decisions.md`
- optional `notes.md`

After `/xl_review_plan`:
- `plan-review.md`

After `/xl_write_test_instructions`:
- `test-instructions.md`

## 6) Quick troubleshooting

Issue: "Do not know next step"
- Run `/xl_load_feature <ticket>`

Issue: "Implementation blocked"
- Check `plan-review.md` exists and verdict is Ready
- If not Ready, run `/xl_update_plan <ticket>` then `/xl_review_plan <ticket>`

Issue: "Global gate failed"
- Run `/xl_bootstrap`
