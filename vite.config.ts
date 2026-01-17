import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  base: '/absence-pdf-maker/',
  define: {
    global: 'globalThis',
    Buffer: 'globalThis.Buffer',
  },
  plugins: [
    react(),
    svgr(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['*.svg', '*.png', '*.jpg', '*.jpeg', 'fonts/*.ttf'],
      manifest: {
        name: 'Leave Request PDF Maker',
        short_name: 'Leave PDF',
        description: 'Create professional leave request PDFs with holiday calculations',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/absence-pdf-maker/',
        start_url: '/absence-pdf-maker/',
        icons: [
          {
            src: '/absence-pdf-maker/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/absence-pdf-maker/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB limit
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,json,ttf}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:json|js|css|svg|png|jpg|jpeg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        navigateFallback: '/absence-pdf-maker/',
      },
      devOptions: {
        enabled: true, // Enable PWA in development for testing
        type: 'module',
      },
    }),
  ],
})
