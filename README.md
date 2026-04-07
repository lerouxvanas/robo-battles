# Robo Battles

A browser-based 3D game built with React Three Fiber. Currently in early development — the first scene renders a rotating 3D object as a proof-of-concept for the rendering stack.

**Live:** [lerouxvanas.github.io/robo-battles](https://lerouxvanas.github.io/robo-battles/)

---

## Install on iPhone

1. Open the live URL in Safari
2. Tap the Share button → **Add to Home Screen**
3. The app installs and works offline after the first visit

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| 3D rendering | React Three Fiber + Three.js |
| Styling | styled-components |
| PWA | vite-plugin-pwa (Workbox) |
| Hosting | GitHub Pages |

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build       # type-check + production build
npm run preview     # serve the built output locally
```

## Lint

```bash
npm run lint
```

---

## Deployment

Pushes to `master` automatically trigger a GitHub Actions workflow that lints, builds, and deploys to GitHub Pages.
