# Feature 4 - Requirements

## Problem

The project needs a browser-based voxel editor inside the existing React Three Fiber app so voxel assets can be created, iterated on, and exported without relying on an external backend or separate desktop tooling. The editor should support basic voxel authoring, working-format persistence, and export to a runtime-friendly 3D asset format that can be loaded back into the app.

## Goals

- Add a web-based voxel editor to the app.
- Allow placing and removing flat-shaded colored cubes on a 3D grid.
- Allow saving and loading scenes as JSON as the working format.
- Allow exporting scenes as GLTF/GLB for later use in React Three Fiber via `useGLTF`.
- Keep the entire workflow browser-only with no backend requirement.

## Non-goals

- Backend storage, authentication, or multi-user collaboration.
- Non-voxel mesh editing or sculpting workflows.
- Advanced scene management beyond voxel authoring, save/load, and export.
- Performance optimizations beyond what is needed for an initial working editor, except where explicitly noted for larger models.

## User / Business Value

The developer can build 3D voxel assets directly inside the app and reuse them immediately in the same project. This reduces iteration time, avoids external tooling for simple asset creation, and creates an in-browser content pipeline for future game assets.

## Acceptance Criteria

- [ ] A voxel editor is available inside the React Three Fiber app.
- [ ] The user can place flat-shaded colored cubes on an integer-aligned 3D grid.
- [ ] The user can remove placed voxels.
- [ ] Clicking a voxel face with the place tool adds a voxel adjacent to the clicked face.
- [ ] A ghost cursor previews where the next voxel will be placed.
- [ ] The user can save the current voxel scene to JSON.
- [ ] The user can load a previously saved voxel scene from JSON.
- [ ] The user can export the current voxel scene to GLTF/GLB.
- [ ] The exported GLTF/GLB is suitable for later loading in React Three Fiber with `useGLTF`.
- [ ] The feature runs entirely in the browser with no backend dependency.

## Constraints

- Build the editor within the existing React Three Fiber application.
- Surface the voxel editor as the default app screen for this ticket.
- Use `react`, `react-dom`, `@react-three/fiber`, `@react-three/drei`, and `three`.
- Add `leva` for the editor UI panel if it is not already installed.
- Use Zustand for voxel state management; add it if it is not already installed.
- Store voxels on integer grid coordinates where one voxel equals one Three.js unit.
- Use JSON as the working save/load format.
- Export GLTF/GLB via `THREE.GLTFExporter`.
- Prefer click-based editing interactions so OrbitControls drag behavior does not conflict with place/remove actions.
- Invalid JSON imports should show a visible in-app error state in the initial version.

## Edge Cases

- Re-placing a voxel at an occupied coordinate must overwrite or deduplicate by the coordinate-based id rather than create duplicates.
- Clicking a voxel face for placement must use the clicked face normal so the new voxel is placed on the correct adjacent cell.
- Dragging OrbitControls should not accidentally place or remove voxels.
- Loading invalid or malformed JSON should fail safely rather than corrupt editor state.
- Large voxel models may require `InstancedMesh` later for performance, but that optimization is not required for the initial version.

## Open Questions

- None currently.

---

## Scope Lock

### In scope

- Implement the voxel editor under `src/features/voxel-editor/` to align with the repo's feature-folder structure.
- Add voxel placement, removal, ghost cursor preview, save/load JSON, and GLTF/GLB export.
- Add the editor control panel with `leva`.
- Add the Zustand store and shared voxel types.
- Integrate the editor into the existing app so it can be used in the browser.

### Out of scope

- Backend services or server persistence.
- Multi-user editing.
- Non-voxel modeling workflows.
- Final performance optimization work such as instancing unless required to make the feature functional.
- Additional game/editor systems beyond voxel creation, persistence, and export.

### Allowed edit paths

- `src/`
- `package.json`
- lockfile/package manager files if dependencies are added

### Boundary notes

- Frontend/browser-only feature.
- Keep the implementation focused on a working voxel editor and export pipeline, not broader game architecture changes.

## Notes

- Requested source structure:
	- `src/features/voxel-editor/VoxelEditor.tsx`
	- `src/features/voxel-editor/useVoxelStore.ts`
	- `src/features/voxel-editor/VoxelGrid.tsx`
	- `src/features/voxel-editor/VoxelCursor.tsx`
	- `src/features/voxel-editor/GroundPlane.tsx`
	- `src/features/voxel-editor/exportGLTF.ts`
	- `src/features/voxel-editor/types.ts`
- Requested stack additions if missing: `leva`, `zustand`.

## Change log

- 2026-04-08
	- What changed: Resolved the open planning questions by making the voxel editor the default app screen, requiring a visible invalid-JSON error UI, and aligning the requested module path to `src/features/voxel-editor/`.
	- Why: The plan review flagged requirements/plan mismatch and folder-structure misalignment with the repo architecture guidance.