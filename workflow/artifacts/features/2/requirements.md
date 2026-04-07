# Feature 2 — Requirements

## Problem

The app has no deployment pipeline. To share or test the app publicly, it must be deployed somewhere accessible. GitHub Pages is a zero-cost static hosting option that fits a client-rendered Vite/React app with no backend.

## Goals

- Automatically build and deploy the app to GitHub Pages on every push to `master`.
- The deployed site must be publicly accessible via the GitHub Pages URL (e.g., `https://<username>.github.io/<repo>/`).

## Non-goals

- No staging environment or branch preview deploys.
- No backend deployment.
- No custom domain (out of scope for now).
- No notifications or Slack/email alerts on deploy.

## User / Business Value

The developer can push to `master` and the live site updates automatically — no manual build or upload steps.

## Acceptance Criteria

- [ ] Pushing to `master` triggers the GitHub Actions workflow automatically.
- [ ] The workflow runs `npm ci`, `npm run lint`, then `npm run build` (which runs `tsc -b && vite build`).
- [ ] The built `dist/` output is deployed to the `gh-pages` branch (or Pages via Actions artifact).
- [ ] The GitHub Pages site is reachable at the expected URL after a successful deploy.
- [ ] The app assets load correctly (no 404s on JS/CSS due to wrong base path).
- [ ] A failed build prevents deployment (workflow does not deploy broken builds).

## Constraints

- Vite base path: already handled in `vite.config.ts` — reads `GITHUB_REPOSITORY` env var to set `/<repo-name>/` when running in GitHub Actions.
- Node version must match project requirements (current deps are compatible with Node 20+).
- `npm run build` is the single build command (`tsc -b && vite build`).
- GitHub Actions must have Pages write permission enabled in repo settings.

## Edge Cases

- If the build fails (TypeScript error, etc.), the deploy step must not run.
- The base path must be set correctly so that all asset paths (`/my-app/assets/...`) resolve properly on the Pages subdomain.

## Open Questions

~~- What is the GitHub repository name and owner?~~ **Resolved:** `github.com/lerouxvanas/robo-battles` → Pages URL will be `https://lerouxvanas.github.io/robo-battles/`
~~- Should the workflow run the linter?~~ **Resolved:** Yes — run `npm run lint` before `npm run build`.

---

## Scope Lock

### In scope

- GitHub Actions workflow file (`.github/workflows/deploy.yml`)
- Deployment to GitHub Pages on push to `master`

### Out of scope

- Custom domain setup
- Branch preview environments
- Backend or server-side rendering
- Test runner (not configured yet)
- Any changes to application source code

### Allowed edit paths

- `.github/workflows/` (new file only)
- `vite.config.ts` only if a base path correction is needed (existing logic should already handle it)

### Boundary notes

- Frontend deployment only — no server, no API, no database.
- Do not modify any `src/` files.
