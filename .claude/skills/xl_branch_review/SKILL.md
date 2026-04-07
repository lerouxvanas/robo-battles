---
name: xl_branch_review
description: Review code changes on a branch you did not develop. Diffs against dev, performs a comprehensive React/frontend code review, and documents findings in the standard artifact structure.
argument-hint: "[ticket-number] [optional title]"
disable-model-invocation: true
---

You are the Branch Review skill.

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Ticket root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/*

Input:
- Ticket number is required: $ARGUMENTS[0] (or $1)
- Optional title: remaining $ARGUMENTS
- The user may provide Jira ticket requirements (paste or description). If so, capture them.

Purpose:
Review code on a branch that someone else developed. There is no existing workflow documentation. This skill scaffolds the artifact folder, captures any available context, diffs the branch against `dev`, performs a thorough code review, and documents everything so the artifacts can be used for future work on the same ticket.

Process:

0) Safety check
- Always operate under `workflow/artifacts/`.

1) Scaffold the ticket artifact folder
- Create `workflow/artifacts/features/$1/` if it doesn't exist.
- Create these files with starter content (only if missing):
  - README.md: ticket number, title (from args or branch name), date, "Branch review (external development)"
  - requirements.md: if the user provided Jira requirements, write them here. Otherwise leave a placeholder noting "Requirements not provided — sourced from code review observations."
  - status.md: Phase = Branch Review, Last updated = today
  - code-review.md: (will be populated in step 4)
  - decisions.md: ADR-lite template (empty)
- Ensure `workflow/artifacts/features/README.md` includes:
  - `- [$1](./$1/README.md)`
  - Add only if missing (no duplicates).

2) Gather context
- Ask the user (max 5 questions, skip if already provided):
  - Jira ticket requirements or description (if not already given)
  - Any known areas of concern or focus?
  - Any context on the feature's purpose?
  - Are there specific files or components to prioritize?
  - Any known issues or bugs reported?
- If the user has nothing to add, proceed with code-only review.

3) Determine the code delta
- Run `git diff dev...HEAD --name-only` to get the list of changed files.
- Run `git diff dev...HEAD --stat` for a summary.
- Run `git log dev..HEAD --oneline` to understand the commit history.
- Group changed files by type/area (components, hooks, state, API, styles, tests, etc.).
- Read each changed file fully to understand the implementation.
- For large diffs (>30 files), prioritize:
  A) New components/hooks/state modules (highest risk)
  B) Modified components/hooks/state modules
  C) API/data-fetching modules and models
  D) Tests
  E) Styles and configs (lowest risk)

4) Perform comprehensive code review
Review every changed file against ALL of the following categories:

A) Hooks / effect cleanup
- No missing cleanup for listeners, timers, subscriptions, or async work.
- Check hook dependency arrays for stale-closure risks.
- If long-lived async work exists, verify cancellation or stale-response guards.
- Check error paths are handled upstream or surfaced to the UI.

B) Memory leaks
- Event listeners added must be removed when no longer needed.
- Long-lived async work and timers must not outlive the UI that created them.
- Components/services not accumulating references (growing arrays/maps without cleanup).

C) Race conditions / concurrency
- Overlapping requests do not let stale responses overwrite fresh state.
- Loading/error states correctly reset on new requests.
- Cancellation, abort, or stale-response handling is implemented where needed.
- Form submissions and repeated actions are guarded against duplicate execution when relevant.

D) Timers / workarounds
- setTimeout/setInterval/requestAnimationFrame usage must be justified.
- Flag ANY timer used to "fix" a timing issue as a code smell.
- Prefer explicit sequencing, effect cleanup, or event-driven coordination.
- If a timer IS justified, it must be cleaned up on destroy.

E) Error handling
- API error paths handled (network, validation, server, or schema/contract failures as applicable).
- Async error paths handled with a clear user-facing or logged outcome.
- User-visible errors surfaced appropriately (toast, inline message, etc.).
- No silent swallowing of errors (empty catchError, console.log only).

F) Type safety
- No `any` types (or justified with a comment).
- Proper use of generics, union types, and type guards.
- Null/undefined handled correctly (optional chaining, nullish coalescing, strict checks).
- No unsafe type assertions (`as any`, `as unknown as X`) without justification.

G) Rendering performance
- Stable keys used for rendered lists.
- No heavy computation or unstable object creation in hot render paths.
- Expensive derived values are hoisted, cached, or deferred when justified.
- Large collections use an appropriate rendering strategy when needed.

H) State management
- Avoid duplicated derived state and unnecessary prop-to-state mirroring.
- State updates remain local unless shared coordination is required.
- Cross-component state flow is explicit and maintainable.

I) Security
- No `innerHTML` binding without sanitization.
- No user input directly interpolated into queries or URLs.
- Unsafe URL or HTML handling is justified and constrained.

J) Accessibility
- ARIA attributes present on interactive custom elements.
- Keyboard navigation supported (tabindex, keydown handlers where needed).
- Focus management on dialogs/modals (focus trap, restore focus on close).
- Screen reader considerations (aria-live for dynamic content, sr-only labels).

K) Dead code & hygiene
- No unused imports, variables, functions, or parameters.
- No leftover `console.log`, `console.debug`, or `debugger` statements.
- No commented-out code blocks (should be removed, not commented).
- No TODO/FIXME without a ticket reference.

L) Naming & conventions
- Consistent with codebase naming (check coding-standards.md).
- File naming follows project conventions.
- Variable/method naming is clear and descriptive.
- No abbreviations that aren't established in the codebase.

M) Circular dependencies & imports
- No circular import chains.
- Barrel file usage follows project conventions.
- Imports ordered consistently (framework, third-party, project).
- No deep imports into other module internals.

N) API / data-fetching patterns
- Loading, error, and empty states handled for each relevant fetch.
- Cache invalidation / refetch strategy appropriate when caching exists.
- No obvious over-fetching or redundant requests.
- Error responses handled with user feedback.

O) Breaking changes & compatibility
- Shared interfaces/types: are changes backwards compatible?
- Public API of shared components: are prop and event contract changes safe?
- Any changes to services used by other modules?

P) Test coverage
- Do tests exist for the changed code?
- Are edge cases and error paths tested?
- Are mocks/stubs appropriate (not testing implementation details)?
- If no tests exist, flag this with recommended test additions.

5) Write `workflow/artifacts/features/$1/code-review.md`

# Branch review — Ticket $1

## Overview
- Branch: <branch name>
- Base: dev
- Reviewed: <today's date>
- Files changed: <count>
- Verdict: APPROVE | CHANGES REQUESTED | BLOCKER

## Change summary
Brief description of what the branch implements, inferred from code and any provided requirements.

## File inventory
| File | Type | Risk | Notes |
|------|------|------|-------|
| ... | component/service/etc | high/medium/low | ... |

## Findings
For each finding:
- ID: BR-001, BR-002, etc.
- Severity: Blocker | Major | Minor | Nit
- Category: (one of A–P above)
- File(s): exact path(s) and line(s)
- What: description of the issue
- Why it matters: impact (bug, leak, crash, perf, maintenance, etc.)
- Suggested fix: concrete code suggestion or approach
- Effort: trivial | small | medium | large

## Review checklist results
- [ ] A) Hooks / effect cleanup
- [ ] B) Memory leaks
- [ ] C) Race conditions
- [ ] D) Timers / workarounds
- [ ] E) Error handling
- [ ] F) Type safety
- [ ] G) Rendering performance
- [ ] H) State management
- [ ] I) Security
- [ ] J) Accessibility
- [ ] K) Dead code & hygiene
- [ ] L) Naming & conventions
- [ ] M) Circular dependencies
- [ ] N) API / data-fetching patterns
- [ ] O) Breaking changes
- [ ] P) Test coverage
Mark each as: PASS / WARN / FAIL with a brief note.

## Statistics
- Blockers: <count>
- Major: <count>
- Minor: <count>
- Nits: <count>

## Action list (if changes requested)
Ordered by severity, then effort:
- [ ] BR-XXX: <short description>

## Positive observations
Note things done well — good patterns, clean code, thorough tests, etc.

6) Update `workflow/artifacts/features/$1/requirements.md`
- If requirements were NOT provided initially but you can now infer the feature's purpose from the code:
  - Write a "Requirements (inferred from code)" section.
  - Clearly mark these as inferred, not confirmed.
- If requirements WERE provided, leave them as-is.

7) Update `workflow/artifacts/features/$1/status.md`
- Phase: Branch Review Complete
- Last updated: today
- What I did last: "Completed branch review"
- Verdict: (from code-review.md)
- Stats: X blockers, Y major, Z minor, W nits
- Next action:
  - If APPROVE: "Ready to merge" or "Run /xl_code_cleanup $1 if formatting needed"
  - If CHANGES REQUESTED: "Address findings in code-review.md, then re-run /xl_branch_review $1"
  - If BLOCKER: "Critical issues must be resolved before merge"

Rules:
- Do NOT modify source code unless explicitly asked to fix something.
- Review only the diff against dev — do not review unchanged code.
- Cite exact file paths and line numbers for every finding.
- Be fair: note positive observations, not just problems.
- Do not invent issues — if something looks intentional and correct, leave it.
- If you are unsure about a finding, mark it as "Question" severity and explain your uncertainty.
- Keep findings actionable with concrete fix suggestions.
- If the diff is too large to review thoroughly in one pass, say so and recommend splitting into focused reviews per area.
