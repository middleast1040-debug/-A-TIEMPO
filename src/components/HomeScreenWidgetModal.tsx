import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  MapPin,
} from 'lucide-react';
import { Route } from '../types/transit';
import { ATiempoEmblem } from './Logo';

interface HomeScreenWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: Route;
  originStop: string;
  destinationStop: string;
  totalSecondsRemaining: number;
  cityName: string;
  cardBrand: string;
  balance?: number;
}

export const HomeScreenWidgetModal: React.FC<HomeScreenWidgetModalProps> = ({
  isOpen,
  onClose,
  currentRoute,
  originStop,
  destinationStop,
  totalSecondsRemaining,
  cityName,
  cardBrand,
  balance,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 3000);
    }
  };

  const mins = Math.floor(totalSecondsRemaining / 60);
  const secs = totalSecondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-6 sm:p-7 shadow-2xl text-left space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-white" />
            Widget de Salida Rápida
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Añadir a Pantalla de Inicio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
            Consulta los tiempos de llegada de tu bus sin abrir la aplicación.
          </p>
        </div>

        {/* Live Widget Interactive Preview */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Vista previa del Widget:
          </span>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
            {/* Widget Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ATiempoEmblem sizeClass="w-6 h-6" />
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                  A Tiempo · {cityName}
                </span>
              </div>
              <span className="text-[10px] text-[#0060EA] dark:text-[#38BDF8] font-mono font-bold bg-[#EFF6FF] dark:bg-[#0E1B2E] px-2 py-0.5 rounded-full border border-[#BFDBFE] dark:border-[#0080FF]/30">
                EN VIVO
              </span>
            </div>

            {/* Widget Main Info */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-lg text-white font-mono"
                    style={{ backgroundColor: currentRoute.accentColor }}
                  >
                    {currentRoute.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {currentRoute.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Hacia: <strong className="text-slate-800 dark:text-slate-200">{destinationStop}</strong>
                </p>
              </div>

              {/* Countdown Display */}
              <div className="text-right bg-white dark:bg-[#0E1726] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1C2A3E]">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Debes salir en
                </span>
                <span className="font-mono text-base font-black text-[#0060EA] dark:text-[#38BDF8]">
                  {mins}m {secs < 10 ? `0${secs}` : secs}s
                </span>
              </div>
            </div>

            {/* Widget Footer */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-[#1C2A3E] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0070F3]" />
                {originStop}
              </span>
              {typeof balance === 'number' && (
                <span className="font-mono text-[#0060EA] dark:text-[#38BDF8] font-bold">
                  {cardBrand}: ${balance.toLocaleString('es-CO')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-[#F8FAFC] dark:bg-[#070D18] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1C2A3E]">
          <span className="font-bold text-slate-900 dark:text-white block">Cómo añadirlo en tu teléfono:</span>
          <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <p>
              📱 <strong>Android (Chrome):</strong> Toca los tres puntos (⋮) en la esquina superior y selecciona <em>«Añadir a pantalla principal»</em> o <em>«Instalar aplicación»</em>.
            </p>
            <p>
              🍏 <strong>iPhone (Safari):</strong> Toca el botón <em>Compartir</em> (<Share2 className="w-3 h-3 inline text-[#0070F3]" />) y elige <em>«Añadir a pantalla de inicio»</em>.
            </p>
          </div>
        </div>

        {/* Install Trigger Button */}
        <button
          type="button"
          onClick={handleInstallPWA}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          {installedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>¡Instrucciones listas! Añadido a tu inicio</span>
            </>
          ) : (
            <>
              <PlusSquare className="w-4 h-4 text-white" />
              <span>Añadir Widget a mi Pantalla de Inicio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
