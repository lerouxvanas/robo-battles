# Implementation Plan

## Goal

Set up the initial React Three Fiber baseline for the app, replace the starter content with a minimal 3D scene, and prepare the project for GitHub Pages deployment. This ticket should also establish an offline-ready direction for later work without implementing full offline behavior yet.

## Scope recap

- In-scope:
  - Install and configure the core React Three Fiber dependencies.
  - Replace the Vite starter UI with a minimal browser-rendered 3D scene.
  - Introduce the first feature-oriented scene module if that keeps the structure cleaner than continuing in `src/App.tsx`.
  - Add the GitHub Pages deployment workflow and any required Vite/static-hosting configuration.
  - Add minimal offline groundwork only, such as documenting or scaffolding the future approach without claiming full offline support.
- Out-of-scope:
  - Gameplay systems, persistence features, or backend work.
  - Advanced 3D systems such as physics, controls-heavy interactions, or asset pipelines unless strictly needed for the first visible scene.
  - Full offline caching/service-worker behavior.

## Approach

- Follow the documented React pattern and the repo architecture guidance: use React function components, keep render logic pure, and move beyond the starter layout in a way that supports future features.
- Because this ticket is more than a one-file edit, introduce the first feature folder under `src/features/scene/` for the 3D scene while keeping shared concerns local until reuse is proven.
- Use `styled-components` for any new component-level styling rather than deepening reliance on the existing starter CSS.
- Keep the first scene intentionally minimal: one scene component, a small set of 3D primitives/lights, and no premature game framework abstractions.
- Explicitly treat backend/API impact as not applicable; the material dependency impact is package installation, type availability, and build/deploy configuration.

### Affected files/components

- `package.json` - add 3D/runtime packages and any deployment/offline-groundwork dependencies
- `vite.config.ts` - add GitHub Pages/static-hosting configuration as needed
- `src/App.tsx` - replace starter shell with the new scene entry composition or delegate to a feature component
- `src/main.tsx` - update only if app-level providers or entry wiring become necessary
- `src/features/scene/GameScene.tsx` - new scene feature component
- `src/features/scene/GameScene.styles.ts` or equivalent - styled-components-based scene shell styling
- `public/` assets or manifest files - only if needed for deployment/offline groundwork
- `.github/workflows/` - GitHub Pages deployment workflow

## Work breakdown

### 1) Prep / research

- [ ] Confirm the chosen dependency set for the first scene baseline, likely including `@react-three/fiber` and supporting scene helpers only if they are justified.
- [ ] Confirm the minimal GitHub Pages hosting requirements for Vite in this repo.
- [ ] Decide the offline-groundwork artifact for this ticket, such as manifest/service-worker strategy notes or minimal setup, without implementing full offline behavior.

### 2) Data / API / schema

- [ ] Record that there is no backend, API, or schema contract impact in this ticket.
- [ ] Note any dependency/type additions and confirm they are compatible with the current React, Vite, and TypeScript setup.
- [ ] Record that test fixtures/mocks for API work are not applicable.

### 3) UI / UX

- [ ] Replace the starter Vite content with a minimal app shell focused on the first 3D scene.
- [ ] Create `src/features/scene/GameScene.tsx` to own the canvas, camera, lights, and one visible object.
- [ ] Add minimal scene-adjacent UI only if needed to explain loading/error/fallback states or provide a simple heading/shell.
- [ ] Use `styled-components` for any new shell styling instead of extending the starter CSS more than necessary.

### 4) State management / side effects

- [ ] Keep scene state local and minimal; avoid app-wide state or custom hooks unless a concrete issue appears.
- [ ] Add only the side effects required for deployment/offline groundwork, and keep them explicit and isolated from render logic.
- [ ] Avoid timers or workaround-based scene bootstrapping.

### 5) Testing

- [ ] Run `npm run lint` and `npm run build` after the feature changes.
- [ ] Document that unit-test tooling is not yet configured, so automated unit coverage is a known gap for this ticket unless adding test tooling becomes a necessary part of the setup.
- [ ] Manually verify that the scene renders locally in the browser with a visible object, light, and camera.
- [ ] Manually verify that the GitHub Pages configuration and workflow files are internally consistent.
- [ ] Manually verify that offline groundwork is present and does not falsely claim full offline capability.

### 6) Rollout

- [ ] Add GitHub Pages deployment workflow files and any supporting configuration needed for static hosting.
- [ ] Ensure Vite configuration supports GitHub Pages pathing if required.
- [ ] Defer full offline capability to a follow-up ticket, but leave a clear foundation that avoids rework.

## Acceptance criteria mapping

- AC: The project includes the core React Three Fiber libraries needed to render a 3D scene in React.
  - Planned changes: update `package.json` with the selected 3D dependencies.
  - Proving checks: dependency install succeeds; `npm run build` succeeds.
- AC: The application renders a basic 3D scene in the browser.
  - Planned changes: replace starter UI with the new scene entry and create `src/features/scene/GameScene.tsx`.
  - Proving checks: run the app locally and confirm the scene renders.
- AC: The basic scene includes, at minimum, a canvas, camera, lighting, and one visible object.
  - Planned changes: implement the minimal scene composition inside the scene feature component.
  - Proving checks: manual browser verification of the visible scene elements.
- AC: The app still works through the normal local development flow and production build flow.
  - Planned changes: keep changes compatible with existing Vite scripts and TypeScript config.
  - Proving checks: `npm run lint`, `npm run build`, local dev run.
- AC: The implementation does not introduce any backend dependency and stores data only in browser-based storage when persistence is needed.
  - Planned changes: no backend/API integration; no persistence layer introduced in this ticket.
  - Proving checks: code review of touched files; no backend packages or API modules added.
- AC: The project is prepared for static deployment to GitHub Pages, including deployment workflow files.
  - Planned changes: update `vite.config.ts` as needed and add `.github/workflows/` deployment automation.
  - Proving checks: workflow/config review and successful production build.
- AC: The project includes the groundwork needed for later offline support, but does not need to provide full offline behavior in this ticket.
  - Planned changes: add the chosen offline groundwork artifact and document the deferred full implementation.
  - Proving checks: verify the groundwork files/config exist and the ticket artifacts clearly record the limitation.

## Risks & mitigations

- Risk: React Three Fiber package selection could sprawl into unnecessary helper libraries.
  - Mitigation: start with the smallest dependency set that proves scene rendering and only add helpers with immediate use.
- Risk: GitHub Pages configuration can introduce pathing issues in production builds.
  - Mitigation: keep hosting configuration minimal and validate against the production build output.
- Risk: Offline groundwork may be mistaken for full offline support.
  - Mitigation: explicitly document the deferred full offline implementation in requirements, plan, and testing notes.
- Risk: Styling may remain split between legacy CSS and new component-scoped styles.
  - Mitigation: confine new styling to the new scene feature and avoid expanding global CSS unless necessary.

## Open questions

- Which optional helper libraries, if any, are worth adding in the first pass beyond the core React Three Fiber dependency?
- Should the offline groundwork be a minimal manifest/documented strategy only, or should it include a stub service-worker/PWA setup that is not yet treated as full support?

## Plan change log

- 2026-03-27
  - What tasks were added/changed: Replaced the template plan with a concrete file-level plan covering React Three Fiber setup, a minimal scene feature, GitHub Pages deployment workflow, and offline groundwork only.
  - Why: The initial plan review found that the plan was too generic to review or implement safely.