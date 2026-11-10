import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Bell,
  BellOff,
  Smartphone,
  HeartHandshake,
  Compass,
  Clock,
  WifiOff,
  ShieldCheck,
  Check,
  BookOpen,
} from 'lucide-react';
import { TuLlaveCard } from '../types/tullave';

interface SubscriptionFooterSectionProps {
  isSubscribed: boolean;
  onOpenSubscriptionModal: () => void;
  cityName?: string;
  activeCard?: TuLlaveCard;
  onOpenTutorial?: () => void;
}

export const SubscriptionFooterSection: React.FC<SubscriptionFooterSectionProps> = ({
  isSubscribed,
  onOpenSubscriptionModal,
  activeCard,
  onOpenTutorial,
}) => {
  const isPreferentialProfile =
    activeCard &&
    (activeCard.type === 'sisben' ||
      activeCard.type === 'adulto_mayor' ||
      activeCard.type === 'estudiantil' ||
      activeCard.type === 'discapacidad');

  const [renewalReminderEnabled, setRenewalReminderEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('atiempo_renewal_reminder_v1') !== 'false';
    } catch {
      return true;
    }
  });

  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const toggleRenewalReminder = () => {
    const nextState = !renewalReminderEnabled;
    setRenewalReminderEnabled(nextState);
    try {
      localStorage.setItem('atiempo_renewal_reminder_v1', String(nextState));
    } catch {
      // ignore
    }
    setReminderToast(
      nextState
        ? 'Aviso preventivo activado (3 días antes).'
        : 'Aviso preventivo pausado.'
    );
    setTimeout(() => setReminderToast(null), 3000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto mt-6 pt-4 border-t border-slate-200 dark:border-[#1C2A3E] text-left space-y-4 transition-colors">
      {/* 1. SINOPSIS MINIMALISTA DE «A TIEMPO» */}
      <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-[#1C2A3E]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8]">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              A Tiempo · Movilidad de Precisión
            </h3>
          </div>

          {onOpenTutorial && (
            <button
              type="button"
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-[#DBEAFE] dark:hover:bg-[#15233A] border border-[#BFDBFE] dark:border-[#0080FF]/40 rounded-xl transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tutorial</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Calcula el minuto y segundo exacto para salir de tu puerta y abordar tu bus sin filas ni esperas en el andén.
        </p>

        {/* 3 Pilares Compactos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Salida Sincronizada</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Alarma 2 Paradas Antes</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Consulta 100% Offline</span>
          </div>
        </div>
      </div>

      {/* 2. APORTE / SUBSIDIO COMPACTO */}
      <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 px-2 py-0.5 rounded-full font-mono">
                Sostenibilidad
              </span>
              {isPreferentialProfile && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] bg-blue-50 dark:bg-[#0070F3]/15 border border-blue-200 dark:border-[#0070F3]/30 px-2 py-0.5 rounded-full font-mono">
                  Subsidio $0 COP Activo
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Aporte para la Aplicación
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {isPreferentialProfile
                ? 'Subsidio social verificado. Tienes acceso total gratuito a todas las herramientas.'
                : 'Con tu aporte mantendremos el servicio actualizado, efectivo y sin publicidad para tu viaje diario.'}
            </p>
          </div>

          <div className="shrink-0">
            {isPreferentialProfile ? (
              <div className="px-3 py-2 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#0070F3]" />
                <span>Pase Libre Activo ($0)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubscribed ? 'Ver Mi Aporte' : 'Realizar un Aporte'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Recordatorio preventivo si está suscrito */}
        {isSubscribed && !isPreferentialProfile && (
          <div className="pt-2 border-t border-slate-100 dark:border-[#1C2A3E] flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Aviso preventivo a 3 días de vencimiento
            </span>
            <button
              type="button"
              onClick={toggleRenewalReminder}
              className="text-[11px] font-bold text-[#0060EA] dark:text-[#38BDF8] hover:underline cursor-pointer"
            >
              {renewalReminderEnabled ? 'Activo (Desactivar)' : 'Desactivado (Activar)'}
            </button>
          </div>
        )}

        {reminderToast && (
          <div className="text-center text-xs text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 rounded-xl py-1.5 px-2.5 animate-in fade-in">
            {reminderToast}
          </div>
        )}
      </div>
    </section>
  );
};
