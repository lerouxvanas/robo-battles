# App Architecture

## System context

- Single-page React application built with Vite
- Client-rendered frontend only at the moment
- No backend integration is established yet

## Current module layout

- `src/main.tsx` - application entry point and root render
- `src/App.tsx` - current top-level screen composition
- `src/assets/` - static assets used by the UI
- `src/*.css` - legacy/global styling still present from the starter app

## Target application shape

As the app grows, prefer feature-oriented folders under `src/` instead of keeping all UI at the root.

Suggested direction:
- `src/features/<feature>/` for feature-specific UI and logic
- `src/components/` for shared presentational building blocks
- `src/lib/` for framework-agnostic helpers
- `src/styles/` only for truly global styles or tokens

## Core concerns

- UI composition: React function components
- Local state: component state first, lift only when coordination is real
- Styling: `styled-components` is the default choice for new UI work
- Data: no app-wide API layer yet; keep future data access isolated behind feature-level modules
- Routing: not present yet
- Auth: not present yet

## Boundaries

- Keep browser and API side effects out of render paths
- Keep feature logic close to the feature until reuse is proven
- Avoid creating app-wide state, service layers, or utility frameworks without a concrete need

## How to add a new feature

1. Create a ticket artifact folder under `workflow/artifacts/features/<ticket>/`.
2. Define requirements and scope lock before coding.
3. Add or extend a feature folder in `src/features/<feature>/` when the work is more than a trivial one-file change.
4. Put shared UI in `src/components/` only if at least two features need it.
5. Put reusable non-UI helpers in `src/lib/`.
6. Add unit tests for new logic or non-trivial component behavior once test tooling is in place.

## Near-term architecture notes

- The repo still contains the Vite starter shape.
- A test runner is not configured yet.
- Global CSS exists today, but new feature work should not deepen reliance on broad global selectors when `styled-components` can keep styles closer to components.