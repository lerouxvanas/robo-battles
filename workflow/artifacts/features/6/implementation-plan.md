# Implementation plan

## Goal

Restructure the voxel editor UI so the top summary bar is removed, controls from the current action and saved-model panels are consolidated into a single sidebar, and the 3D canvas expands to use all remaining space. The implementation should stay within the existing `src/features/voxel-editor/` feature boundary, preserve current editor behaviors, and be delivered in small UI iterations so feedback can shape later refinement passes.

## Scope recap

- In-scope:
	- Voxel editor layout restructuring in `src/features/voxel-editor/VoxelEditor.tsx`
	- MUI installation and styled-components engine setup needed to support the sidebar implementation
	- Search-and-update pass for rounded-corner usage within `src/features/voxel-editor/**`
	- Consolidation of existing controls into one sidebar surface
	- Canvas sizing and layout changes so the viewport uses remaining available space
	- Corner-radius normalization to `0` within the implemented ticket scope
	- Responsive behavior updates needed to keep the sidebar usable on smaller screens
- Out-of-scope:
	- New voxel editing tools or new persistence/export features
	- Data format or state schema changes
	- Non-editor UI surfaces unrelated to the voxel editor
	- Radius changes in files outside `src/features/voxel-editor/**` unless requirements are updated

## Approach (high level)

- Follow the existing feature-local pattern, but allow the minimum app-level setup needed to install MUI with the styled-components engine.
- Limit source edits to `src/features/voxel-editor/**`; search the full feature scope for `border-radius` usage, but do not extend the sweep into other app areas unless the ticket scope changes.
- Remove the current `HeaderCard` summary surface and reclaim that vertical space for the editor body.
- Replace the split action panel plus saved-model push panel layout with one sidebar that contains both action controls and saved-model management.
- Install MUI and configure it to use the styled-components engine, then move the sidebar implementation onto MUI primitives where it improves structure and scroll behavior.
- Rework the main layout grid so the canvas column is dominant and flexes to fill all remaining available width and height after the sidebar is laid out.
- Preserve the existing store-driven behavior (`useVoxelStore`) and event handlers, changing presentation and grouping before changing logic.
- For the first implementation pass, reuse the existing narrow-screen toggle pattern unless the sidebar can stack cleanly without hiding critical actions; avoid inventing a new mobile interaction model in this ticket.
- Normalize border radii to `0` only within the ticket scope and avoid unrelated style churn in other features.
- Implement in feedback-friendly passes: first structural layout, then sidebar organization and responsive behavior, then visual cleanup and zero-radius normalization.

## Work breakdown

### 1) Prep / research

- [ ] Confirm the current editor surfaces and control groups inside `src/features/voxel-editor/VoxelEditor.tsx`.
- [ ] Install and configure MUI with the styled-components engine for this Vite app.
- [ ] Search all occurrences of `border-radius` within `src/features/voxel-editor/**` and treat that result as the review checklist for the zero-radius pass.
- [ ] Confirm that files outside `src/features/voxel-editor/**` are excluded from the radius sweep unless the ticket scope changes.
- [ ] Use the existing narrow-screen toggle as the first-pass mobile/sidebar behavior unless a stacked sidebar layout can be applied cleanly without hiding actions.
- [ ] Capture any unresolved UI decisions during implementation as explicit feedback checkpoints instead of broadening scope.

### 2) Data / API / schema

- [ ] Endpoints/operations to add or update:
	- None. This ticket should reuse existing local handlers for save/load/export/undo/redo/clear and saved-model operations.
- [ ] Contract/schema considerations (if any):
	- None expected. No changes to persisted voxel JSON, GLB export, or browser-saved model structures.
- [ ] Error cases + retries/timeouts:
	- Preserve current load, persistence, and export error visibility after controls move into the sidebar.
	- Ensure hidden or collapsed states do not obscure critical error banners on smaller screens.
- [ ] Telemetry/logging (if relevant):
	- None planned.

### 3) UI / UX

- [ ] Components to create/update:
	- Update `VoxelEditor` layout container structure.
	- Update app-level theme/provider wiring if needed for MUI usage.
	- Remove `HeaderCard`, `SummaryGrid`, `SummaryCard`, and top-bar-only UI if no longer used.
	- Replace the custom sidebar shell with an MUI-based sidebar experience.
	- Add a desktop sidebar trigger / collapse pattern so the sidebar can be shown and hidden without changing the mobile interaction model.
	- Reorganize existing controls into clear sidebar sections: editor actions, current editing controls, saved-model management, and status/error messaging.
	- Update `CanvasCard` and `CanvasFrame` sizing rules so the 3D canvas fills remaining space.
- [ ] States: loading/empty/error/success
	- Keep loading state for browser saves.
	- Keep empty state for no saved models / no search matches.
	- Keep visible success/error messaging for save/load/export/persistence flows.
	- Ensure these states remain reachable after the sidebar consolidation.
- [ ] Validation rules:
	- Preserve existing validation for saved-model names and duplicate save handling.
	- Preserve search input behavior and inline rename validation.
- [ ] Accessibility / i18n considerations:
	- Maintain semantic button/input structure and keyboard access for moved controls.
	- Preserve `aria-live` messaging for notices and errors.
	- Keep sidebar toggle labels clear if a collapsible mobile pattern remains.
	- No i18n work is planned, but avoid baking layout assumptions that break longer strings.

### 4) State management / side effects (if relevant)

- [ ] Keep `useVoxelStore` as the source of truth for tool, color, saved models, persistence, and undo/redo state.
- [ ] Reuse current event handlers where possible and avoid introducing duplicate UI state for data already in the store.
- [ ] Reduce or remove panel-open state if the new sidebar structure makes some existing toggles unnecessary.
- [ ] Verify canvas-preview and orbit-control behavior remain unaffected by layout changes.

### 5) Testing

- Unit:
	- [ ] No unit-test runner is currently configured; record this as a tooling gap if no automated component tests are added.
- Integration:
	- [ ] Manually verify save JSON, load JSON, export GLB, undo, redo, clear scene, save model, load model, rename model, delete model, and search flows after the layout update.
	- [ ] Verify persistence and load errors still surface visibly inside the updated sidebar.
	- [ ] Verify the canvas continues to support placement, removal, preview, and orbit controls.
- Automated checks:
	- [ ] Run `npm run lint` after the UI refactor is complete.
	- [ ] Run `npm run build` after the UI refactor is complete.
- E2E (Playwright):
	- [ ] None planned because test tooling is not installed.
- Test data setup / fixtures:
	- [ ] Prepare at least one saved-model list with multiple entries to validate scrolling, search, and rename interactions.
	- [ ] Prepare an invalid JSON file to confirm load-error behavior still works.

### 6) Rollout

- [ ] Feature flag (yes/no):
	- No. This is a direct UI update in a local-only app.
- [ ] Backwards compatibility:
	- Existing editor behaviors and browser-saved models must continue to work unchanged.
- [ ] Migration notes (if any):
	- None expected.

## Acceptance criteria mapping

- Acceptance criterion: The top summary bar is removed from the voxel editor UI.
	- Planned change(s): Remove the header summary surface and associated styled blocks from `src/features/voxel-editor/VoxelEditor.tsx`.
	- Test(s) that prove it: Manual visual verification that the editor loads without the top summary bar and that reclaimed space is used by the main layout.

- Acceptance criterion: A sidebar exists and acts as the primary location for editor controls.
	- Planned change(s): Consolidate action controls and model-management controls into one sidebar structure in `src/features/voxel-editor/VoxelEditor.tsx`.
	- Test(s) that prove it: Manual verification that editor actions and model-management inputs are reachable from the sidebar in desktop and narrow-screen layouts.

- Acceptance criterion: Controls currently split across the action panel and saved-models panel are available from the sidebar.
	- Planned change(s): Move saved-model inputs/listing and action buttons into shared sidebar sections; remove redundant split-panel presentation.
	- Test(s) that prove it: Manual verification of save/load/export/undo/redo/clear plus save-model/search/rename/delete from the sidebar.

- Acceptance criterion: The 3D canvas occupies all remaining available space after the sidebar layout is applied.
	- Planned change(s): Rework the outer layout grid/flex sizing so the canvas column expands to remaining space and the canvas frame fills its container height.
	- Test(s) that prove it: Manual verification on desktop and smaller viewports that the canvas stretches to remaining width/height without unused editor gaps.

- Acceptance criterion: Rounded corners in the implemented ticket scope are changed to a radius of `0`.
	- Planned change(s): Search `src/features/voxel-editor/**` for all `border-radius` usage, update voxel-editor scoped styled-components to use `border-radius: 0`, and keep files outside that feature scope unchanged.
	- Test(s) that prove it: Manual visual review of the updated voxel editor surfaces, buttons, inputs, panels, banners, and canvas frame.

- Acceptance criterion: Existing save, load, export, undo, redo, clear-scene, and saved-model management flows remain functional after the layout change.
	- Planned change(s): Keep existing handlers and store actions intact while only relocating their controls.
	- Test(s) that prove it: Manual smoke test of each existing control flow and state message after the sidebar refactor.

## Risks & mitigations

- Risk: Consolidating multiple panels into one sidebar creates a crowded UI.
	- Mitigation: Implement the first pass with clear section groupings and use the planned feedback iteration to tune density before polishing.

- Risk: Canvas sizing regressions could reduce usable editor space on some viewports.
	- Mitigation: Prioritize layout simplification first and manually validate desktop and narrow-screen sizing before visual cleanup.

- Risk: Removing rounded corners may make interactive elements harder to visually parse.
	- Mitigation: Preserve contrast, spacing, borders, and section hierarchy so flat corners do not collapse affordance.

- Risk: Mobile sidebar behavior remains ambiguous.
	- Mitigation: Keep the first implementation small, reuse the current toggle pattern if needed, and validate it in the first feedback pass.

## Open questions

- Should the zero-radius rule apply only to `src/features/voxel-editor/**`, or should later tickets normalize other legacy surfaces too?
- Should the desktop sidebar always remain visible after the refactor, or should it remain collapsible?
- Should the narrow-screen experience keep a floating toggle, or should the sidebar stack above/below the canvas in the first iteration?
- Are there specific sidebar section priorities or ordering preferences the user wants after the first layout pass?