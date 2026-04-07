# App Architecture

## System context

- Single-page React application built with Vite
- 3D rendering via React Three Fiber (RTF) + Three.js — established as the core rendering stack
- Client-rendered frontend only — no backend integration
- Deployed to GitHub Pages via GitHub Actions on push to `master`
- Offline groundwork present (`public/manifest.webmanifest`) — full offline support deferred to a later ticket

## Current module layout

- `src/main.tsx` - application entry point and root render
- `src/App.tsx` - top-level screen composition
- `src/features/scene/GameScene.tsx` - Three.js canvas, camera, lights, and primary 3D object
- `src/features/scene/GameScene.styles.ts` - styled-components for the scene shell
- `src/index.css` - minimal global reset only
- `public/manifest.webmanifest` - web manifest (offline groundwork, not full offline)

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

- A test runner is not configured yet — lint and build are the minimum automated checks until a test runner is added.
- The 3D scene (`src/features/scene/`) is eagerly loaded from `src/App.tsx`. Consider lazy loading as the app grows.
- Global CSS is now a minimal reset only. New feature work should use `styled-components` and not expand global selectors.
- Full offline support (service worker / PWA) is deferred — the web manifest is groundwork only.

Sources: workflow/artifacts/archived/1/README.md