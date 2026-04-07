# Branch Review Agent (External Code Review)

Source of truth:
- Workflow config: `workflow/workflow.yaml`
- Artifacts root: `workflow/artifacts/`
- Ticket root: `workflow/artifacts/features/<ticket>/`
- Global standards:
  - workflow/artifacts/coding-standards.md
  - workflow/artifacts/app-architecture.md
  - workflow/artifacts/patterns/*

Purpose:
Perform a comprehensive code review on a branch developed by someone else. There is no prior workflow documentation. The agent scaffolds the artifact folder, diffs the branch against `dev`, and produces a thorough review document that can also serve as context for future work on the ticket.

Trigger:
- `/xl_branch_review <ticket> [title]`

Inputs:
- Ticket number (required)
- Optional: Jira ticket requirements (pasted or described by user)
- Optional: areas of concern, feature context
- Code changes: `git diff dev...HEAD`

Outputs:
- `workflow/artifacts/features/<ticket>/README.md` — ticket overview
- `workflow/artifacts/features/<ticket>/requirements.md` — provided or inferred requirements
- `workflow/artifacts/features/<ticket>/code-review.md` — full review with findings
- `workflow/artifacts/features/<ticket>/status.md` — review outcome and next steps
- `workflow/artifacts/features/<ticket>/decisions.md` — ADR template for future use
- `workflow/artifacts/features/README.md` — ensure active index includes ticket link

Review categories (all mandatory):
A) Hooks / effect cleanup — stale closures, incorrect dependency arrays, missing cleanup for listeners, timers, subscriptions, or async work
B) Memory leaks — retained listeners, long-lived timers, orphaned async work, growing collections
C) Race conditions — stale responses winning, overlapping requests, transition/loading mismatches
D) Timers / workarounds — setTimeout/setInterval as fixes, missing cleanup, timing-based UI coordination
E) Error handling — API failures, async error paths, silent swallowing
F) Type safety — any types, unsafe assertions, null/undefined handling
G) Rendering performance — unstable keys, heavy render-time work, avoidable re-renders, expensive derived values
H) State management — duplicated derived state, prop-to-state mirroring, hidden coupling across components
I) Security — dangerous HTML injection, unsafe URL handling, client-side trust assumptions
J) Accessibility — ARIA, keyboard navigation, focus management
K) Dead code & hygiene — unused imports/vars, console.log, commented code
L) Naming & conventions — codebase standards alignment
M) Circular dependencies — import chains, barrel files, deep imports
N) API / data-fetching patterns — loading/error/empty states, caching or invalidation strategy when relevant
O) Breaking changes — shared interfaces, component public API
P) Test coverage — existence, edge cases, mock quality

Finding severity levels:
- Blocker: will cause bugs, crashes, or data loss
- Major: significant issue that should be fixed before merge
- Minor: improvement that can be addressed in a follow-up
- Nit: style/preference, non-blocking

Rules:
- Review only the diff against dev.
- Cite exact file paths and line numbers.
- Note positive patterns, not just problems.
- Do not modify source code unless explicitly asked.
- Mark uncertain findings as "Question" severity.
- Provide concrete fix suggestions for every finding.
