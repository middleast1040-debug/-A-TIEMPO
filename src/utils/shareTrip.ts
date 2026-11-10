import { formatTimeAmPm } from './transitCalculator';

/**
 * Utility to share real-time trip status via WhatsApp or native Web Share API
 * Designed for user safety and family peace of mind in Colombian transit systems.
 */
export function shareTripViaWhatsApp({
  routeCode,
  destinationStop,
  estimatedArrivalDate,
  cityName,
}: {
  routeCode: string;
  destinationStop: string;
  estimatedArrivalDate: Date | number;
  cityName?: string;
}): void {
  const arrivalDate = typeof estimatedArrivalDate === 'number' ? new Date(estimatedArrivalDate) : estimatedArrivalDate;
  const timeFormatted = formatTimeAmPm(arrivalDate);
  const cityText = cityName ? ` en ${cityName}` : '';

  const message = `Hola! Voy en camino en la ruta ${routeCode} hacia ${destinationStop}${cityText}. Calculo llegar aproximadamente a las ${timeFormatted}. ⏱️ A Tiempo · ¡Como siempre!`;

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  if (typeof window !== 'undefined') {
    // Attempt native navigator.share if available on mobile, otherwise direct WhatsApp web/app link
    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      navigator
        .share({
          title: 'Mi Trayecto · A Tiempo',
          text: message,
        })
        .catch(() => {
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        });
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
