# Feature 3 — Decisions

<!-- ADR-lite format. Add one entry per significant decision. -->

## Decision Log

### [2026-04-07] vite-plugin-pwa installed with --legacy-peer-deps

**Context:** `vite-plugin-pwa@1.2.0` declares peer support for `vite@^3–7` but not `^8`. The project uses `vite@8`.

**Decision:** Install with `--legacy-peer-deps`. Vite 8 is API-compatible with 7 for plugin purposes — the peer dep boundary is a semver declaration lag, not a functional incompatibility.

**Consequences:** If a future `vite-plugin-pwa` release breaks Vite 8 compatibility for real, the install command will need to be revisited. Revisit when upgrading either package.

### [YYYY-MM-DD] Decision title

**Context:** What situation prompted this decision?

**Decision:** What was decided?

**Rationale:** Why?

**Consequences:** What does this enable or constrain going forward?
