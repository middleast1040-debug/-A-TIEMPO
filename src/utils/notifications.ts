// Web Notifications API utility for transit emergency alerts
// Strictly filters for truly relevant / high-impact incidents ("sólo verdaderamente relevantes")
import { TransitNewsItem } from '../data/bogotaNews';
import { triggerFinalDepartureHaptic } from './haptics';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

const STORAGE_KEY_PUSH_ENABLED = 'ontime_bogota_push_enabled';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

export function isPushAlertsEnabled(): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  const saved = localStorage.getItem(STORAGE_KEY_PUSH_ENABLED);
  return saved !== null ? saved === 'true' : true;
}

export function setPushAlertsEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_PUSH_ENABLED, String(enabled));
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPushAlertsEnabled(true);
    }
    return permission as NotificationPermissionState;
  } catch {
    return 'denied';
  }
}

/**
 * Filter: Checks whether a news item meets the strict threshold for push alerts.
 * Only severe congestion, corridor closures, blockades, or emergency service disruptions qualify.
 */
export function isTrulyRelevantAlert(item: TransitNewsItem): boolean {
  return item.isCriticalAlert === true || item.severity === 'alta';
}

/**
 * Dispatch a push notification for a critical Bogota transit alert.
 */
export function sendCriticalTransitNotification(item: TransitNewsItem): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Enforce strict relevance
  if (!isTrulyRelevantAlert(item)) {
    return false;
  }

  try {
    const notification = new Notification(`Alerta Crítica: ${item.title}`, {
      body: `${item.description}\nCorredor afectado: ${item.affectedCorridor}`,
      icon: '/favicon.ico',
      tag: `ontime-transit-${item.id}`,
      requireInteraction: true,
      lang: 'es',
    });

    // Provide immediate haptic alert if user device supports vibration
    triggerFinalDepartureHaptic();

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch {
    return false;
  }
}

/**
 * Dispatches a simulated test alert so the user can verify their device receives push notifications.
 */
export function sendTestPushNotification(): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const testItem: TransitNewsItem = {
      id: `test-${Date.now()}`,
      category: 'trancon',
      categoryLabel: 'Alerta Crítica',
      title: 'Prueba de Alerta · A Tiempo',
      description: 'Esta es una simulación de alerta. Recibirás avisos incluso con la pestaña minimizada o en segundo plano.',
      affectedCorridor: 'Troncales y Vías Principales',
      timeAgo: 'Ahora mismo',
      severity: 'alta',
      isCriticalAlert: true,
    };

    return sendCriticalTransitNotification(testItem);
  } catch {
    return false;
  }
}

/**
 * Dispatches a departure time notification (even when tab is minimized / background).
 */
export function sendDeparturePushNotification(
  routeCode: string,
  originStop: string,
  walkMinutes: number
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(`⏱️ ¡Hora de Salir! · A Tiempo`, {
      body: `Es momento de caminar hacia ${originStop} (${walkMinutes} min). Tu bus ${routeCode} se aproxima.`,
      icon: '/assets/a_tiempo_emblem.png',
      badge: '/assets/a_tiempo_emblem.png',
      tag: 'atiempo-departure-alert',
      requireInteraction: true,
      lang: 'es',
    });

    triggerFinalDepartureHaptic();

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch {
    return false;
  }
}

/**
 * Dispatches proximity alarm to wake up / alert user 2 stops before destination.
 */
export function sendProximityArrivalNotification(
  routeCode: string,
  destinationStop: string,
  stopsAway: number = 2
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(`🔔 ¡Avísame al llegar! · A Tiempo`, {
      body: `Faltan solo ${stopsAway} paradas para tu destino: ${destinationStop} (Ruta ${routeCode}). ¡Prepárate para descender!`,
      icon: '/assets/a_tiempo_emblem.png',
      badge: '/assets/a_tiempo_emblem.png',
      tag: 'atiempo-proximity-arrival',
      requireInteraction: true,
      lang: 'es',
    });

    triggerFinalDepartureHaptic();

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch {
    return false;
  }
}

/**
 * Dispatches an emergency low balance push notification.
 */
export function sendLowBalancePushNotification(
  cardBrand: string,
  balance: number,
  fare: number
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(`⚠️ Saldo Mínimo de Emergencia · ${cardBrand}`, {
      body: `Tu saldo es de $${balance.toLocaleString('es-CO')} COP (menos de 2 pasajes de $${fare.toLocaleString('es-CO')}). Recarga antes de llegar a la estación para evitar filas.`,
      icon: '/assets/a_tiempo_emblem.png',
      badge: '/assets/a_tiempo_emblem.png',
      tag: 'atiempo-low-balance',
      requireInteraction: false,
      lang: 'es',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch {
    return false;
  }
}
