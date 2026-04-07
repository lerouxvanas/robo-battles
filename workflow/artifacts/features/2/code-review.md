# Code Review — Ticket 2

## Summary

- **Verdict: ✅ Approve**
- Key areas reviewed: CI/CD workflow YAML — trigger, permissions, job structure, concurrency, action versions, step ordering.
- Overall notes:
  - The workflow is correct and will function as intended.
  - Lint → build → upload → deploy ordering is right; `needs: build` enforces the deploy gate.
  - `cancel-in-progress: false` is correctly set for Pages (prevents mid-deploy cancellation).
  - One minor least-privilege observation: permissions are set at workflow level, meaning the `build` job unnecessarily inherits `pages: write` and `id-token: write`.
  - React/frontend-specific checks (hooks, effects, memory leaks, race conditions) are not applicable — this change is YAML only.

---

## Findings

### Finding 1
- **Severity:** Minor
- **File:** `.github/workflows/deploy-pages.yml`
- **What:** `permissions` block is at the workflow level, so both the `build` and `deploy` jobs inherit `pages: write` and `id-token: write`. The `build` job only needs `contents: read`.
- **Why it matters:** Least-privilege principle — the build job should not hold permissions it doesn't use. If the build job were compromised (e.g., via a malicious dependency in `npm ci`), it would have unnecessary Pages write access.
- **Suggested fix:** Move `pages: write` and `id-token: write` to the `deploy` job only, and set `contents: read` at the workflow level:
  ```yaml
  permissions:
    contents: read

  jobs:
    build:
      # no extra permissions needed
    deploy:
      permissions:
        pages: write
        id-token: write
  ```

### Finding 2
- **Severity:** Nit
- **File:** `.github/workflows/deploy-pages.yml`
- **What:** `configure-pages@v5` and `upload-pages-artifact@v3` are from different major versions of the GitHub Pages action family.
- **Why it matters:** These actions are developed as a set and major versions are usually released together. A version mismatch can occasionally cause unexpected behaviour if the APIs between them have diverged.
- **Suggested fix:** Check [github.com/actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases) — if `@v4` or `@v5` is available, update to match `configure-pages@v5`.

---

## React/frontend focus checks

- **Hooks/effect cleanup:** N/A — no React code changed.
- **Memory leaks:** N/A
- **Race conditions:** N/A — GitHub Actions handles job concurrency natively via `needs:` and `concurrency:`.
- **Timers/workarounds:** N/A
- **React best practices:** N/A

---

## Test coverage

- **What exists:** Manual smoke test plan in `implementation-plan.md` (visit URL, check DevTools for 404s, verify workflow runs in Actions tab).
- **Gaps:** No automated test is possible for a CI/CD workflow file itself — correctness is proven by running it. This is acceptable and noted in `implementation-plan.md`.
- **Recommended additions:** None beyond what is already planned.

---

## Action list

- [ ] **(Optional / Minor)** Move `pages: write` and `id-token: write` permissions to the `deploy` job only — see Finding 1.
- [ ] **(Optional / Nit)** Verify `upload-pages-artifact` latest major version and update if `@v4`/`@v5` is available — see Finding 2.
