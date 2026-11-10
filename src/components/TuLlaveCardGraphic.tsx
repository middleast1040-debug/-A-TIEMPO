import React, { useState } from 'react';
import { TuLlaveCard, TULLAVE_FARES } from '../types/tullave';
import { formatCopCurrency, formatCardNumber, calculateTrips } from '../utils/tullaveStorage';
import { COLOMBIA_SYSTEMS } from '../data/colombiaTransit';
import { Eye, EyeOff, Radio, CheckCircle2, Clock, RefreshCw, Bike, Ticket } from 'lucide-react';

interface TuLlaveCardGraphicProps {
  card: TuLlaveCard;
  fare?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export interface CardTypeDisplayInfo {
  label: string;
  desc: string;
  badgeClass?: string;
}

export function getCardTypeDisplay(card: TuLlaveCard, cityId?: string): CardTypeDisplayInfo {
  const city = cityId || card.cityId || 'bogota';

  // Medellín (Metro / Cívica)
  if (city === 'medellin') {
    switch (card.type) {
      case 'personalizada':
        return { label: 'Cívica Personalizada', desc: 'Integración Metro • Tarifa Cívica' };
      case 'basica':
        return { label: 'Cívica Al Portador', desc: 'Sin personalizar • Tarifa Plena' };
      case 'sisben':
        return { label: 'Cívica Tarifa Social', desc: 'Subsidio Metro Medellín' };
      case 'adulto_mayor':
        return { label: 'Cívica Adulto Mayor', desc: 'Beneficio Preferencial +62' };
      case 'estudiantil':
        return { label: 'Cívica Estudiantil', desc: 'Convenio Metro Estudiantil' };
      default:
        return { label: 'Cívica Metro', desc: 'Metro de Medellín • Metroplús' };
    }
  }

  // Cali (MÍO)
  if (city === 'cali') {
    switch (card.type) {
      case 'personalizada':
        return { label: 'MÍO Personalizada', desc: 'Integración MÍO • Viaje a Crédito' };
      case 'basica':
        return { label: 'MÍO Al Portador', desc: 'Al Portador • Tarifa Regular' };
      case 'sisben':
        return { label: 'MÍO Tarifa Social', desc: 'Subsidio Alcaldía de Cali' };
      case 'adulto_mayor':
        return { label: 'MÍO Adulto Mayor', desc: 'Tarifa Preferencial +62' };
      case 'estudiantil':
        return { label: 'MÍO Estudiantil', desc: 'Convenio Estudiantil MÍO' };
      default:
        return { label: 'Tarjeta MÍO', desc: 'Masivo Integrado de Occidente' };
    }
  }

  // Barranquilla (Transmetro)
  if (city === 'barranquilla') {
    switch (card.type) {
      case 'personalizada':
        return { label: 'Transmetro Personalizada', desc: 'Rutas Troncales & Alimentadoras' };
      case 'basica':
        return { label: 'Transmetro Al Portador', desc: 'Tarjeta Recargable Estándar' };
      case 'sisben':
        return { label: 'Transmetro Sisbén', desc: 'Subsidio Distrital' };
      case 'adulto_mayor':
        return { label: 'Transmetro Adulto Mayor', desc: 'Tarifa Preferencial' };
      default:
        return { label: 'Tarjeta Transmetro', desc: 'Sistema Masivo Barranquilla' };
    }
  }

  // Bogotá (TuLlave / SITP)
  if (card.transMiPassPlan?.isActive) {
    return { label: 'TransMiPass Oficial', desc: 'Abono 65 Ingresos / 30 Días' };
  }

  switch (card.type) {
    case 'personalizada':
      return { label: 'TuLlave Personalizada', desc: 'Transbordo $0 • 2 Viajes a Crédito' };
    case 'basica':
      return { label: 'TuLlave Básica (Verde)', desc: 'Al Portador • Tarifa Estándar' };
    case 'sisben':
      return { label: 'TuLlave Subsidio Sisbén', desc: 'Subsidio Oficial • Tarifa Reducida' };
    case 'adulto_mayor':
      return { label: 'TuLlave Adulto Mayor', desc: 'Beneficio Preferencial +62' };
    case 'estudiantil':
      return { label: 'TuLlave Estudiantil', desc: 'Subsidio Escolar Distrital' };
    case 'eventual':
      return { label: 'TuLlave Univiaje', desc: 'Viaje Único / Turista' };
    default:
      return { label: 'Tarjeta TuLlave', desc: 'SITP • TransMilenio' };
  }
}

export const TuLlaveCardGraphic: React.FC<TuLlaveCardGraphicProps> = ({
  card,
  fare,
  onRefresh,
  isRefreshing = false,
}) => {
  const [showFullNumber, setShowFullNumber] = useState(false);

  // Match system configuration
  const cityKey = card.cityId || 'bogota';
  const systemConfig = COLOMBIA_SYSTEMS[cityKey] || COLOMBIA_SYSTEMS.bogota;
  const currentFare = fare || systemConfig.fare || TULLAVE_FARES.TRANSMILENIO;

  const trips = calculateTrips(card.balance, currentFare);
  const isPersonalizada = card.type === 'personalizada';
  const hasPending = card.pendingWebRecharge > 0;
  const typeConfig = getCardTypeDisplay(card, cityKey);


  // Authentically colored Physical Cards of Colombia
  const getCardStyle = () => {
    if (cityKey === 'medellin') {
      return {
        name: 'Cívica',
        subtitle: 'Metro de Medellín • Metroplús',
        gradient: 'from-[#006644] via-[#00875A] to-[#044B34]',
        border: 'border-emerald-400/30',
        accent: 'text-emerald-300',
        glow: 'bg-emerald-400/20',
      };
    }

    if (cityKey === 'cali') {
      return {
        name: 'MÍO',
        subtitle: 'Masivo Integrado de Occidente',
        gradient: 'from-[#1E3A8A] via-[#1D4ED8] to-[#C2410C]',
        border: 'border-blue-400/30',
        accent: 'text-orange-300',
        glow: 'bg-blue-500/20',
      };
    }

    if (cityKey === 'barranquilla') {
      return {
        name: 'Transmetro',
        subtitle: 'Barranquilla • Soledad',
        gradient: 'from-[#C2410C] via-[#EA580C] to-[#7C2D12]',
        border: 'border-orange-400/30',
        accent: 'text-amber-300',
        glow: 'bg-orange-500/20',
      };
    }

    // Bogotá TuLlave variants:
    if (card.type === 'basica') {
      // Iconic TuLlave Verde Física
      return {
        name: 'TuLlave Básica',
        subtitle: 'Tarjeta Verde Clásica • Al Portador',
        gradient: 'from-[#14532D] via-[#15803D] to-[#166534]',
        border: 'border-green-400/30',
        accent: 'text-emerald-300',
        glow: 'bg-emerald-500/20',
      };
    }

    // Default: Iconic TuLlave Personalizada Roja Física
    return {
      name: 'TuLlave Plus',
      subtitle: 'Tarjeta Roja Personalizada • SITP / TransMilenio',
      gradient: 'from-[#7F1D1D] via-[#B91C1C] to-[#991B1B]',
      border: 'border-red-400/30',
      accent: 'text-rose-200',
      glow: 'bg-red-500/20',
    };
  };

  const cardTheme = getCardStyle();
  const brandName = cardTheme.name;

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${cardTheme.gradient} border ${cardTheme.border} p-5 sm:p-6 shadow-xl transition-all`}>
      {/* Subtle geometric overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="card-grid-pattern" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 36 M 0 0 L 36 36" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#card-grid-pattern)" className={cardTheme.accent} />
        </svg>
      </div>

      {/* Dynamic Glow */}
      <div className={`absolute -top-12 -right-12 w-44 h-44 ${cardTheme.glow} rounded-full blur-2xl pointer-events-none`} />

      {/* Card Header Row: Brand + Type Badge */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20">
            <span className="text-xs font-black tracking-wider uppercase text-white">
              {brandName}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-widest hidden sm:inline">
            {cardTheme.subtitle}
          </span>
        </div>

        {/* Contactless waves & Card Type */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/90">
            {typeConfig.label}
          </span>
          <div className="text-white/80 p-0.5" title="Tarjeta inteligente sin contacto">
            <Radio className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Chip and Masked Number */}
      <div className="relative z-10 my-4 flex items-center justify-between">
        {/* Authentic EMV Chip Graphic */}
        <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/80 shadow-sm flex items-center justify-center p-1">
          <div className="w-full h-full border border-amber-800/40 rounded-xs flex flex-col justify-between py-0.5">
            <div className="w-full h-px bg-amber-800/40" />
            <div className="w-full h-px bg-amber-800/40" />
          </div>
        </div>

        {/* Card Number with toggle */}
        <div className="flex items-center gap-2 text-white/90 font-mono text-xs sm:text-sm tracking-wider">
          <span>{formatCardNumber(card.serialNumber, !showFullNumber)}</span>
          <button
            type="button"
            onClick={() => setShowFullNumber(!showFullNumber)}
            className="text-white/70 hover:text-white p-1 transition cursor-pointer"
            aria-label={showFullNumber ? 'Ocultar número de tarjeta' : 'Ver número completo de tarjeta'}
            title={showFullNumber ? 'Ocultar número' : 'Ver número completo'}
          >
            {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Balance Section */}
      <div className="relative z-10 pt-1 pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span className="text-xs uppercase tracking-wider text-white/70 font-bold">
            Saldo Disponible
          </span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs text-white flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 shadow-xs whitespace-nowrap shrink-0 active:scale-95 font-bold"
              title="Actualizar saldo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
              <span className="whitespace-nowrap">{isRefreshing ? 'Consultando...' : 'Consultar Saldo'}</span>
            </button>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono tabular-nums">
            {formatCopCurrency(card.balance)}
          </span>
          <span className="text-xs font-bold text-white/80">COP</span>
        </div>

        {/* Available Trips Breakdown */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white font-bold bg-black/40 border border-white/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            <span>{trips} {trips === 1 ? 'viaje disponible' : 'viajes disponibles'}</span>
          </span>
          <span className="text-white/70 font-medium">
            (${currentFare.toLocaleString('es-CO')} c/u)
          </span>

          {card.transMiPassPlan?.isActive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg">
              <Ticket className="w-3 h-3 text-cyan-300" />
              <span>TransMiPass: {card.transMiPassPlan.totalPasses - card.transMiPassPlan.usedPasses} viajes</span>
            </span>
          )}

          {card.transMiBici?.isRegistered && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-lg">
              <Bike className="w-3 h-3 text-amber-300" />
              <span>TransMiBici: {card.transMiBici.tripsTowardsFreePass}/30 para $0</span>
            </span>
          )}

          {isPersonalizada && card.creditTripsRemaining > 0 && (
            <span className="text-white/80 font-medium hidden sm:inline">
              · {card.creditTripsRemaining} viajes a crédito
            </span>
          )}
        </div>
      </div>

      {/* Pending Web Recharge Notice if any */}
      {hasPending && (
        <div className="relative z-10 mb-3 bg-black/50 border border-amber-400/50 rounded-xl p-3 text-xs text-amber-200 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" strokeWidth={2} />
            <span className="truncate">
              Recarga web pendiente por activar:{' '}
              <strong className="text-white font-mono">{formatCopCurrency(card.pendingWebRecharge)}</strong>
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md border border-amber-500/60 shrink-0">
            Activar en Tótem
          </span>
        </div>
      )}

      {/* Card Footer: Cardholder Name & Benefits */}
      <div className="relative z-10 border-t border-white/20 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="min-w-0">
          <span className="block text-[10px] uppercase tracking-wider text-white/60 font-bold">
            Titular
          </span>
          <span className="font-bold text-white tracking-wide truncate block">
            {card.cardholderName || 'AL PORTADOR'}
          </span>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[11px] font-semibold text-white/90 bg-black/40 px-2.5 py-1 rounded-lg border border-white/20 inline-block shadow-2xs">
            {typeConfig.desc}
          </span>
        </div>
      </div>
    </div>
  );
};
