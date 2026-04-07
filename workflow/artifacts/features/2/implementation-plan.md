# Feature 2 — Implementation Plan

## Goal

Create a GitHub Actions workflow that automatically lints, builds, and deploys the Vite/React app to GitHub Pages on every push to `master`. The app will be publicly accessible at `https://lerouxvanas.github.io/robo-battles/`. The `vite.config.ts` base path logic already handles the `/robo-battles/` prefix when running in GitHub Actions — no source code changes are needed.

## Scope recap

- **In scope:** `.github/workflows/deploy.yml` (new file only)
- **Out of scope:** source code, custom domain, branch previews, backend, test runner

## Approach

- Use the **official GitHub Pages Actions** approach (`actions/configure-pages` → `actions/upload-pages-artifact` → `actions/deploy-pages`) — the modern recommended method that avoids a separate `gh-pages` branch.
- Split into two jobs: `build` (lint + build + upload artifact) and `deploy` (Pages deployment) — this gives a clear separation of concerns and ensures deploy never runs if build fails.
- Pin to `ubuntu-latest` runner and Node 20 (compatible with all current deps).
- Use `npm ci` (not `npm install`) for a clean, reproducible install.
- Workflow permissions: `pages: write` + `id-token: write` on the `deploy` job; `contents: read` globally.
- No secrets needed — GitHub Pages deployment uses OIDC via `id-token`.
- One manual repo setting change required: set Pages source to **"GitHub Actions"** (not a branch).

## Work breakdown

### 1) Prep / research
- [x] Confirm `vite.config.ts` base path logic is correct for the repo name `robo-battles` — ✅ already reads `GITHUB_REPOSITORY` and sets `/<repo-name>/` in CI
- [ ] Confirm `.github/workflows/` directory does not already exist

### 2) Workflow file
- [ ] Create `.github/workflows/deploy.yml` with:
  - Trigger: `push` to `master`
  - Permissions: `contents: read`, `pages: write`, `id-token: write`
  - Concurrency: cancel in-progress deploys on the same branch (keep latest only)
  - **`build` job:**
    - `actions/checkout@v4`
    - `actions/setup-node@v4` with Node 20 and npm cache
    - `npm ci`
    - `npm run lint`
    - `npm run build` (outputs to `dist/`)
    - `actions/configure-pages@v4`
    - `actions/upload-pages-artifact@v3` pointing at `dist/`
  - **`deploy` job:**
    - `needs: build`
    - `environment: github-pages` with `url: ${{ steps.deployment.outputs.page_url }}`
    - `actions/deploy-pages@v4`

### 3) Repo settings (manual — cannot be automated)
- [ ] In GitHub repo settings → Pages → Source → set to **"GitHub Actions"**

### 4) UI / UX
_Not applicable — this is a CI/CD pipeline, no UI changes._

### 5) Testing
- [ ] Push a commit to `master` and confirm the Actions workflow appears under the repo's "Actions" tab
- [ ] Confirm the `build` job passes (lint + build green)
- [ ] Confirm the `deploy` job passes and outputs a Pages URL
- [ ] Visit `https://lerouxvanas.github.io/robo-battles/` and confirm the app loads
- [ ] Open browser DevTools Network tab — confirm no 404s on JS/CSS assets
- [ ] Introduce a deliberate lint error in a scratch branch, confirm workflow fails on `lint` step and does not deploy

_Note: No unit tests apply here. The test runner is not configured. Lint + build remain the minimum automated checks per coding-standards.md._

### 6) Rollout
- [ ] Feature flag: No
- [ ] Backwards compatibility: No existing pipeline to break
- [ ] Migration notes: None — this is net-new infrastructure

## Acceptance criteria mapping

| Acceptance criterion | Planned change | Proof |
|---|---|---|
| Push to `master` triggers workflow | `on: push: branches: [master]` in `deploy.yml` | Workflow appears in Actions tab on next push |
| Runs `npm ci` → `lint` → `build` | `build` job steps | CI log shows all three steps green |
| `dist/` deployed (no broken deploy on failure) | `deploy` job `needs: build`; artifact uploaded from `dist/` | Deploy job only runs after build job succeeds |
| Site reachable at Pages URL | `deploy-pages` action | Browser can load `https://lerouxvanas.github.io/robo-battles/` |
| Assets load without 404s | `vite.config.ts` sets `base: /robo-battles/` in CI | No network errors in DevTools |
| Failed build blocks deploy | `needs: build` + default job failure propagation | Deliberate lint error → deploy job skipped |

## Risks & mitigations

- **Risk:** Pages source not set to "GitHub Actions" in repo settings → deploy job fails with a permissions error.
  - **Mitigation:** Step 3 in work breakdown is a manual pre-flight check; do it before pushing the workflow file.
- **Risk:** `GITHUB_REPOSITORY` env var produces an unexpected value (e.g., uppercase letters).
  - **Mitigation:** `vite.config.ts` already splits on `/` and takes `[1]` — this is correct; verify by checking the Actions build log for the `base` value Vite reports.

## Open questions

None — all resolved in requirements.
