import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const appUrl = process.env.APP_URL ? new URL(process.env.APP_URL) : null;
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
        includeAssets: ['favicon.svg', 'icon.svg', 'manifest.json'],
        manifest: {
          name: 'A Tiempo',
          short_name: 'A Tiempo',
          description: 'Tu salida exacta en sistemas de transporte masivo en Colombia: TransMilenio, Metro Medellín, MÍO Cali, Transmetro y Metrolínea.',
          theme_color: '#070D18',
          background_color: '#070D18',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          lang: 'es-CO',
          categories: ['travel', 'navigation', 'utilities'],
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
            {
              src: '/favicon.svg',
              sizes: '48x48 96x96',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-assets-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: isHmrDisabled
        ? false
        : appUrl
          ? {
              protocol: appUrl.protocol === 'https:' ? 'wss' : 'ws',
              host: appUrl.hostname,
              clientPort: appUrl.port ? Number(appUrl.port) : (appUrl.protocol === 'https:' ? 443 : 80),
            }
          : true,
      ws: isHmrDisabled
        ? (false as const)
        : appUrl
          ? {
              protocol: appUrl.protocol === 'https:' ? 'wss' : 'ws',
              host: appUrl.hostname,
              clientPort: appUrl.port ? Number(appUrl.port) : (appUrl.protocol === 'https:' ? 443 : 80),
            }
          : undefined,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: isHmrDisabled ? null : {},
    },
  };
});

