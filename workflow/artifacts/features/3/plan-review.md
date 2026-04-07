# Plan Review — Ticket 3 (revision 2)

## Summary

- **Verdict: ✅ Ready to implement**
- All changes from revision 1 applied correctly. One nit remains:
  1. The `## Approach` narrative (line 15) still references `public/icons.svg` — but all task steps now correctly use `favicon.svg`. Won't block implementation; fix in place if convenient.

---

## Requirements coverage

All 5 acceptance criteria are mapped. No gaps.

| AC | Mapped? | Notes |
|---|---|---|
| App loads offline after first visit | ✅ | `generateSW` + `globPatterns` |
| iPhone Add to Home Screen shows icon | ✅ | `apple-touch-icon-180x180.png` + `<link rel="apple-touch-icon">` |
| Installed app launches standalone | ✅ | `display: standalone` + `apple-mobile-web-app-capable` |
| SW registers without console errors | ✅ | `registerSW()` in `main.tsx` |
| Manifest passes DevTools validation | ✅ | Plugin-generated manifest |

README.md update: scoped, tasked, in allowed edit paths. ✅

---

## Scope lock check

- `## Scope Lock` present ✅
- `manifest.webmanifest` entry updated to "deleted — config moved to `vite.config.ts`" ✅
- In scope, out of scope, allowed edit paths, boundary notes all present and consistent ✅

---

## Plan completeness checklist

- [x] Affected files explicit: `package.json`, `vite.config.ts`, `index.html`, `public/`, `src/main.tsx`, `README.md`
- [x] Icon source corrected to `favicon.svg`
- [x] Generator command explicit: `npx pwa-assets-generator --preset minimal-2023 public/favicon.svg`
- [x] `includeAssets` added to plugin config
- [x] Step numbering fixed (1–8, no gaps)
- [x] No unjustified abstractions
- [x] No API/schema impact
- [x] TypeScript type risk mitigated in risks section

---

## Technical approach sanity check

**Correctness risks:** None remaining. Icon source, command, and plugin config are all consistent and correct.

**Complexity risks:** Low — standard `vite-plugin-pwa` setup.

**Maintainability risks:** Low.

**Performance risks:** None. Workbox precaching is the correct strategy.

**Security/permissions risks:** None.

---

## Architecture / standards alignment

No conflicts with `app-architecture.md` or `coding-standards.md`. All changes are infrastructure/config — no app logic touched.

---

## Testing & rollout

Thorough manual test plan. No automated tests possible (no test runner, PWA behaviour is inherently manual). Rollout notes cover the manifest deletion. ✅

---

## Execution readiness

All tasks are concrete and executable in order. No blockers.

---

## Recommended changes (actionable)

1. **Change (Nit):** In `## Approach`, line 2 — replace "`public/icons.svg`" with "`public/favicon.svg`" to match the corrected task steps.
   - **Why:** Consistency — the approach narrative still says `icons.svg` but all task steps correctly say `favicon.svg`.
   - **Where:** `## Approach`, second bullet point.

---

## Questions for the human reviewer

None.
