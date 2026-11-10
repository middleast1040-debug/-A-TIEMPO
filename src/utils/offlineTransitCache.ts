import { COLOMBIA_SYSTEMS, TransitCitySystem } from '../data/colombiaTransit';

const OFFLINE_CACHE_KEY = 'a_tiempo_offline_transit_v2';
const OFFLINE_CACHE_TIMESTAMP_KEY = 'a_tiempo_offline_sync_ts';

export interface OfflineCacheData {
  version: string;
  timestamp: number;
  systems: Record<string, TransitCitySystem>;
  cachedRoutesCount: number;
}

/**
 * Seeds and initializes critical transit data into local persistent storage.
 * Ensures the app has full route and schedule availability even with zero network connectivity.
 */
export function seedOfflineTransitCache(): OfflineCacheData {
  try {
    const existing = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (existing) {
      const parsed: OfflineCacheData = JSON.parse(existing);
      // If cache is valid and has systems, return it
      if (parsed && parsed.systems && Object.keys(parsed.systems).length > 0) {
        return parsed;
      }
    }
  } catch {
    // Continue to seed if corrupted
  }

  // Count total routes
  let totalRoutes = 0;
  Object.values(COLOMBIA_SYSTEMS).forEach((sys) => {
    totalRoutes += sys.routes?.length || 0;
  });

  const cachePayload: OfflineCacheData = {
    version: '2.4.0',
    timestamp: Date.now(),
    systems: COLOMBIA_SYSTEMS,
    cachedRoutesCount: totalRoutes,
  };

  try {
    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cachePayload));
    localStorage.setItem(OFFLINE_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    console.warn('[OfflineTransitCache] Storage write error (likely quota):', err);
  }

  return cachePayload;
}

/**
 * Retrieves the local cached transit system by ID.
 * Falls back to in-memory COLOMBIA_SYSTEMS if storage isn't populated.
 */
export function getOfflineTransitSystem(cityId: string): TransitCitySystem {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (raw) {
      const data: OfflineCacheData = JSON.parse(raw);
      if (data?.systems?.[cityId]) {
        return data.systems[cityId];
      }
    }
  } catch (err) {
    console.warn('[OfflineTransitCache] Error reading cached system:', err);
  }
  return COLOMBIA_SYSTEMS[cityId] || COLOMBIA_SYSTEMS.bogota;
}

/**
 * Returns cache diagnostics (timestamp, route count, systems available).
 */
export function getOfflineCacheStatus(): {
  isCached: boolean;
  timestamp: number | null;
  routesCount: number;
  lastSyncFormatted: string;
} {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (raw) {
      const data: OfflineCacheData = JSON.parse(raw);
      const ts = data.timestamp || Date.now();
      return {
        isCached: true,
        timestamp: ts,
        routesCount: data.cachedRoutesCount || 42,
        lastSyncFormatted: new Date(ts).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    }
  } catch {
    // Ignore
  }

  return {
    isCached: false,
    timestamp: null,
    routesCount: 0,
    lastSyncFormatted: 'No sincronizado',
  };
}

/**
 * Force refresh the local transit cache with the freshest data.
 */
export function syncOfflineTransitCache(): OfflineCacheData {
  let totalRoutes = 0;
  Object.values(COLOMBIA_SYSTEMS).forEach((sys) => {
    totalRoutes += sys.routes?.length || 0;
  });

  const cachePayload: OfflineCacheData = {
    version: '2.4.0',
    timestamp: Date.now(),
    systems: COLOMBIA_SYSTEMS,
    cachedRoutesCount: totalRoutes,
  };

  try {
    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cachePayload));
    localStorage.setItem(OFFLINE_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('[OfflineTransitCache] Force sync error:', e);
  }

  return cachePayload;
}
