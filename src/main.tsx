import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { seedOfflineTransitCache } from './utils/offlineTransitCache';

// Initialize offline cache for instant access without data
seedOfflineTransitCache();

// Register Service Worker for PWA asset & runtime caching
registerServiceWorker({
  onSuccess: () => {
    console.info('[A Tiempo PWA] Aplicación lista para uso sin conexión (Offline-Ready)');
  },
  onUpdate: () => {
    console.info('[A Tiempo PWA] Nueva versión de rutas y horarios disponible');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

