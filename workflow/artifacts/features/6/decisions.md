# Decisions

## ADR Log

### 2026-04-09 - Use a shadcn-style collapsible pattern without adopting shadcn infrastructure

#### Decision

Implement the requested collapsible sidebar behavior using the existing `styled-components` approach in `src/features/voxel-editor/**` instead of adding shadcn/ui or Tailwind-based sidebar infrastructure.

#### Context

During implementation, the user clarified that the intended sidebar behavior should resemble the collapsible sidebar documented in shadcn's Radix sidebar docs. The current repo uses `styled-components` as its UI styling baseline and does not have the shadcn/Tailwind component pipeline in place.

#### Consequences

- The UI behavior can align more closely with the requested collapsible pattern without expanding this ticket into a styling-system migration.
- The implementation stays inside the current scope and edit paths.
- If the repo later adopts shadcn/ui broadly, this sidebar may be a candidate for future normalization.

### 2026-04-09 - Defer UI library adoption to a later ticket

#### Decision

Adopt a UI component library in a future ticket rather than inside ticket 6.

#### Context

The user confirmed that the project should install a UI library, but not as part of the current sidebar/layout ticket. Ticket 6 remains focused on the voxel-editor UI restructure and collapsible sidebar behavior.

#### Consequences

- Ticket 6 continues to use the existing `styled-components` stack.
- UI library setup, dependency selection, and component migration should be scoped and planned separately.
- The current sidebar implementation may be replaced or normalized later once the library decision is implemented repo-wide.

### 2026-04-09 - Adopt MUI with styled-components in ticket 6

#### Decision

Install MUI in the current ticket and configure it to use the styled-components engine.

#### Context

After reconsidering the shadcn direction, the user chose to proceed with a UI library that fits the repo's styled-components stack better. MUI supports this through the styled-components engine and can be adopted without moving the repo onto Tailwind.

#### Consequences

- Ticket 6 now includes minimal app-level dependency and theme setup for MUI.
- The voxel editor sidebar can be migrated from ad-hoc layout primitives to MUI components.
- Earlier decisions deferring UI library adoption are superseded by this one.