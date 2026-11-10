import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Zap } from 'lucide-react';
import { TransitCitySystem } from '../data/colombiaTransit';
import { formatTimeAmPm } from '../utils/transitCalculator';

interface TransferWindowWidgetProps {
  citySystem: TransitCitySystem;
  onOpenCardManager?: () => void;
}

interface TransferSession {
  startTimeMs: number;
  windowDurationMins: number;
  transfersUsed: number;
  maxTransfers: number;
}

export const TransferWindowWidget: React.FC<TransferWindowWidgetProps> = ({
  citySystem,
}) => {
  const defaultWindowMins = citySystem.transferWindowMinutes || (citySystem.id === 'bogota' ? 125 : citySystem.id === 'cali' ? 100 : 90);

  const [session, setSession] = useState<TransferSession | null>(() => {
    try {
      const saved = localStorage.getItem('atiempo_transfer_session_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const elapsed = (Date.now() - parsed.startTimeMs) / (60 * 1000);
        if (elapsed < parsed.windowDurationMins) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartWindow = (minutesAgo = 0) => {
    const newSession: TransferSession = {
      startTimeMs: Date.now() - minutesAgo * 60 * 1000,
      windowDurationMins: defaultWindowMins,
      transfersUsed: 0,
      maxTransfers: 2,
    };
    setSession(newSession);
    try {
      localStorage.setItem('atiempo_transfer_session_v2', JSON.stringify(newSession));
    } catch {
      // ignore
    }
  };

  const handleRegisterTransfer = () => {
    if (!session) return;
    const updated: TransferSession = {
      ...session,
      transfersUsed: Math.min(session.maxTransfers, session.transfersUsed + 1),
    };
    setSession(updated);
    try {
      localStorage.setItem('atiempo_transfer_session_v2', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setSession(null);
    try {
      localStorage.removeItem('atiempo_transfer_session_v2');
    } catch {
      // ignore
    }
  };

  const elapsedMs = session ? Math.max(0, nowMs - session.startTimeMs) : 0;
  const totalWindowMs = session ? session.windowDurationMins * 60 * 1000 : defaultWindowMins * 60 * 1000;
  const remainingMs = session ? Math.max(0, totalWindowMs - elapsedMs) : 0;
  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));
  const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
  const percentRemaining = session ? Math.max(0, Math.min(100, (remainingMs / totalWindowMs) * 100)) : 100;
  const isExpiringSoon = session && remainingMinutes <= 15 && remainingMinutes > 0;
  const isExpired = session && remainingMs <= 0;

  const expirationDate = session ? new Date(session.startTimeMs + totalWindowMs) : null;
  const estimatedSavings = session ? session.transfersUsed * citySystem.fare : 0;

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-lg text-left transition-colors space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1C2A3E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0060EA] dark:text-[#38BDF8]" />
              Ventana de Transbordo $0 COP
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {citySystem.name} ({citySystem.systemName}) · Ventana oficial de {defaultWindowMins} minutos con tarjeta {citySystem.cardBrand}.
          </p>
        </div>

        {session && !isExpired && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#070D18] hover:bg-slate-200 dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] transition cursor-pointer font-medium"
          >
            Finalizar viaje
          </button>
        )}
      </div>

      {!session || isExpired ? (
        /* Standby / Activation State */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                ¿Vas a pasar la tarjeta o acabas de entrar a la estación?
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inicia el cronómetro para saber exactamente cuánto tiempo te queda de transbordo gratis ($0 COP).
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStartWindow(0)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Marcar Entrada Ahora</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>¿Entraste antes? Ajusta el inicio:</span>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleStartWindow(mins)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] text-white transition cursor-pointer font-bold shadow-xs active:scale-95"
                >
                  Hace {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Countdown State */
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Visual Ring / Countdown Metric */}
            <div className="md:col-span-5 flex items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-[#1C2A3E]"
                    strokeWidth="7"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke={isExpiringSoon ? '#f59e0b' : '#0070F3'}
                    strokeWidth="7"
                    strokeDasharray={263.89}
                    strokeDashoffset={263.89 * (1 - percentRemaining / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-2xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {String(remainingMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    restantes
                  </span>
                </div>
              </div>
            </div>

            {/* Status Breakdown & Details */}
            <div className="md:col-span-7 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                      isExpiringSoon
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                        : 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-xs font-bold'
                    }`}
                  >
                    {isExpiringSoon ? 'Vence en menos de 15 min' : 'Transbordo $0 COP Activo'}
                  </span>
                  {expirationDate && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Vence a las <strong className="text-slate-800 dark:text-slate-200">{formatTimeAmPm(expirationDate.getTime())}</strong>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  Tu próximo paso por torniquete de bus zonal, alimentación o transferencia no te cobrará pasaje completo.
                </p>
              </div>

              {/* Transfers Used tracker */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Transbordos usados:</span>
                  <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                    {session.transfersUsed} / {session.maxTransfers} permitidos
                  </div>
                </div>

                {session.transfersUsed < session.maxTransfers && (
                  <button
                    type="button"
                    onClick={handleRegisterTransfer}
                    className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-blue-100 dark:hover:bg-[#15233A] text-[#0060EA] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-[#0080FF]/40 text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    + Registrar Transbordo
                  </button>
                )}
              </div>

              {estimatedSavings > 0 && (
                <div className="text-xs text-[#0060EA] dark:text-[#38BDF8] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Has ahorrado ${estimatedSavings.toLocaleString('es-CO')} COP en este viaje.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
