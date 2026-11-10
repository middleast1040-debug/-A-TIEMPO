import React from 'react';
import { TuLlaveCard } from '../types/tullave';
import { formatCopCurrency, formatCardNumber, calculateTrips } from '../utils/tullaveStorage';
import { CreditCard, Zap, RefreshCw, AlertTriangle, Radio, ChevronRight, Ticket, Bike } from 'lucide-react';

import { TuLlaveCardGraphic, getCardTypeDisplay } from './TuLlaveCardGraphic';

interface TuLlaveQuickWidgetProps {
  card: TuLlaveCard;
  fare?: number;
  citySystemName?: string;
  onOpenModal: (tab?: 'saldo' | 'transmipass' | 'transmibici' | 'recargar' | 'servicios' | 'historial') => void;
  onQuickRefresh: () => void;
  isRefreshing?: boolean;
}

export const TuLlaveQuickWidget: React.FC<TuLlaveQuickWidgetProps> = ({
  card,
  fare = 3550,
  citySystemName = 'TuLlave (Bogotá)',
  onOpenModal,
  onQuickRefresh,
  isRefreshing = false,
}) => {
  const currentFare = fare > 0 ? fare : 3550;
  const trips = calculateTrips(card.balance, currentFare);
  const isLowBalance = card.balance < currentFare * 2;
  const hasPending = card.pendingWebRecharge > 0;
  const cardBrand = card.systemBrand || (card.cityId === 'medellin' ? 'Cívica' : card.cityId === 'cali' ? 'MÍO' : 'TuLlave');
  const typeDisplay = getCardTypeDisplay(card, card.cityId);

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3.5 text-left transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1C2A3E]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#0070F3]/20 border border-blue-200 dark:border-[#0070F3]/40 text-[#0060EA] dark:text-[#38BDF8] shrink-0">
            <CreditCard className="w-4 h-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Mi Tarjeta {cardBrand}
              </h3>
              <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] px-2.5 py-0.5 rounded-full font-mono shrink-0 shadow-xs">
                {typeDisplay.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {formatCardNumber(card.serialNumber, true)} · {citySystemName}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onQuickRefresh}
          disabled={isRefreshing}
          className="shrink-0 text-xs text-white hover:text-white px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 font-bold shadow-xs active:scale-95"
          title="Consultar saldo"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
          <span className="hidden sm:inline">{isRefreshing ? 'Consultando...' : 'Consultar'}</span>
        </button>
      </div>

      {/* Main Balance */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#070D18] rounded-xl border border-slate-200 dark:border-[#1C2A3E]">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Saldo</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCopCurrency(card.balance)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Viajes</span>
          <div className="mt-0.5">
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md inline-block ${
                isLowBalance
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                  : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] text-[#0060EA] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-[#0080FF]/30'
              }`}
            >
              {trips} {trips === 1 ? 'viaje' : 'viajes'}
            </span>
          </div>
        </div>
      </div>

      {/* TransMiPass & TransMiBici Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenModal('transmipass')}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0E1B2E] dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#0080FF]/30 text-left transition cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">TransMiPass</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">65 viajes · $160.000 COP</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('transmibici')}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0E1B2E] dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#0080FF]/30 text-left transition cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bike className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">TransMiBici</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">26 cicloparqueaderos $0</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
        </button>
      </div>

      {/* Alerts */}
      {hasPending && (
        <div className="p-2.5 bg-amber-50 dark:bg-[#0E1B2E] border border-amber-300 dark:border-amber-500/40 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 min-w-0">
            <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Recarga pendiente: {formatCopCurrency(card.pendingWebRecharge)}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenModal('servicios')}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
          >
            Activar en tótem
          </button>
        </div>
      )}

      {isLowBalance && !hasPending && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Te quedan {trips} pasajes. Recarga con tiempo.</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenModal('recargar')}
            className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] shrink-0 cursor-pointer"
          >
            Recargar
          </button>
        </div>
      )}

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onOpenModal('recargar')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Recargar Tarjeta</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('saldo')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-blue-100 dark:hover:bg-[#0080FF]/20 text-[#0060EA] dark:text-[#38BDF8] font-bold rounded-xl text-xs border border-[#BFDBFE] dark:border-[#0080FF]/40 transition cursor-pointer"
        >
          <span>Gestión & Tótems</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />
        </button>
      </div>
    </div>
  );
};
