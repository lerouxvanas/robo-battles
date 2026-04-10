# Requirements

## Problem

The current voxel editor layout wastes usable workspace and splits important controls across multiple surfaces. The top bar consumes vertical space without providing enough practical value, the side-panel controls are fragmented, and the 3D canvas does not fully dominate the available layout. The interface should be simplified so editing controls are consolidated into a sidebar and the canvas uses all remaining space.

## Goals

- Remove the top bar from the voxel editor layout.
- Implement a sidebar as the primary control surface.
- Move controls from both existing side panels into the sidebar.
- Ensure the 3D canvas expands to fill all remaining available space.
- Replace rounded corners with a corner radius of `0` in the affected UI.

## Non-Goals

- No new voxel editing features beyond reorganizing existing controls.
- No changes to persistence behavior, save/load logic, or export formats.
- No gameplay or rendering-system changes beyond layout and presentation.

## User / Business Value

- Users get a larger and more focused editing surface.
- Core actions become easier to find because controls are consolidated.
- The interface becomes visually more intentional and space-efficient.

## Acceptance Criteria

- [ ] The top summary bar is removed from the voxel editor UI.
- [ ] A sidebar exists and acts as the primary location for editor controls.
- [ ] Controls currently split across the action panel and saved-models panel are available from the sidebar.
- [ ] The 3D canvas occupies all remaining available space after the sidebar layout is applied.
- [ ] Rounded corners in the implemented ticket scope are changed to a radius of `0`.
- [ ] Existing save, load, export, undo, redo, clear-scene, and saved-model management flows remain functional after the layout change.

## Constraints

- Keep the change focused on UI and UX restructuring for the current editor experience.
- Reuse existing editor behaviors and state management instead of introducing new workflows unless needed to support the sidebar.
- Preserve responsive usability so the layout still works on narrower screens.
- Expect multiple implementation iterations with user feedback between passes.

## Edge Cases

- Narrow viewports still need access to all controls without hiding critical actions behind unusable layouts.
- The sidebar must handle long saved-model lists and search/filter states.
- Canvas sizing must remain correct when panels are shown, hidden, or collapsed.
- Empty saved-model states, persistence errors, and load errors must remain visible and understandable.

## Open Questions

- Does the radius reset apply only to the voxel editor surfaces in scope, or to every currently unused UI file in the repo as well?
- Should the sidebar always remain visible on desktop, or can it still be collapsible?
- Should the current floating mobile action toggle remain, or should mobile use a different sidebar access pattern?

## Scope Lock

### In Scope

- Voxel editor layout restructuring.
- Sidebar-based consolidation of existing controls.
- Canvas sizing changes so the editor viewport uses the remaining space.
- Corner-radius normalization to `0` within the implemented ticket scope.

### Out of Scope

- New editor tools or new data-management features.
- Changes to voxel data format, persistence schema, or GLB export behavior.
- Non-editor feature work unrelated to the requested UI/UX update.

### Allowed Edit Paths

- `src/features/voxel-editor/**`
- `src/App.tsx`
- Shared styling files only if required to enforce the no-rounded-corners rule within the implemented scope.

### Boundary Notes

- This ticket is frontend-only.
- Source changes should focus on layout, styling, and reorganization of existing controls rather than new functionality.

## Notes

- User clarified that the 3D canvas should take up all the space available.
- User expects the UI implementation to be refined over several feedback-driven iterations.