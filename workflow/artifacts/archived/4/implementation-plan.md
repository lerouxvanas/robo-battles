# Implementation plan

## Goal

Replace the current default scene screen with a browser-based voxel editor built into the existing React Three Fiber app. The editor should support placing and removing colored voxels on an integer grid, previewing placement with a ghost cursor, saving/loading JSON, exporting GLTF/GLB, and showing a visible first-pass error state when invalid JSON is loaded, all without any backend dependency.

## Scope recap

- In-scope:
	- Add a voxel editor as the default app screen
	- Add voxel placement, removal, face-adjacent placement, and ghost cursor preview
	- Add JSON save/load and visible invalid-JSON error handling
	- Add GLTF/GLB export through `THREE.GLTFExporter`
	- Add `leva` editor controls and Zustand-based voxel state
	- Implement the requested file structure under `src/features/voxel-editor/`
- Out-of-scope:
	- Backend persistence or collaboration
	- Non-voxel modeling tools
	- Broader game/editor navigation systems beyond replacing the current default screen
	- Advanced optimization such as `InstancedMesh` unless needed for baseline functionality

## Approach (high level)

- Replace the current `GameScene` default mount in `src/App.tsx` with a dedicated voxel editor root component because the requirement decision is to surface the editor as the default screen.
- Follow the existing feature-oriented architecture guidance by implementing the editor under `src/features/voxel-editor/` instead of expanding the legacy scene feature or creating a top-level exception folder.
- Keep state local to a single Zustand store for voxel data, selected tool, selected color, and load/error flow because the editor has a real coordination need across multiple components.
- Use React Three Fiber for scene rendering and keep interaction logic explicit in scene components rather than introducing speculative abstraction layers.
- Use `leva` for the editor control surface because it matches the requested feature scope and avoids building a larger custom editor panel than needed.
- Add a small export utility around `GLTFExporter` because GLTF/GLB export is a concrete feature requirement, not a hypothetical abstraction.
- Add a visible, minimal in-app JSON load error state in the editor root to satisfy the first-pass error handling requirement without overbuilding a notification system.
- Compute ghost cursor preview state from pointer intersections on the ground plane and voxel faces, keeping that preview logic explicit in the editor scene components.

## Work breakdown

### 1) Prep / research

- [ ] Add required dependencies if missing: `leva`, `zustand`, and `@react-three/drei`.
- [ ] Verify whether `three/examples/jsm/exporters/GLTFExporter` imports cleanly under the current Vite/TypeScript setup.
- [ ] Confirm whether the editor should fully replace the current `GameScene` mount in `src/App.tsx` for this ticket (current requirement decision: yes).

### 2) Data / API / schema

- [ ] Endpoints/operations to add or update: none.
- [ ] Contract/schema considerations (if any): define the working JSON shape as an array of `Voxel` entries with `id`, `x`, `y`, `z`, and `color`.
- [ ] Error cases + retries/timeouts: safely handle invalid or malformed JSON loads and prevent corrupted editor state.
- [ ] Telemetry/logging (if relevant): none planned; use visible UI error state rather than console-driven user feedback.

### 3) UI / UX

- [ ] Components to create/update:
	- Create `src/features/voxel-editor/VoxelEditor.tsx`
	- Create `src/features/voxel-editor/useVoxelStore.ts`
	- Create `src/features/voxel-editor/VoxelGrid.tsx`
	- Create `src/features/voxel-editor/VoxelCursor.tsx`
	- Create `src/features/voxel-editor/GroundPlane.tsx`
	- Create `src/features/voxel-editor/exportGLTF.ts`
	- Create `src/features/voxel-editor/types.ts`
	- Update `src/App.tsx`
- [ ] States: loading/empty/error/success
	- Loading: not required for initial synchronous voxel editing flows
	- Empty: render an empty grid/editor state with controls active
	- Error: render a visible JSON import error message when load fails
	- Success: show voxels in the scene and allow edit/export/save interactions
- [ ] Validation rules:
	- One voxel per integer coordinate id (`${x},${y},${z}`)
	- Clicking a voxel face with the place tool places a voxel in the adjacent cell using the clicked face normal
	- Ground-plane placement snaps to integer coordinates at y=0
	- Remove tool deletes the targeted voxel by id
	- Ghost cursor preview updates from hover intersections on the ground plane and voxel faces and reflects the next placement target
- [ ] Accessibility / i18n considerations:
	- Keep editor controls understandable with visible labels via `leva`
	- Provide visible text for JSON load errors
	- Keep any app-level wrapper semantic and avoid relying only on 3D scene affordances to communicate tool state

### 4) State management / side effects (if relevant)

- [ ] Implement a single Zustand store for voxels, selected tool, selected color, JSON serialization, JSON loading, and clear/reset actions.
- [ ] Keep file-input handling, download triggers, and GLTF export inside explicit event handlers rather than render logic.
- [ ] Track voxel cursor preview state close to the editor scene, updating it from pointer intersections on the ground plane and voxel faces.
- [ ] Keep orbit/click conflicts controlled by using click-driven mutations instead of pointer-down editing.

### 5) Testing

- Unit:
	- [ ] No test runner is configured; record this tooling gap if no automated unit tests are added
	- [ ] If practical, keep store logic simple and typed so it remains easy to validate manually without over-abstracting
- Integration:
	- [ ] Validate linting on changed files
	- [ ] Validate `npm run build`
	- [ ] Validate dependency installation/update path if new packages are added
- E2E (Playwright):
	- [ ] None planned; E2E tooling is not configured
- Test data setup / fixtures:
	- [ ] Create a small sample voxel scene during manual testing and verify it round-trips through JSON save/load
- Manual validation:
	- [ ] Confirm the voxel editor is the default app screen
	- [ ] Confirm ground click places voxels on the grid
	- [ ] Confirm clicking voxel faces places adjacent voxels correctly
	- [ ] Confirm remove mode deletes voxels
	- [ ] Confirm ghost cursor previews placement correctly on both the ground plane and voxel faces
	- [ ] Confirm JSON save downloads a valid file
	- [ ] Confirm valid JSON load restores voxels
	- [ ] Confirm invalid JSON load shows a visible UI error without corrupting existing editor state
	- [ ] Confirm GLTF/GLB export produces a downloadable file
	- [ ] Confirm the exported GLB can be smoke-tested in a lightweight `useGLTF` load path or equivalent validation step proving later R3F compatibility

### 6) Rollout

- [ ] Feature flag (yes/no): no
- [ ] Backwards compatibility: low risk; `src/App.tsx` default content changes from the current placeholder scene to the editor
- [ ] Migration notes (if any): none, beyond dependency installation and default-screen replacement

## Acceptance criteria mapping

- A voxel editor is available inside the React Three Fiber app.
	- Planned change(s): add `src/features/voxel-editor/VoxelEditor.tsx` and mount it from `src/App.tsx` as the default screen.
	- Test(s) that prove it: manual app launch verification plus production build.
- The user can place flat-shaded colored cubes on an integer-aligned 3D grid.
	- Planned change(s): implement grid placement via `GroundPlane.tsx`, `VoxelGrid.tsx`, and Zustand-backed voxel storage.
	- Test(s) that prove it: manual click placement validation.
- The user can remove placed voxels.
	- Planned change(s): implement remove mode in the store and voxel click handlers.
	- Test(s) that prove it: manual remove-mode validation.
- Clicking a voxel face with the place tool adds a voxel adjacent to the clicked face.
	- Planned change(s): use `e.face?.normal` in `VoxelGrid.tsx` to place adjacent voxels.
	- Test(s) that prove it: manual face-click validation across multiple voxel sides.
- A ghost cursor previews where the next voxel will be placed.
	- Planned change(s): implement `VoxelCursor.tsx` and wire pointer preview state from hover intersections on the ground plane and voxel faces.
	- Test(s) that prove it: manual hover/preview validation on empty ground and existing voxel surfaces.
- The user can save the current voxel scene to JSON.
	- Planned change(s): implement `toJSON()` in the store and a `Save JSON` download action in `VoxelEditor.tsx`.
	- Test(s) that prove it: manual file download and content check.
- The user can load a previously saved voxel scene from JSON.
	- Planned change(s): implement `loadJSON()` in the store and file-input handling in `VoxelEditor.tsx`.
	- Test(s) that prove it: manual round-trip save/load validation.
- The user can export the current voxel scene to GLTF/GLB.
	- Planned change(s): implement `exportGLTF.ts` using `GLTFExporter` and trigger downloads from the editor UI.
	- Test(s) that prove it: manual GLB download validation plus build validation.
- The exported GLTF/GLB is suitable for later loading in React Three Fiber with `useGLTF`.
	- Planned change(s): export scene meshes with color-grouped materials via `GLTFExporter` binary output.
	- Test(s) that prove it: inspect the exported file generation path, confirm a valid `.glb` is produced, and perform a lightweight smoke check that the file can be loaded through a later `useGLTF`-compatible path.
- The feature runs entirely in the browser with no backend dependency.
	- Planned change(s): keep state, file loading, saving, and export entirely client-side.
	- Test(s) that prove it: code review against scope and manual validation without any server feature dependency.

## Risks & mitigations

- Risk: adding multiple new packages could introduce install or type issues.
	- Mitigation: add only the required dependencies and validate with lint/build immediately.
- Risk: pointer interaction between voxel editing and `OrbitControls` could feel unreliable.
	- Mitigation: keep mutations on click rather than pointer down and validate drag-versus-click behavior manually.
- Risk: JSON load failures could silently break state.
	- Mitigation: add visible error handling and keep existing voxel state unchanged when parsing fails.
- Risk: GLTF export may work technically but create unnecessarily heavy output for large scenes.
	- Mitigation: keep the first version simple and record instancing as a later optimization rather than overcomplicating the initial implementation.

## Open questions

- No blocking questions remain for implementation planning.

## Plan change log

- 2026-04-08
	- What tasks were added/changed: Moved the planned feature path to `src/features/voxel-editor/`, specified ghost cursor preview sourcing from pointer intersections, and strengthened the GLB export proof with a later `useGLTF`-compatibility smoke check.
	- Why: The prior plan review flagged architecture-path alignment, underspecified cursor behavior, and insufficient proof for the GLB export acceptance criterion.