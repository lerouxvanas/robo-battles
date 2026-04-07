# Plan Review — Ticket 2

## Summary

- **Verdict: ✅ Ready to implement**
- Top concerns (minor — no blockers):
  1. Concurrency config says "cancel in-progress deploys" but GitHub recommends `cancel-in-progress: false` for Pages to avoid partially-deployed states.
  2. The "deliberate lint error" test is described on "a scratch branch" but the workflow only triggers on `master` — test description needs adjustment.
  3. Action versions (`upload-pages-artifact@v3`) should be verified against current releases at implementation time.

---

## Requirements coverage

All 6 acceptance criteria are mapped in the plan. No gaps.

| AC | Mapped? | Notes |
|---|---|---|
| Push to `master` triggers workflow | ✅ | `on: push: branches: [master]` |
| `npm ci` → lint → build | ✅ | Explicit build job steps |
| `dist/` deployed, failed build blocks deploy | ✅ | `needs: build` + artifact upload |
| Site reachable at Pages URL | ✅ | `deploy-pages` action + manual test step |
| Assets load without 404s | ✅ | Base path logic verified in `vite.config.ts` |
| Failed build prevents deploy | ✅ | Covered by `needs:` dependency |

---

## Scope lock check

- `## Scope Lock` is present in `requirements.md` ✅
- In scope: `.github/workflows/` ✅
- Out of scope: source code, backend, custom domain ✅
- Allowed edit paths: explicit ✅
- Boundary notes: frontend-only, no `src/` changes ✅

**Verdict impact:** None — scope lock is complete and clear.

---

## Plan completeness checklist

- [x] Affected files are explicit (`deploy.yml` only)
- [x] No new helpers/services/abstractions introduced
- [x] No API/schema/type impact
- [x] No bugfix (not applicable)
- [x] Build failure prevents deploy (via `needs:`)
- [x] Manual pre-flight step identified (repo settings)
- [x] Existing `vite.config.ts` base path logic verified before the plan was written

**Verdict impact:** None — plan is complete.

---

## Technical approach sanity check

**Correctness risks:**
- `configure-pages` is placed in the `build` job. The plan assigns `pages: write` + `id-token: write` only to the `deploy` job. This is fine — `configure-pages` is read-only metadata gathering and does not require write permissions. No issue.
- `GITHUB_REPOSITORY` is set automatically by GitHub Actions as `owner/repo` — confirmed to work with the `split('/')[1]` logic in `vite.config.ts`. No issue.

**Complexity risks:** None — single file, linear job dependency.

**Maintainability risks:** Low. Standard GitHub Actions pattern; well-understood by the ecosystem.

**Performance risks:** None meaningful. `npm ci` with cache will keep install times short.

**Security/permissions risks:**
- `id-token: write` is correctly scoped to the `deploy` job only, which is the right least-privilege approach. ✅
- No secrets are exposed. ✅

---

## Architecture / standards alignment

- No source code changes — cannot conflict with `app-architecture.md` or `coding-standards.md`.
- Lint-then-build order matches the coding standards expectation that lint runs before shipping.
- `npm ci` (not `npm install`) aligns with "reproducible builds" intent in coding standards.

---

## Testing & rollout

**Test gaps:**
- The "deliberate lint error on a scratch branch" test (section 5, last bullet) is broken as written — the workflow only fires on `master`, so a scratch branch push will not trigger it. Options:
  1. Remove this test (trust the `needs:` gate is correct by inspection).
  2. Change to: "Temporarily introduce a lint error, push to `master`, verify workflow fails at lint step, then revert."

**Test data / fixtures:** Not applicable.

**Rollout:** Net-new infra, no migration or backwards-compat concerns. ✅

---

## Execution readiness

**Unclear tasks:** One minor ambiguity — concurrency group name is not specified in the plan. The plan says "cancel in-progress deploys" but the recommended Pages concurrency config is:
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```
`cancel-in-progress: false` is preferred for deploy jobs to avoid mid-deploy cancellations leaving Pages in an inconsistent state. The plan should be explicit about this.

**Missing dependencies / ordering issues:** Manual step (repo settings → Pages source → "GitHub Actions") must happen before the first push. This is called out in the plan. ✅

**Unknowns that should be spiked first:** None.

---

## Recommended changes (actionable)

1. **Change:** Update the concurrency config in the plan to explicitly set `cancel-in-progress: false`.
   - **Why:** GitHub recommends this for Pages deployments to prevent partial deploys if a second push lands while deploy is in progress.
   - **Where:** Section 2 — Workflow file, under "Concurrency"

2. **Change:** Fix the lint-error test description — remove "scratch branch" and instead say "temporarily push a lint error to `master`, verify the workflow fails at the lint step, then immediately revert with a fixup commit."
   - **Why:** The workflow trigger is `master`-only; a scratch branch will not trigger it.
   - **Where:** Section 5 — Testing, last bullet

3. **Change:** Add a note to verify action versions (`upload-pages-artifact`, `configure-pages`, `deploy-pages`) against current releases at implementation time, since minor versions may have incremented.
   - **Why:** Pinned major versions like `@v3` / `@v4` may have known bugs fixed in newer releases. Worth a quick check before writing the file.
   - **Where:** Section 2 — Workflow file, as an implementation note

---

## Questions for the human reviewer

None — all blocking questions were resolved during requirements gathering.
