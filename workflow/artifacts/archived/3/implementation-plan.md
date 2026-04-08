# Feature 3 — Implementation Plan

## Goal

Install and configure `vite-plugin-pwa` to add a Workbox-powered service worker, update the manifest config, generate a placeholder PNG icon for iOS, and add the required iOS meta tags to `index.html` — making the app installable via "Add to Home Screen" on iPhone and fully functional offline after the first visit.

## Scope recap

- **In scope:** `package.json`, `vite.config.ts`, `index.html`, `public/` (icons, manifest replaced by plugin), `src/main.tsx` (SW registration only if required)
- **Out of scope:** game logic, data storage, custom icon design, push notifications, background sync

## Approach

- Use `vite-plugin-pwa` with the `generateSW` strategy (Workbox auto-generates the service worker from config) — no hand-written SW file needed.
- Use `@vite-pwa/assets-generator` (dev dep) to generate PNG icons from the existing `public/favicon.svg` — produces the 180×180 apple-touch-icon and standard PWA icon sizes in one command.
- Move all manifest config into the `VitePWA()` plugin options in `vite.config.ts` — the plugin generates `manifest.webmanifest` during build. Remove the existing standalone `public/manifest.webmanifest` to avoid conflicts.
- Set `registerType: 'autoUpdate'` — the SW updates silently in the background without requiring a UI prompt component.
- Import `virtual:pwa-register` in `src/main.tsx` to trigger SW registration (required even with `autoUpdate`).
- Add iOS-specific meta tags to `index.html` (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`) and an `apple-touch-icon` link — these are not injected by the plugin.
- The `base` path (`/robo-battles/`) is already set in `vite.config.ts` via the `GITHUB_ACTIONS` env var. `vite-plugin-pwa` reads Vite's `base` and applies it to the service worker scope and manifest `start_url` automatically.
- Remove the manual `<link rel="manifest">` from `index.html` — `vite-plugin-pwa` injects this during build.

## Work breakdown

### 1) Prep / research
- [ ] Check latest compatible version of `vite-plugin-pwa` for `vite@^8` and install as dev dep
- [ ] Check latest compatible version of `@vite-pwa/assets-generator` and install as dev dep
- [ ] Icon source: use `public/favicon.svg` — it is a valid standalone SVG (48×46, purple bolt icon). Note: `public/icons.svg` is a UI sprite sheet with no root `viewBox` and cannot be used for PWA icon generation.

### 2) Icon generation
- [ ] From repo root, run: `npx pwa-assets-generator --preset minimal-2023 public/favicon.svg`
  This generates the following files into `public/`:
- [ ] Confirm these files exist and are non-empty:
  - `public/pwa-64x64.png`
  - `public/pwa-192x192.png`
  - `public/pwa-512x512.png`
  - `public/apple-touch-icon-180x180.png`
  - `public/maskable-icon-512x512.png` (optional but good practice for Android)

### 3) Manifest + plugin config
- [ ] Delete `public/manifest.webmanifest` (plugin takes over manifest generation)
- [ ] Add `VitePWA()` plugin to `vite.config.ts` with:
  ```ts
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
    },
    manifest: {
      name: 'Robo Battles',
      short_name: 'Robo Battles',
      description: 'A React Three Fiber playground for experimenting with browser-based 3D scenes.',
      start_url: '/',          // plugin applies base path automatically at build
      display: 'standalone',
      background_color: '#101218',
      theme_color: '#101218',
      icons: [
        { src: 'pwa-64x64.png',            sizes: '64x64',   type: 'image/png' },
        { src: 'pwa-192x192.png',          sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'maskable-icon-512x512.png',sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  })
  ```

### 4) index.html — iOS tags
- [ ] Remove `<link rel="manifest" href="/manifest.webmanifest" />` (plugin injects this)
- [ ] Add after existing meta tags:
  ```html
  <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Robo Battles" />
  ```

### 5) SW registration
- [ ] Add to `src/main.tsx` (top of file, before React imports):
  ```ts
  import { registerSW } from 'virtual:pwa-register'
  registerSW({ immediate: true })
  ```
- [ ] Add TypeScript declaration if needed (`vite-plugin-pwa` ships `client.d.ts` — verify it's picked up automatically)

### 6) README.md update
- [ ] Replace the root `README.md` (currently the default Vite template) with project-specific content covering:
  - Project name and one-line description
  - Live URL: `https://lerouxvanas.github.io/robo-battles/`
  - PWA install instructions (iPhone: Safari → Share → Add to Home Screen)
  - Tech stack: React 19, TypeScript, Vite, React Three Fiber, Three.js, styled-components, vite-plugin-pwa
  - Local development: `npm install` → `npm run dev`
  - Build: `npm run build`
  - Deployment: auto-deploys to GitHub Pages on push to `master` via GitHub Actions

### 7) Testing
- [ ] Run `npm run build` — confirm no errors and that `dist/sw.js` and `dist/manifest.webmanifest` are present in the output
- [ ] Run `npm run preview` — serve the `dist/` output locally and open Chrome DevTools → Application → Service Workers — confirm SW registered
- [ ] DevTools → Application → Manifest — confirm no validation errors, icons load, `start_url` is correct
- [ ] Go offline in DevTools → Network → Offline — reload and confirm the app still loads
- [ ] On iPhone: visit the deployed GitHub Pages URL → Safari share sheet → "Add to Home Screen" — confirm the app name and placeholder icon appear (not a screenshot)
- [ ] Launch from home screen — confirm standalone mode (no Safari browser chrome)

### 8) Rollout
- [ ] Feature flag: No
- [ ] Backwards compatibility: Existing users get the SW on next visit; no breaking changes
- [ ] Migration notes: `public/manifest.webmanifest` is deleted — ensure no other part of the repo references it directly

## Acceptance criteria mapping

| Acceptance criterion | Planned change | Proof |
|---|---|---|
| App loads offline after first visit | `generateSW` with `globPatterns` caches app shell | DevTools offline test — app reloads without network |
| iPhone "Add to Home Screen" shows icon | `apple-touch-icon-180x180.png` + `<link rel="apple-touch-icon">` | Manual test on iPhone Safari |
| Installed app launches standalone | `display: standalone` in manifest + `apple-mobile-web-app-capable` | Home screen launch — no browser chrome |
| SW registers without console errors | `registerSW()` in `main.tsx` + valid plugin config | DevTools → Application → Service Workers |
| Manifest passes DevTools validation | Plugin-generated manifest with all required fields | DevTools → Application → Manifest shows no errors |

## Risks & mitigations

- **Risk:** `vite-plugin-pwa` version incompatibility with `vite@^8`.
  - **Mitigation:** Check the plugin's release notes before installing; use the latest version that explicitly lists Vite 5+ or 6+ support (Vite 8 is API-compatible with 5/6).
- **Risk:** `virtual:pwa-register` TypeScript import causes a type error.
  - **Mitigation:** `vite-plugin-pwa` ships type declarations; if not auto-resolved, add `/// <reference types="vite-plugin-pwa/client" />` to `vite-env.d.ts` or `tsconfig`.
- **Risk:** iOS Safari does not update the home screen icon after a re-install.
  - **Mitigation:** This is an iOS caching behaviour — no code fix. Document that clearing Safari cache and re-adding resolves it.
- **Risk:** Service worker scope is wrong on GitHub Pages due to base path.
  - **Mitigation:** `vite-plugin-pwa` reads Vite's `base` config and sets scope accordingly. Verify in DevTools → Application → Service Workers that scope shows `/robo-battles/`.
- **Risk:** Deleting `manifest.webmanifest` from `public/` breaks the existing `<link rel="manifest">` during local dev (before build).
  - **Mitigation:** `vite-plugin-pwa` serves the manifest during `vite dev` as well — no gap in local development.

## Open questions

None.
