# Feature 5 - Requirements

## Problem

The voxel editor currently lacks an in-browser persistence workflow for working models. A user needs to be able to save models, reload them later, manage the saved list in the UI, and retain the current working model across browser refreshes without relying on a backend.

## Goals

- Add browser-based model persistence to the voxel editor.
- Let the user save the current model with a unique name.
- Let the user load, rename, search, and delete saved models from the app UI.
- Autosave the current working model so it is restored after refresh.
- Show saved models in a collapsible side panel that fits the existing editor UX.

## Non-goals

- Cloud or backend persistence.
- User accounts or authentication.
- Multi-user collaboration.
- Cross-device sync.
- File import/export flows outside the browser-stored saved-model list.

## User / Business Value

The app becomes usable as a lightweight in-browser modeling tool instead of a session-only editor. A single local user can keep a working model between refreshes, maintain a library of saved models, and switch between them without leaving the editor.

## Acceptance Criteria

- [ ] A single local user can manually save the current voxel model from the editor.
- [ ] The save flow requires a unique model name.
- [ ] The app shows saved models in a collapsible side panel.
- [ ] The user can load a previously saved model from the saved-model list.
- [ ] The user can rename a saved model from the saved-model list.
- [ ] The user can delete a saved model from the saved-model list.
- [ ] The user can search or filter the saved-model list.
- [ ] The current working model is autosaved in browser storage during editing.
- [ ] Refreshing the browser restores the autosaved current working model.
- [ ] The feature works entirely in the browser with no backend dependency.

## Constraints

- Browser-only persistence.
- No backend changes.
- The feature must fit the existing voxel editor UX.
- Duplicate-name saves should ask for overwrite confirmation in the first version.
- Deleting the currently loaded named model should be blocked in the first version.
- Storage failures or corrupted saved data must show visible feedback and leave the current in-memory editor state unchanged.

## Edge Cases

- Storage quota can be exceeded while saving or autosaving.
- Deleting the currently loaded named model must be blocked with visible feedback.
- Refresh during an unfinished edit session must still preserve the current working model via autosave.
- Model names must be unique.
- The empty state where no saved models exist must be handled in the side panel.
- Corrupted browser-stored draft data or saved-model data must not crash startup or replace a valid in-memory scene.

## Open Questions

- None currently.

## Scope Lock

### In scope

- Add manual save for the current voxel model.
- Add load, rename, delete, and search/filter for saved models.
- Add a collapsible side panel that displays saved models.
- Add autosave for the current working model.
- Restore the current working model after browser refresh.
- Keep persistence limited to browser-stored saved models.

### Out of scope

- Backend or cloud persistence.
- User identity, auth, or permissions.
- Multi-user collaboration.
- Cross-device sync.
- External file import/export flows as part of this ticket.

### Allowed edit paths

- `src/features/voxel-editor/`

### Boundary notes

- Frontend-only feature.
- No backend work.
- Requirements gathered from user input on 2026-04-08.

## Change log

- 2026-04-08
	- What changed: Replaced the vague edit boundary with the concrete `src/features/voxel-editor/` path and recorded the chosen first-pass behaviors for overwrite confirmation, blocking deletion of the currently loaded named model, and visible storage-failure handling.
	- Why: The plan review found the scope lock too vague and the requirements artifact out of sync with the implementation plan.