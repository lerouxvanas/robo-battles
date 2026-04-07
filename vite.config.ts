import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base =
  process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/'
const manifestPath = base

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
      manifest: {
        name: 'Robo Battles',
        short_name: 'Robo Battles',
        description: 'A React Three Fiber playground for experimenting with browser-based 3D scenes.',
        start_url: manifestPath,
        scope: manifestPath,
        display: 'standalone',
        background_color: '#101218',
        theme_color: '#101218',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
