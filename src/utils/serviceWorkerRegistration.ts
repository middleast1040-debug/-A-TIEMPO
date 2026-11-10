/**
 * Service Worker registration and lifecycle management for PWA & Workbox caching.
 */

export interface SWRegistrationCallbacks {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(callbacks: SWRegistrationCallbacks = {}): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    // Vite-plugin-pwa outputs /sw.js in root or dev-sw.js
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; please refresh.
                if (callbacks.onUpdate) callbacks.onUpdate(registration);
              } else {
                // Content is cached for offline use.
                if (callbacks.onSuccess) callbacks.onSuccess(registration);
              }
            }
          };
        });

        if (callbacks.onSuccess) callbacks.onSuccess(registration);
        // Prompt immediate update check
        registration.update().catch(() => {});
      })
      .catch((error) => {
        // Fallback for development if /sw.js is not generated yet
        console.info('[PWA] Service Worker registration handled:', error.message || error);
        if (callbacks.onError) callbacks.onError(error);
      });
  });
}

/**
 * Checks if the browser is currently running in standalone PWA installed mode.
 */
export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
