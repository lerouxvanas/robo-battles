# Coding Standards

## General defaults

- Prefer the smallest change that satisfies the requirement.
- Reuse existing local patterns before introducing new abstractions.
- Keep feature work understandable without tracing through many files.
- Favor explicit code over clever indirection.

## TypeScript

- Keep `strict` mode clean.
- Type component props, public helpers, and non-trivial return values.
- Avoid `any`; if unavoidable, isolate it and document why in the ticket artifacts.
- Prefer derived values over duplicating state.

## Project structure

- For small changes, editing existing files is fine.
- For growing features, prefer `src/features/<feature>/`.
- Put shared building blocks in `src/components/` only when reuse is real.
- Put framework-agnostic helpers in `src/lib/`.

## React

- Use function components.
- Keep render paths pure.
- Use effects only for external synchronization such as network calls, browser APIs, timers, or subscriptions.
- Clean up listeners, timers, and async work started by an effect.
- Avoid mirroring props into state unless creating a deliberate editable local draft.

## Styling

- Default to `styled-components` for new component-level styling.
- Keep global CSS limited to app-wide resets, tokens, and truly global layout rules.
- Prefer styles that live close to the component they affect.
- Avoid mixing multiple styling approaches inside the same feature without a clear reason.

## Error handling and logging

- Fail visibly for user-facing operations; do not swallow errors silently.
- Prefer clear empty, loading, and error states over placeholder hacks.
- Keep console logging out of committed production code unless it is intentional instrumentation.

## UI patterns

- Prefer simple component composition over large configurable mega-components.
- Build explicit loading, empty, success, and error states for non-trivial async UI.
- Keep accessibility intact for interactive elements: semantic HTML, visible focus, keyboard access.
- Use the documented pattern under `workflow/artifacts/patterns/react.md` as the default frontend baseline.

## Forms and dialogs

- Keep form state local until broader reuse is justified.
- Validate close to the user interaction.
- Use dialogs sparingly; prefer inline flows when they reduce friction.

## Testing

- Unit tests are expected for non-trivial logic and component behavior.
- If automated tests are not possible because tooling is missing, record the gap explicitly in the ticket artifacts.
- Until test tooling is installed, lint and build remain the minimum required checks.

## Review expectations

- This is currently a lightweight solo-project workflow.
- Reviews should focus on correctness, maintainability, and user-facing regressions rather than process overhead.
- Use concise findings with concrete fixes when review artifacts are needed.

## Avoid

- Premature shared state or service layers
- New abstractions justified only by hypothetical reuse
- Large refactors mixed into unrelated feature work
- Heavy reliance on broad global CSS selectors for new features
- Hidden side effects in render logic