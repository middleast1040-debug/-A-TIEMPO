import React, { useState } from 'react';
import { Route } from '../types/transit';
import { BogotaWeather, TransitNewsItem } from '../data/bogotaNews';
import { formatTimeAmPm } from '../utils/transitCalculator';
import {
  Footprints,
  Bus,
  Clock,
  MapPin,
  Sun,
  Umbrella,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Award,
  TrendingUp,
  BellRing,
  BellOff,
  MessageCircle,
} from 'lucide-react';
import { shareTripViaWhatsApp } from '../utils/shareTrip';

interface SuggestedRouteTimelineProps {
  route: Route;
  originStop: string;
  destinationStop: string;
  walkingMinutes: number;
  bufferMinutes: number;
  targetBusArrivalMs: number;
  currentTimeMs: number;
  weather: BogotaWeather;
  fare: number;
  cityName: string;
  cardBrand: string;
  activeAlerts?: TransitNewsItem[];
  travelState: 'inactive' | 'monitoring' | 'arrived';
  onStartTrip: () => void;
  onPauseTrip: () => void;
  onArrivedDestination: () => void;
  isWakeUpAlarmActive?: boolean;
  onToggleWakeUpAlarm?: () => void;
}

export const SuggestedRouteTimeline: React.FC<SuggestedRouteTimelineProps> = ({
  route,
  originStop,
  destinationStop,
  walkingMinutes,
  bufferMinutes,
  targetBusArrivalMs,
  currentTimeMs,
  weather,
  fare,
  cityName,
  cardBrand,
  activeAlerts = [],
  travelState,
  onStartTrip,
  onPauseTrip,
  onArrivedDestination,
  isWakeUpAlarmActive = false,
  onToggleWakeUpAlarm,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  // Calculations
  const busArrivalDate = new Date(targetBusArrivalMs);
  const departureDate = new Date(targetBusArrivalMs - (walkingMinutes + bufferMinutes) * 60 * 1000);
  const rideMinutes = route.transitMinutes || 18;
  const destinationArrivalDate = new Date(targetBusArrivalMs + rideMinutes * 60 * 1000);
  const totalDoorToDoorMins = walkingMinutes + bufferMinutes + rideMinutes;

  const secondsUntilDeparture = Math.max(0, Math.floor((departureDate.getTime() - currentTimeMs) / 1000));
  const departureMins = Math.floor(secondsUntilDeparture / 60);
  const departureSecs = secondsUntilDeparture % 60;

  const handleShareArrival = () => {
    shareTripViaWhatsApp({
      routeCode: route.code,
      destinationStop,
      estimatedArrivalDate: destinationArrivalDate,
      cityName,
    });
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const relevantAlerts = activeAlerts.filter((item) => {
    if (!route.corridor) return false;
    const lowerCorridor = route.corridor.toLowerCase();
    const lowerAff = (item.affectedCorridor || '').toLowerCase();
    const lowerDesc = item.description.toLowerCase();
    return (
      lowerAff.includes('troncal') ||
      lowerAff.includes(lowerCorridor.split(' ')[0] || '') ||
      lowerDesc.includes(route.code.toLowerCase())
    );
  });

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-5 sm:p-7 shadow-sm space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1C2A3E]">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#0070F3]/40 shadow-sm shrink-0 bg-slate-950 ring-2 ring-[#0070F3]/20">
            <img
              src="/assets/transit_bus_art.jpg"
              alt="Bus de Transporte Masivo A Tiempo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0070F3] animate-pulse shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 truncate">
                Línea de Tiempo · Ruta Sugerida
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] shrink-0">
                Puerta a Puerta
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
              Trayecto visual sincronizado desde tu salida hasta <strong className="text-slate-800 dark:text-slate-200">{destinationStop}</strong>.
            </p>
          </div>
        </div>

        {/* Master Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={handleShareArrival}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-[#DBEAFE] dark:hover:bg-[#15233a] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] font-bold rounded-xl text-xs transition cursor-pointer min-h-[36px]"
            title="Compartir llegada"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{copiedShare ? '¡Abriendo WhatsApp!' : 'Compartir Llegada'}</span>
          </button>

          {travelState === 'inactive' && (
            <button
              type="button"
              onClick={onStartTrip}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/25 cursor-pointer min-h-[36px] active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Activar Modo Salida</span>
            </button>
          )}

          {travelState === 'monitoring' && (
            <>
              <button
                type="button"
                onClick={onArrivedDestination}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer min-h-[36px] active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>¡Ya llegué!</span>
              </button>
              <button
                type="button"
                onClick={onPauseTrip}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-[#DBEAFE] dark:hover:bg-[#15233a] text-[#0060EA] dark:text-[#38BDF8] font-semibold rounded-xl text-xs border border-[#BFDBFE] dark:border-[#0080FF]/30 transition cursor-pointer min-h-[36px]"
              >
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pausar</span>
              </button>
            </>
          )}

          {travelState === 'arrived' && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 px-3 py-1.5 rounded-xl font-bold">
                <Award className="w-4 h-4 text-[#0070F3]" />
                Viaje completado
              </span>
              <button
                type="button"
                onClick={onStartTrip}
                className="text-xs text-[#0060EA] dark:text-[#38BDF8] underline cursor-pointer font-bold"
              >
                Nuevo viaje
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proximity Alarm */}
      <div className="p-4 bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0070F3] flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Alarma de Proximidad (&apos;Avísame al llegar&apos;)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Tono suave y notificación 2 paradas antes de llegar a {destinationStop}.
            </span>
          </div>
        </div>

        {onToggleWakeUpAlarm && (
          <button
            type="button"
            onClick={onToggleWakeUpAlarm}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isWakeUpAlarmActive
                ? 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#0070F3] text-[#0060EA] dark:text-[#38BDF8]'
                : 'bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isWakeUpAlarmActive ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-[#0070F3] animate-bounce" />
                <span>Alarma 2 Paradas Activa</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Activar Alarma Proximidad</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Live GPS Proximity Tracker */}
      {isWakeUpAlarmActive && (
        <div className="p-3 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#0070F3]/30 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0070F3] animate-ping shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                📡 Monitoreo GPS Activo · Corredor {route.corridor ? route.corridor.split(' ')[0] : 'Troncal'}
              </span>
              <span className="text-[11px] text-[#0060EA] dark:text-[#38BDF8]">
                Geocerca a 900m de {destinationStop}. Sonará con vibración continua 2 paradas antes.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#0070F3] text-white shrink-0">
            GPS Activo
          </span>
        </div>
      )}

      {/* Door to Door KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Salida recomendada
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatTimeAmPm(departureDate)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Paso del bus
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#0060EA] dark:text-[#38BDF8]">
            {formatTimeAmPm(busArrivalDate)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Llegada estimada
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatTimeAmPm(destinationArrivalDate)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Tiempo total estimado
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#0060EA] dark:text-[#38BDF8]">
            ~{totalDoorToDoorMins} min
          </span>
        </div>
      </div>

      {/* Visual Timeline Nodes with Numbered Blue Badges */}
      <div className="relative pl-7 sm:pl-9 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-[#1C2A3E]">
        {/* Step 1 */}
        <div className="relative group">
          <div className="absolute -left-7 sm:-left-9 top-0.5 w-6 h-6 rounded-full bg-[#0070F3] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            1
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 space-y-1.5 hover:border-[#0070F3]/40 transition">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 px-2 py-0.5 rounded-md">
                Paso 1 · Caminata ({walkingMinutes} min)
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                Empieza {formatTimeAmPm(departureDate)}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Camina hacia <strong className="text-slate-900 dark:text-white">{originStop}</strong> con {bufferMinutes} min de margen.
            </p>

            <div className="pt-1.5 space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-300 font-semibold">
                  <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                  {weather.temperatureC}°C · {weather.condition}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-300">
                  <Umbrella className="w-3.5 h-3.5 text-[#0070F3]" strokeWidth={2} />
                  Lluvia: {weather.rainProbability}%
                </span>
              </div>
              {weather.rainProbability >= 40 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-lg px-2.5 py-1 w-full break-words">
                  ⚠️ {weather.advisory}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative group">
          <div className="absolute -left-7 sm:-left-9 top-0.5 w-6 h-6 rounded-full bg-[#0070F3] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            2
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 space-y-2 hover:border-[#0070F3]/40 transition">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 px-2 py-0.5 rounded-md">
                  Paso 2 · Abordaje en Estación
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-lg text-white font-mono shadow-xs"
                  style={{ backgroundColor: route.accentColor }}
                >
                  {route.code}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#0060EA] dark:text-[#38BDF8]">
                Pasa {formatTimeAmPm(busArrivalDate)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-900 dark:text-white font-bold">
                {originStop}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Validador {cardBrand}: <strong className="text-[#0060EA] dark:text-[#38BDF8] font-mono">${fare.toLocaleString('es-CO')} COP</strong>
              </span>
            </div>

            {travelState === 'monitoring' && secondsUntilDeparture > 0 && (
              <div className="p-2.5 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#0070F3]/30 rounded-xl text-xs text-[#0060EA] dark:text-[#38BDF8] flex items-center justify-between">
                <span>Cuenta regresiva para salir:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {departureMins}m {departureSecs < 10 ? `0${departureSecs}` : departureSecs}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative group">
          <div className="absolute -left-7 sm:-left-9 top-0.5 w-6 h-6 rounded-full bg-[#0070F3] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            3
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 space-y-2 hover:border-[#0070F3]/40 transition">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-[#0E1726] border border-slate-300 dark:border-[#1C2A3E] px-2 py-0.5 rounded-md">
                Paso 3 · En Tránsito (~{rideMinutes} min de viaje)
              </span>
              <span className="text-xs font-semibold text-[#0060EA] dark:text-[#38BDF8] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Carril Prioritario
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Corredor: <span className="text-slate-900 dark:text-white font-semibold">{route.corridor || 'Corredor exclusivo de transporte'}</span>
            </p>

            {relevantAlerts.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {relevantAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{alt.title}</span>
                      <span className="text-[11px] text-amber-900/90 dark:text-amber-200/90">{alt.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0070F3] shrink-0" />
                <span>Tráfico sin bloqueos reportados en este corredor vial.</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 4 */}
        <div className="relative group">
          <div className="absolute -left-7 sm:-left-9 top-0.5 w-6 h-6 rounded-full bg-[#0070F3] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            4
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 space-y-1.5 hover:border-[#0070F3]/40 transition">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 px-2 py-0.5 rounded-md">
                Paso 4 · Llegada a Destino
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {formatTimeAmPm(destinationArrivalDate)}
              </span>
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {destinationStop}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Llegas a tiempo a tu destino. Total recorrido estimado: <strong className="text-[#0060EA] dark:text-[#38BDF8]">{totalDoorToDoorMins} minutos</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
