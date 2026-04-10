# Implementation plan

## Goal

Add browser-only persistence to the existing voxel editor so a single local user can save named voxel models, browse them in a collapsible side panel, load/rename/delete them, search the saved list, and recover the current working model automatically after refresh. The implementation should extend the current `src/features/voxel-editor/` feature with the smallest viable set of UI and state changes, keep side effects out of render paths, and fail visibly when browser storage operations cannot complete.

## Scope recap

- In-scope:
	- Manual save of the current voxel model with a user-provided name
	- Browser-stored list of saved models with load, rename, delete, and search/filter
	- Collapsible side panel for saved models inside the current voxel editor UI
	- Autosave of the current working model during editing
	- Restore of the current working model after browser refresh
	- Visible error handling for storage quota or corrupted browser data
- Out-of-scope:
	- Backend or cloud persistence
	- Auth, user identity, or permissions
	- Multi-user or cross-device sync
	- External file import/export flows as part of this ticket

## Approach (high level)

- Extend the existing voxel editor shell in `src/features/voxel-editor/VoxelEditor.tsx` instead of adding a parallel screen, because the current app already centralizes voxel editing UI there.
- Extend the current Zustand store in `src/features/voxel-editor/useVoxelStore.ts` only where UI coordination is real: current draft state, save/load actions, selected saved model metadata, panel state, search text, and user-facing persistence errors.
- Add one plain TypeScript persistence helper inside `src/features/voxel-editor/` to isolate browser storage keys, serialization, parsing, and failure handling from React render logic; this is justified by the concrete need to manage both autosave and a named-saves collection safely.
- Keep browser storage key constants and persisted-record helpers in `src/features/voxel-editor/modelPersistence.ts`, and keep shared saved-model/editor types in `src/features/voxel-editor/types.ts` only when they are reused across the store and UI.
- Keep persistence browser-only by using `localStorage` or the equivalent synchronous browser storage API already available in the app, avoiding new dependencies unless implementation research proves a real gap.
- Follow the existing repo frontend pattern: local UI state first, typed state transitions, explicit loading/empty/error states, and no side effects during render.
- Reuse the existing styled-components approach already present in `VoxelEditor.tsx` for the side panel and save-management controls instead of introducing a new styling system.
- Implement the chosen UX decisions directly in the first version: duplicate names use a native browser confirm flow before overwrite, deleting the currently loaded named model is prevented, and storage failures show a visible error while keeping the current editor state unchanged.

## Work breakdown

### 1) Prep / research

- [ ] Confirm the current `VoxelEditor.tsx` sidebar structure and decide whether the saved-model panel should replace or extend the existing action/info sidebar layout.
- [ ] Confirm the current voxel JSON shape from `useVoxelStore.ts` so saved-model persistence reuses the existing voxel serialization format instead of introducing a second model schema.
- [ ] Decide and document stable browser storage keys for autosave state, saved model records, and any saved-model metadata index.

### 2) Data / API / schema

- [ ] Endpoints/operations to add or update: none; this ticket is browser-only and should not introduce API work.
- [ ] Contract/schema considerations (if any): define a feature-local saved-model record shape that includes at minimum `name`, `updatedAt`, and the voxel array payload needed to restore the editor.
- [ ] Keep browser storage key constants and persisted-record parsing logic in `src/features/voxel-editor/modelPersistence.ts`, and add shared saved-model types to `src/features/voxel-editor/types.ts` only if both store and UI consume them.
- [ ] Error cases + retries/timeouts: handle storage quota failures, JSON parse failures from corrupted saved data, duplicate-name save attempts, rename collisions, and blocked deletion of the currently loaded named model; no retry loop is needed because storage is synchronous and local.
- [ ] Telemetry/logging (if relevant): none planned; use visible in-app error states and status messaging instead of console logging.

### 3) UI / UX

- [ ] Components to create/update:
	- Update `src/features/voxel-editor/VoxelEditor.tsx`
	- Update `src/features/voxel-editor/useVoxelStore.ts`
	- Add a feature-local persistence helper such as `src/features/voxel-editor/modelPersistence.ts`
	- Add a small feature-local presentational component only if the saved-model list markup becomes too large to keep readable inside `VoxelEditor.tsx`
- [ ] States: loading/empty/error/success
	- Loading: initialize saved data from browser storage during startup without blocking first render longer than necessary
	- Empty: show a clear empty-state message when no saved models exist
	- Error: show visible errors for storage failures, corrupted saved data, duplicate names, and blocked deletion of the currently loaded model
	- Success: show confirmation/status text for save, load, rename, delete, and autosave restore outcomes
- [ ] Validation rules:
	- Manual save requires a non-empty name
	- Named saves must remain unique
	- Rename must reject empty or colliding names
	- Deletion must be blocked for the currently loaded named model
	- Search/filter should match against saved model names only
	- Duplicate-name saves should use native browser confirm before overwriting
- [ ] Accessibility / i18n considerations:
	- Use semantic buttons, form fields, and labels for save and search controls
	- Ensure the collapsible panel has an accessible toggle and clear focus order
	- Do not rely on color alone for save/error state communication
	- No i18n system exists yet, so use concise copy and avoid hard-coding complex text patterns that would be hard to externalize later

### 4) State management / side effects

- [ ] Initialize the store from browser persistence on app load, restoring the autosaved working model and the saved-model index safely.
- [ ] Add store actions for manual save, overwrite-confirmed save, load saved model, rename saved model, delete saved model, update search text, and toggle the saved-model panel.
- [ ] Keep autosave as an explicit synchronization effect driven by voxel-state changes rather than writing to browser storage during render.
- [ ] Track which named model is currently loaded so deletion can be prevented and the UI can communicate the active selection.
- [ ] Keep browser storage parsing and writes inside the persistence helper or explicit event/effect handlers so `VoxelEditor.tsx` remains mostly orchestration/UI code.

### 5) Testing

- Unit:
	- [ ] No test runner is currently configured; record this tooling gap if no automated tests are added during implementation.
	- [ ] If practical without new tooling, keep persistence parsing/serialization logic in a plain module that is easy to validate manually and later cover with tests.
- Integration:
	- [ ] Run `npm run lint` after the persistence flow is integrated.
	- [ ] Run `npm run build` after the UI/store changes are complete.
	- [ ] Verify the editor still loads and the existing voxel-editing interactions remain intact after persistence wiring.
- E2E (Playwright):
	- [ ] None planned; E2E tooling is not configured.
- Test data setup / fixtures:
	- [ ] Create at least two small named voxel models and one unsaved draft during manual validation.
	- [ ] Prepare one duplicate-name case and one browser-refresh restore case for manual verification.
	- [ ] Prepare one malformed browser-storage entry by editing the relevant `localStorage` key in browser devtools.
	- [ ] Prepare one storage-limit simulation by pre-filling `localStorage` from browser devtools until `setItem` fails, then attempt a save/autosave action.
- Manual validation:
	- [ ] Confirm the saved-model side panel can be expanded and collapsed.
	- [ ] Confirm manual save creates a named model entry.
	- [ ] Confirm duplicate-name save prompts for overwrite confirmation.
	- [ ] Confirm loading a saved model replaces the current editor scene with that model.
	- [ ] Confirm rename updates the saved-model entry and preserves uniqueness validation.
	- [ ] Confirm deleting a non-active saved model removes it from the list.
	- [ ] Confirm deleting the currently loaded named model is blocked with visible feedback.
	- [ ] Confirm search/filter narrows the saved-model list by name.
	- [ ] Confirm editing autosaves the current draft and a browser refresh restores it.
	- [ ] Confirm storage failure or corrupted saved data surfaces a visible error without corrupting the current editor state.
	- [ ] Confirm a malformed `localStorage` entry does not crash startup and the app surfaces a recoverable visible error.
	- [ ] Confirm simulated `localStorage` quota exhaustion surfaces a visible persistence error on save/autosave.

### 6) Rollout

- [ ] Feature flag (yes/no): no
- [ ] Backwards compatibility: existing JSON file save/load and GLB export flows should continue to work without behavioral regressions.
- [ ] Migration notes (if any): the browser may start storing local voxel drafts and saved models after deployment; no server-side migration is required.

## Acceptance criteria mapping

- A single local user can manually save the current voxel model from the editor.
	- Planned change(s): add a named save action and input flow in `VoxelEditor.tsx`, backed by a saved-model persistence action in `useVoxelStore.ts`.
	- Test(s) that prove it: manual save of the current scene creates an entry in the side panel and can be reloaded.
- The save flow requires a unique model name.
	- Planned change(s): validate names before save/rename and use overwrite confirmation when the name already exists.
	- Test(s) that prove it: duplicate save attempt produces confirmation instead of silently duplicating or overwriting.
- The app shows saved models in a collapsible side panel.
	- Planned change(s): extend the existing sidebar layout with a collapsible saved-model section or dedicated panel.
	- Test(s) that prove it: manual expand/collapse validation with empty and populated states.
- The user can load a previously saved model from the saved-model list.
	- Planned change(s): add load actions tied to saved-model entries and restore voxel state from browser storage.
	- Test(s) that prove it: save two models, load each one, and confirm the scene changes accordingly.
- The user can rename a saved model from the saved-model list.
	- Planned change(s): add rename UI and unique-name validation in the saved-model panel.
	- Test(s) that prove it: rename a saved model and confirm the list and later load behavior use the new name.
- The user can delete a saved model from the saved-model list.
	- Planned change(s): add delete controls for saved-model entries with protection for the currently loaded model.
	- Test(s) that prove it: delete an inactive model and confirm it is removed from storage and the UI list.
- The user can search or filter the saved-model list.
	- Planned change(s): add search text state and derived filtered list rendering in the panel.
	- Test(s) that prove it: manual search narrows the list based on partial name matches.
- The current working model is autosaved in browser storage during editing.
	- Planned change(s): add an effect or explicit synchronization path that persists the current voxel draft when editor state changes.
	- Test(s) that prove it: modify the scene, refresh, and confirm the draft is restored.
- Refreshing the browser restores the autosaved current working model.
	- Planned change(s): restore the autosaved draft during editor/store initialization.
	- Test(s) that prove it: manual refresh validation after unsaved edits.
- The feature works entirely in the browser with no backend dependency.
	- Planned change(s): keep all persistence in browser storage and avoid any network/API code.
	- Test(s) that prove it: code inspection plus manual validation without backend setup.

## Risks & mitigations

- Risk: adding persistence concerns directly into the existing store could make the voxel editor state harder to reason about.
	- Mitigation: isolate browser storage serialization and key management in one plain TypeScript helper while keeping only coordination state in the store.
- Risk: autosave could overwrite a user’s expectations around named saves.
	- Mitigation: keep autosaved draft separate from the named saved-model list and label the active named model clearly in the UI.
- Risk: browser storage failures or corrupted saved data could break editor startup.
	- Mitigation: guard parsing, keep the current in-memory state unchanged on failure, and surface visible error messaging.
- Risk: adding side-panel controls could crowd the current editor sidebar.
	- Mitigation: use a collapsible panel and only extract a subcomponent if the existing file becomes too dense.

## Open questions

- None currently.

## Plan change log

- 2026-04-08
	- What tasks were added/changed: Specified the home for storage key constants and shared saved-model types, committed overwrite handling to native browser confirm, and added concrete manual validation steps for malformed browser data and simulated storage-limit failures.
	- Why: The plan review required concrete scope, behavior, and validation details before implementation can begin.