import React, { useState } from 'react';
import { DepartureCalculation } from '../types/transit';
import { formatTimeAmPm } from '../utils/transitCalculator';
import { CongestionChart } from './CongestionChart';
import {
  Bell,
  BellOff,
  Volume2,
  Maximize2,
  Star,
  Activity,
  TrendingUp,
  Vibrate,
  MessageCircle,
  BellRing,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { isHapticsSupported } from '../utils/haptics';
import { shareTripViaWhatsApp } from '../utils/shareTrip';
import { speakDepartureAnnouncement } from '../utils/textToSpeech';

interface DepartureResultCardProps {
  calculation: DepartureCalculation;
  isAlarmActive: boolean;
  onToggleAlarm: () => void;
  onTestChime: () => void;
  onOpenFocusMode: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isConsulting?: boolean;
  currentTimeMs?: number;
  destinationStop?: string;
  cityName?: string;
  isWakeUpAlarmActive?: boolean;
  onToggleWakeUpAlarm?: () => void;
  onTestPushNotification?: () => void;
}

export const DepartureResultCard: React.FC<DepartureResultCardProps> = ({
  calculation,
  isAlarmActive,
  onToggleAlarm,
  onTestChime,
  onOpenFocusMode,
  isFavorite,
  onToggleFavorite,
  isConsulting = false,
  currentTimeMs = Date.now(),
  destinationStop = 'Destino',
  cityName = 'Colombia',
  isWakeUpAlarmActive = false,
  onToggleWakeUpAlarm,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showTrafficDetail, setShowTrafficDetail] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);

  const handleTestChimeAndHaptics = () => {
    onTestChime();
    setTestFeedback(isHapticsSupported() ? 'Tono y vibración háptica activados' : 'Tono suave activado');
    setTimeout(() => setTestFeedback(null), 2500);
  };

  const {
    route,
    stopName,
    walkingMinutes,
    bufferMinutes,
    targetBusArrivalMs,
    nextBusArrivalMs,
    mustLeaveAtMs,
    totalSecondsRemaining,
    urgency,
    trafficReport,
  } = calculation;

  const isLeaveNow = urgency === 'leave-now';
  const minsLeft = Math.floor(totalSecondsRemaining / 60);
  const secsLeft = totalSecondsRemaining % 60;

  return (
    <div
      id="resultadoCard"
      className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl text-left relative overflow-hidden transition-colors"
    >
      {/* Top Bar: Route Code, Destination & Quick Utilities */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg text-white font-mono tracking-wide shrink-0 shadow-xs"
            style={{ backgroundColor: route.accentColor || '#0070F3' }}
          >
            {route.code}
          </span>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {route.name}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Hacia <span className="font-semibold text-slate-700 dark:text-slate-300">{destinationStop}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              isFavorite
                ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/15'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E1B2E]'
            }`}
            title={isFavorite ? 'En favoritos' : 'Guardar en favoritos'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={onOpenFocusMode}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E1B2E] transition cursor-pointer flex items-center justify-center"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Main Countdown Display */}
      {isConsulting ? (
        <div className="my-6 text-center space-y-2">
          <div className="text-2xl sm:text-3xl font-black text-[#0060EA] dark:text-[#38BDF8] animate-pulse font-mono">
            CALCULANDO...
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Consultando posición de buses y tiempos a pie...</p>
        </div>
      ) : (
        <div className="my-4 text-center space-y-1.5">
          <span
            className={`text-xs uppercase tracking-widest font-extrabold ${
              isLeaveNow ? 'text-amber-600 dark:text-amber-400' : 'text-[#0060EA] dark:text-[#38BDF8]'
            }`}
          >
            {isLeaveNow ? '¡Sal ya de tu casa!' : 'Sal de tu puerta en:'}
          </span>

          <div
            className={`text-5xl sm:text-6xl font-black tracking-tight font-mono tabular-nums leading-none ${
              isLeaveNow ? 'text-amber-600 dark:text-amber-300 animate-pulse' : 'text-slate-900 dark:text-white'
            }`}
          >
            {totalSecondsRemaining > 0 ? (
              <span className="inline-flex items-baseline gap-1">
                <span>{minsLeft}</span>
                <span className="text-xl font-bold text-slate-400 dark:text-slate-500 font-sans">m</span>
                <span className="ml-2">{secsLeft < 10 ? `0${secsLeft}` : secsLeft}</span>
                <span className="text-xl font-bold text-slate-400 dark:text-slate-500 font-sans">s</span>
              </span>
            ) : (
              '¡Hora de salir!'
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            El bus pasa por <strong className="text-slate-900 dark:text-white">{stopName}</strong> a las{' '}
            <span className="font-bold text-[#0060EA] dark:text-[#38BDF8] font-mono">
              {formatTimeAmPm(targetBusArrivalMs)}
            </span>
          </p>
        </div>
      )}

      {/* 3 Steps - Stylized with circular numbered badges */}
      <div className="bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-3.5 my-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-[#1C2A3E]">
          {/* Step 1 */}
          <div className="pt-1.5 sm:pt-0 sm:px-2 first:pt-0 first:px-0">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Salida de puerta</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
              {formatTimeAmPm(mustLeaveAtMs)}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Hora límite</span>
          </div>

          {/* Step 2 */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Caminata</span>
            </div>
            <div className="text-lg font-black text-[#0060EA] dark:text-[#38BDF8] font-mono mt-1">
              {walkingMinutes} min
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {bufferMinutes > 0 ? `+${bufferMinutes}m fila` : 'A paso normal'}
            </span>
          </div>

          {/* Step 3 */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Llegada bus</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
              {formatTimeAmPm(targetBusArrivalMs)}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">En andén</span>
          </div>
        </div>
      </div>

      {/* Traffic & Chart Quick Toggles */}
      <div className="py-1 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTrafficDetail(!showTrafficDetail);
              if (!showTrafficDetail) setShowChart(false);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer inline-flex items-center gap-1.5 ${
              showTrafficDetail
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0070F3] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent border-slate-200 dark:border-[#1C2A3E]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Tráfico</span>
            {showTrafficDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowChart(!showChart);
              if (!showChart) setShowTrafficDetail(false);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer inline-flex items-center gap-1.5 ${
              showChart
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0070F3] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent border-slate-200 dark:border-[#1C2A3E]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Congestión</span>
            {showChart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showTrafficDetail && (
          <div className="p-3 bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl text-xs text-slate-700 dark:text-slate-300">
            <span className="text-[#0060EA] dark:text-[#38BDF8] font-bold block mb-1">Estado de la vía:</span>
            <p>{trafficReport || 'Tráfico normal en el corredor principal.'}</p>
          </div>
        )}

        {showChart && (
          <div className="pt-1">
            <CongestionChart route={route} currentTimeMs={currentTimeMs} />
          </div>
        )}
      </div>

      {/* Action Buttons: WhatsApp & Voice & Arrival Alarm */}
      <div className="pt-3 pb-2 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-[#1C2A3E]">
        <button
          type="button"
          onClick={() => {
            const rideMins = route.transitMinutes || 18;
            const arrivalDate = new Date(targetBusArrivalMs + rideMins * 60 * 1000);
            shareTripViaWhatsApp({
              routeCode: route.code,
              destinationStop,
              estimatedArrivalDate: arrivalDate,
              cityName,
            });
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 2000);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-blue-100 dark:hover:bg-[#0080FF]/20 border border-[#BFDBFE] dark:border-[#0080FF]/40 text-[#0060EA] dark:text-[#38BDF8] rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />
          <span>{copiedShare ? '¡Listo!' : 'WhatsApp'}</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            setIsSpeakingVoice(true);
            await speakDepartureAnnouncement(
              `Ruta ${route.code}. Sal a las ${formatTimeAmPm(mustLeaveAtMs)}. Bus a las ${formatTimeAmPm(targetBusArrivalMs)}.`
            );
            setIsSpeakingVoice(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#070D18] hover:bg-slate-200 dark:hover:bg-[#0E1B2E] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" strokeWidth={2} />
          <span>{isSpeakingVoice ? '...' : 'Voz'}</span>
        </button>

        {onToggleWakeUpAlarm && (
          <button
            type="button"
            onClick={onToggleWakeUpAlarm}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isWakeUpAlarmActive
                ? 'bg-[#0070F3] text-white'
                : 'bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{isWakeUpAlarmActive ? 'Aviso activo' : 'Avisar al llegar'}</span>
          </button>
        )}
      </div>

      {/* Footer: Next bus & chime alerts */}
      <div className="flex items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-[#1C2A3E]">
        <div>
          <span>Siguiente bus: </span>
          <strong className="text-slate-900 dark:text-white font-mono font-bold">{formatTimeAmPm(nextBusArrivalMs)}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleAlarm}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              isAlarmActive
                ? 'bg-[#0070F3] text-white'
                : 'bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] text-slate-500 dark:text-slate-400'
            }`}
          >
            {isAlarmActive ? (
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Alarma ON
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <BellOff className="w-3 h-3" />
                Alarma OFF
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleTestChimeAndHaptics}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="Probar tono"
          >
            <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {testFeedback && (
        <div className="mt-2 text-center text-xs text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 rounded-lg py-1 px-2 flex items-center justify-center gap-1.5">
          <Vibrate className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8]" />
          <span>{testFeedback}</span>
        </div>
      )}
    </div>
  );
};
