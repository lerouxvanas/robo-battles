# Feature 3 — Requirements

## Problem

The app is not usable offline and cannot be installed on a device. The PWA groundwork from ticket 1 (manifest, theme-color) is in place, but there is no service worker, no offline caching, and no iOS-compatible icon. On iPhone, tapping "Add to Home Screen" produces no usable icon and the app fails to load offline.

## Goals

- Add a service worker that caches the app shell so it loads offline.
- Make the app installable on iPhone ("Add to Home Screen" produces a named icon and launches in standalone mode).
- Update the web manifest and HTML to meet iOS PWA requirements.

## Non-goals

- Any browser storage or data persistence (deferred until there is actual data to persist).
- Background sync, push notifications, or any other advanced service worker features.
- A custom-designed icon (placeholder PNG is sufficient for now).
- Offline support for external resources or third-party CDN assets.

## User / Business Value

The developer (and anyone they share the link with) can install the app on their iPhone and use it offline after the first load — making it feel like a native app rather than a browser bookmark.

## Acceptance Criteria

- [ ] The app loads correctly when the device is offline (after at least one online visit).
- [ ] On iPhone Safari, "Add to Home Screen" shows the app name and a visible placeholder icon (not a blank/screenshot icon).
- [ ] The installed app launches in standalone mode (no browser chrome).
- [ ] The service worker registers without errors in the browser console.
- [ ] The web manifest passes basic validation (e.g., Chrome DevTools → Application → Manifest shows no errors).

## Constraints

- **Vite plugin:** `vite-plugin-pwa` (with Workbox) is the standard Vite-native approach — use this rather than hand-writing a service worker.
- **Icon format:** iOS requires a PNG `apple-touch-icon` (180×180px minimum). SVG is not supported for home screen icons on iOS Safari. A placeholder solid-colour PNG is acceptable for now.
- **GitHub Pages base path:** `start_url` in the manifest must account for the `/robo-battles/` base path.
- **Caching strategy:** Cache-first for the app shell (JS, CSS, HTML); network-first or stale-while-revalidate for any future API calls.
- **No backend:** No server-side components.

## Edge Cases

- First load must be online (service worker cannot pre-cache before first visit).
- If the service worker update is detected mid-session, the old cache should remain active until the user refreshes.
- The GitHub Pages base path (`/robo-battles/`) must be reflected in the service worker scope, otherwise caching will break.
- iOS does not fully respect the `display: standalone` setting from the manifest alone — the `apple-mobile-web-app-capable` meta tag is also needed.

## Open Questions

None.

---

## Scope Lock

### In scope

- `vite-plugin-pwa` installation and configuration (service worker + offline caching)
- `public/manifest.webmanifest` — deleted; manifest config moved into `vite.config.ts` plugin options
- `index.html` — add `apple-touch-icon` link and `apple-mobile-web-app-capable` meta tag
- `public/` — add a placeholder PNG icon (180×180 minimum)
- `vite.config.ts` — register the PWA plugin
- `README.md` — replace Vite template boilerplate with actual project info (name, live URL, PWA install guide, tech stack, dev/build/deploy instructions)

### Out of scope

- Actual data persistence implementation
- Custom icon design (placeholder only)
- Push notifications or background sync
- Changes to `src/` beyond what `vite-plugin-pwa` requires (e.g., an optional update prompt component — only if straightforward)

### Allowed edit paths

- `public/` (manifest, icons)
- `index.html`
- `vite.config.ts`
- `package.json` (add `vite-plugin-pwa`)
- `README.md`
- `src/` — only if a service worker registration hook or update prompt is required by the chosen plugin setup

### Boundary notes

- Frontend/static hosting only.
- No backend changes.
- No changes to game/scene logic in `src/features/scene/`.
