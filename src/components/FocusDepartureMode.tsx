import React, { useState } from 'react';
import { DepartureCalculation } from '../types/transit';
import { formatTimeAmPm } from '../utils/transitCalculator';
import { Logo } from './Logo';
import { X, Bell, BellOff, Volume2, Footprints, CheckCircle, Bus, Vibrate } from 'lucide-react';
import { isHapticsSupported } from '../utils/haptics';

interface FocusDepartureModeProps {
  calculation: DepartureCalculation;
  isAlarmActive: boolean;
  onToggleAlarm: () => void;
  onTestChime: () => void;
  onClose: () => void;
}

export const FocusDepartureMode: React.FC<FocusDepartureModeProps> = ({
  calculation,
  isAlarmActive,
  onToggleAlarm,
  onTestChime,
  onClose,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTest = () => {
    onTestChime();
    setFeedback(isHapticsSupported() ? 'Tono y vibración háptica activados' : 'Tono suave activado');
    setTimeout(() => setFeedback(null), 2500);
  };

  const {
    route,
    stopName,
    walkingMinutes,
    bufferMinutes,
    targetBusArrivalMs,
    mustLeaveAtMs,
    totalSecondsRemaining,
    urgency,
  } = calculation;

  const minutes = Math.floor(totalSecondsRemaining / 60);
  const seconds = totalSecondsRemaining % 60;
  const isLeaveNow = urgency === 'leave-now';

  return (
    <div className="fixed inset-0 z-50 bg-[#070D18] flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-200 text-slate-100">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={false} />
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-black px-2.5 py-1 rounded-lg text-white font-mono"
              style={{ backgroundColor: route.accentColor }}
            >
              {route.code}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
              Pantalla de Salida
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAlarmActive && isHapticsSupported() && (
            <span
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#38BDF8] bg-[#0E1B2E] border border-[#0080FF]/40 px-2.5 py-1.5 rounded-xl"
              title="Vibración háptica activa: patrón a los 120s y en la salida exacta"
            >
              <Vibrate className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Vibración háptica</span>
            </span>
          )}
          <button
            type="button"
            onClick={onToggleAlarm}
            className={`p-2.5 rounded-xl border transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isAlarmActive
                ? 'bg-[#0E1B2E] border-[#0080FF]/60 text-[#38BDF8]'
                : 'bg-[#0E1726] border-[#1C2A3E] text-slate-400 hover:text-white'
            }`}
            title={isAlarmActive ? 'Alarma activada' : 'Activar alarma'}
          >
            {isAlarmActive ? <Bell className="w-5 h-5 text-[#38BDF8]" /> : <BellOff className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={handleTest}
            className="p-2.5 rounded-xl bg-[#0E1726] border border-[#1C2A3E] text-slate-400 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Probar sonido y vibración háptica"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#0E1726] border border-[#1C2A3E] text-slate-400 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar modo enfoque"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {feedback && (
        <div className="max-w-md mx-auto w-full text-center text-xs text-[#38BDF8] bg-[#0E1B2E] border border-[#0080FF]/40 rounded-xl py-2 px-3 animate-in fade-in flex items-center justify-center gap-1.5 shadow-lg">
          <Vibrate className="w-4 h-4 text-[#38BDF8]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Centerpiece Hero Timer */}
      <div className="max-w-xl mx-auto w-full text-center my-auto space-y-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Cuenta regresiva para cruzar tu puerta
        </div>

        <div
          className={`font-mono font-black text-6xl sm:text-8xl md:text-9xl tabular-nums tracking-tighter ${
            isLeaveNow ? 'text-amber-400 animate-pulse' : 'text-white'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="space-y-2">
          <div className="text-xl sm:text-2xl font-bold text-[#38BDF8]">
            {isLeaveNow
              ? '¡CRUZA LA PUERTA YA!'
              : `Sal a las ${formatTimeAmPm(mustLeaveAtMs)}`}
          </div>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {route.name} · Llegada del bus a {stopName} calculada a las{' '}
            <span className="text-white font-mono font-semibold">{formatTimeAmPm(targetBusArrivalMs)}</span>
          </p>
        </div>

        {/* Journey Chips */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-300 bg-[#0E1726] border border-[#1C2A3E] p-3 rounded-2xl max-w-md mx-auto">
          <span className="flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-[#0070F3]" />
            {walkingMinutes + bufferMinutes}m caminata
          </span>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-[#0070F3]" />
            {stopName}
          </span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="max-w-md mx-auto w-full pt-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-base transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer min-h-[52px] active:scale-95"
        >
          <CheckCircle className="w-5 h-5 stroke-[2.5]" />
          <span>Ya salí / Volver al inicio</span>
        </button>
      </div>
    </div>
  );
};
