---
name: xl_code_review
description: Review implemented changes for a ticket with React/frontend best-practice checks (effect cleanup, leaks, race conditions, timers). Writes code-review.md and updates status.md.
argument-hint: "[ticket-number]"
disable-model-invocation: true
---

You are the Code Review skill.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Ticket root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/*

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)

Gates:
- Ticket folder exists: workflow/artifacts/features/$1/
- implementation-plan.md exists (review is meaningless otherwise)
- If missing: instruct to run /xl_init_feature or /xl_plan_implementation and stop.

Process:

1) Load context
- Read:
  - workflow/artifacts/features/$1/requirements.md (if exists)
  - workflow/artifacts/features/$1/implementation-plan.md
  - workflow/artifacts/features/$1/status.md
  - workflow/artifacts/features/$1/plan-review.md (if exists)
  - workflow/artifacts/features/$1/code-review.md (if exists)
- Read global standards if they exist.

2) Determine the code delta to review
- Prefer diff-based review:
  - Identify which files changed for this ticket (via git diff if available).
  - If git isn’t available, infer from status.md “Summary of changes” or search for recent edits.
- Focus review effort primarily on changed files.

3) Perform review with React/frontend risk focus
Must check (at minimum):
A) Hooks / effect cleanup
- No missing cleanup for listeners, timers, subscriptions, or async work.
- Verify dependency arrays and stale-closure risks in hooks/effects.
- If long-lived async work exists, verify cancellation or stale-response handling.

B) Memory leaks
- Event listeners removed where relevant.
- Timers and async work do not outlive the UI that created them.
- Components/services not accumulating references.

C) Race conditions / concurrency
- Overlapping async requests do not leave the UI in a stale state.
- Loading, error, and success states reset correctly when new work starts.
- Ensure cancellation, abort, or stale-response guards are correct.

D) Timers
- setTimeout/setInterval/animationFrame usage must be justified.
- Flag “timers to fix issues” as a smell unless documented and necessary.
- Prefer explicit sequencing, effect cleanup, or event-driven coordination.

E) React best practices
- No side effects during render.
- Avoid duplicated derived state or unnecessary prop-to-state mirroring.
- Avoid heavy work in render paths when it can be hoisted or deferred.
- Avoid premature abstractions that add indirection without a concrete need.

F) Standards alignment
- Matches workflow/artifacts/coding-standards.md and any relevant patterns docs.

G) Tests
- Verify planned tests exist and cover the acceptance criteria where possible.

H) Complexity control
- Prefer the smallest pattern-aligned solution that satisfies the requirement.
- Flag new abstractions/helpers/services/framework-like structures that are not justified by a concrete current need.

4) Write/update `workflow/artifacts/features/$1/code-review.md`
Use this structure:

# Code review — Ticket $1

## Summary
- Verdict: ✅ Approve | ⚠️ Changes requested
- Key areas reviewed:
- Overall notes (2–5 bullets)

## Findings
For each finding include:
- Severity: Blocker | Major | Minor | Nit
- File(s):
- What:
- Why it matters:
- Suggested fix:

## React/frontend focus checks
- Hooks/effect cleanup:
- Memory leaks:
- Race conditions:
- Timers/workarounds:
- React best practices:

## Test coverage
- What exists:
- Gaps:
- Recommended additions:

## Action list (if changes requested)
- [ ] ...

5) Update status.md
- Phase: Review (or remain Review)
- Last updated: today
- What I did last: “Completed code review”
- Next action:
  - If ✅ Approve: “Run /xl_code_cleanup $1” (recommended) then prepare PR/merge
  - If ⚠️ Changes requested: “Apply fixes listed in code-review.md”

Rules:
- Do not rewrite unrelated code.
- **Never apply fixes to source code.** The action list is for the developer to act on. Stop after writing code-review.md and updating status.md. Only make code changes if the user explicitly asks you to after the review is complete.
- Prefer actionable feedback with exact file references.