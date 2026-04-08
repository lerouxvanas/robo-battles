# Code review — Ticket 4

## Summary
- Verdict: ⚠️ Changes requested
- Key areas reviewed:
	- React state/effect usage in the voxel editor shell
	- Scene interaction correctness for place/remove/orbit behavior
	- GLB export lifecycle and client-side resource handling
	- Validation and test coverage against the ticket acceptance criteria
- Overall notes:
	- The feature is structured in the right place and generally follows the repo’s feature-folder and styled-components guidance.
	- The store and export utility are justified by the current feature scope rather than speculative reuse.
	- Lint/build are green, but the review found one correctness risk in the editing interaction path and one export-path memory concern.
	- Core interactive acceptance criteria are still unproven because the recorded manual checklist remains incomplete and there is no automated coverage for the non-trivial store/export logic.

## Findings

- Severity: Major
	File(s): src/features/voxel-editor/VoxelEditor.tsx:161, src/features/voxel-editor/VoxelEditor.tsx:178, src/features/voxel-editor/GroundPlane.tsx:31, src/features/voxel-editor/VoxelGrid.tsx:38
	What: Placement and removal are wired directly to scene `onClick` handlers while `OrbitControls` stays active at the same time, but there is no drag-threshold or "camera is orbiting" guard before mutating voxel state.
	Why it matters: The requirements explicitly call out that orbit drag behavior must not conflict with place/remove actions. In the current setup, a drag that ends over the same intersection target can still produce a click-driven mutation, so users can accidentally add or remove voxels while trying to move the camera.
	Suggested fix: Track whether controls moved between pointer down and click, or temporarily suppress edit commits while orbiting is active. Only allow `onPlace`/`onRemove` when the pointer interaction stayed below a small movement threshold.

- Severity: Minor
	File(s): src/features/voxel-editor/exportGLTF.ts:12, src/features/voxel-editor/exportGLTF.ts:70
	What: The GLB smoke-check reparses every exported file through `GLTFLoader`, but the parsed scene/resources are never disposed after validation.
	Why it matters: Export is a repeatable editor action. Repeated parse-and-discard cycles can accumulate geometry/material memory in the browser session even though the parsed result is only used as a validation probe.
	Suggested fix: In the validation success path, traverse the parsed scene and dispose geometries/materials/textures before resolving, or move the parse validation into a dedicated test-only path instead of the runtime export path.

- Severity: Major
	File(s): workflow/artifacts/features/4/status.md:31, workflow/artifacts/features/4/status.md:35, workflow/artifacts/features/4/status.md:79
	What: The ticket is marked as implementation-complete, but the manual checks for the core interaction criteria remain unchecked and there is still no automated test coverage for the non-trivial store/export logic.
	Why it matters: The most important acceptance criteria for this ticket are interactive browser behaviors: place, remove, adjacent placement, ghost cursor, JSON round-trip, invalid JSON protection, and GLB export. Those are the exact areas most likely to hide regressions, and they are not currently evidenced in the review record.
	Suggested fix: Complete the manual checklist before merge and add at least focused automated coverage for the store/export helpers once test tooling exists, or explicitly defer merge until the manual verification record is completed.

## React/frontend focus checks
- Hooks/effect cleanup:
	- Pass overall. No unbounded listeners, timers, or subscription leaks were introduced in React effects.
	- The two `useEffect` hooks in `src/features/voxel-editor/VoxelEditor.tsx` are synchronization effects only; they do not need cleanup.
- Memory leaks:
	- One concern in the export validation path: parsed GLB assets are not disposed after `GLTFLoader.parse` succeeds.
- Race conditions:
	- No severe async race was found in the JSON load/export handlers, but the review does not treat the current orbit/edit interaction conflict as resolved.
- Timers/workarounds:
	- Pass. No timers or animation-frame workarounds were added.
- React best practices:
	- Render paths are mostly pure and the feature stays self-contained.
	- State duplication between Leva’s control state and the Zustand store is acceptable for this ticket, but it would be worth simplifying later if more tool controls are added.

## Test coverage
- What exists:
	- `npm run lint`
	- `npm run build`
	- Local smoke launch recorded in the ticket status
- Gaps:
	- No automated unit/integration coverage for `useVoxelStore.ts` or `exportGLTF.ts`.
	- Manual acceptance checks in `status.md` are still incomplete for the core interaction flows.
	- The runtime GLB validation path is present, but the review record does not include an end-to-end proof that a downloaded export was actually loaded back through a consumer path.
- Recommended additions:
	- Add targeted tests for voxel JSON parsing/deduplication and export preconditions once test tooling is available.
	- Finish the manual verification checklist before merge, especially place/remove/orbit conflict, JSON round-trip, invalid JSON retention, and GLB export/download behavior.

## Action list (if changes requested)
- [x] Prevent orbit camera drags from triggering place/remove mutations.
- [x] Dispose parsed GLB resources after runtime export validation, or move that validation out of the runtime path.
- [ ] Complete the remaining manual acceptance checks and update `status.md` with the results before merge.