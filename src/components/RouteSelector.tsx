import React, { useState, useMemo } from 'react';
import { Route, TransitType } from '../types/transit';
import { Footprints, ArrowRight, Loader2, ArrowLeftRight, Zap, Bus, ChevronDown, Navigation, CheckCircle2, X } from 'lucide-react';
import { findNearestStation } from '../utils/gpsTransitLocator';

interface RouteSelectorProps {
  routes: Route[];
  selectedRouteId: string;
  onSelectRouteId: (id: string) => void;
  originStop: string;
  onChangeOriginStop: (stop: string) => void;
  destinationStop: string;
  onChangeDestinationStop: (stop: string) => void;
  intermediateStops?: string[];
  onAddIntermediateStop?: () => void;
  onRemoveIntermediateStop?: (index: number) => void;
  onChangeIntermediateStop?: (index: number, stop: string) => void;
  onOpenMap?: () => void;
  availableStations?: string[];
  walkingMinutes: number;
  onChangeWalkingMinutes: (mins: number) => void;
  bufferMinutes: number;
  onChangeBufferMinutes: (mins: number) => void;
  onCalculate: () => void;
  isConsulting?: boolean;
  currentTimeMs?: number;
  cityId?: string;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRouteId,
  onSelectRouteId,
  originStop,
  onChangeOriginStop,
  destinationStop,
  onChangeDestinationStop,
  intermediateStops = [],
  onAddIntermediateStop,
  onRemoveIntermediateStop,
  onChangeIntermediateStop,
  availableStations = [],
  walkingMinutes,
  onChangeWalkingMinutes,
  bufferMinutes,
  onChangeBufferMinutes,
  onCalculate,
  isConsulting = false,
  currentTimeMs = Date.now(),
  cityId = 'bogota',
}) => {
  const [selectorMode, setSelectorMode] = useState<'origin-destination' | 'direct-route'>('origin-destination');
  const [filterType, setFilterType] = useState<'all' | TransitType>('all');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const handleGpsLocateNearest = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsMessage('Geolocalización no disponible.');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGps(false);
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestStation(latitude, longitude, cityId);
        if (nearest) {
          onChangeOriginStop(nearest.station.name);
          onChangeWalkingMinutes(nearest.walkingMinutes);
          setGpsMessage(`📍 Estación: ${nearest.station.name} (~${nearest.walkingMinutes} min a pie)`);
          setTimeout(() => setGpsMessage(null), 4500);
        } else {
          setGpsMessage('No se encontraron estaciones en tu radio.');
          setTimeout(() => setGpsMessage(null), 3500);
        }
      },
      () => {
        setIsLocatingGps(false);
        const sample = findNearestStation(4.6853, -74.0577, cityId);
        if (sample) {
          onChangeOriginStop(sample.station.name);
          onChangeWalkingMinutes(sample.walkingMinutes);
          setGpsMessage(`📍 Estación cercana: ${sample.station.name} (~${sample.walkingMinutes} min a pie)`);
          setTimeout(() => setGpsMessage(null), 4000);
        } else {
          setGpsMessage('Activa el GPS o elige tu estación de la lista.');
          setTimeout(() => setGpsMessage(null), 3500);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const allStations = useMemo(() => {
    const set = new Set<string>();
    availableStations.forEach((s) => set.add(s));
    routes.forEach((r) => {
      if (r.popularStop) set.add(r.popularStop);
      if (r.origin) set.add(r.origin);
      if (r.destination) set.add(r.destination);
      if (r.stationsList) r.stationsList.forEach((st) => set.add(st));
    });
    return Array.from(set);
  }, [routes, availableStations]);

  const handleSwapStations = () => {
    const temp = originStop;
    onChangeOriginStop(destinationStop);
    onChangeDestinationStop(temp);
  };

  const availableTypes = useMemo(() => {
    const set = new Set<TransitType>();
    routes.forEach((r) => set.add(r.type));
    return Array.from(set);
  }, [routes]);

  const typeLabels: Record<TransitType, string> = {
    transmilenio: 'Troncal TM',
    sitp: 'Zonal SITP',
    alimentador: 'Alimentador',
    metro: 'Metro',
    tranvia: 'Tranvía',
    cable: 'Cable',
    brt: 'Troncal BRT',
  };

  const walkPresets = [3, 5, 8, 12];

  const rankedBuses = useMemo(() => {
    const currentMins = new Date(currentTimeMs).getMinutes() + new Date(currentTimeMs).getSeconds() / 60;

    return routes
      .map((route) => {
        const headway = route.headwayMinutes || 6;
        const remainder = currentMins % headway;
        const waitMinutes = Math.max(1, Math.round(headway - remainder));
        const rideMinutes = route.transitMinutes || 18;
        const totalDurationMins = walkingMinutes + bufferMinutes + waitMinutes + rideMinutes;

        const lowerOrigin = originStop.toLowerCase();
        const lowerDest = destinationStop.toLowerCase();
        const lowerRouteDest = route.destination.toLowerCase();
        const lowerRouteOrig = route.origin.toLowerCase();
        const lowerRouteStop = route.popularStop.toLowerCase();

        let matchScore = 0;
        if (lowerRouteDest.includes(lowerDest) || lowerDest.includes(lowerRouteDest)) matchScore += 3;
        if (lowerRouteStop.includes(lowerOrigin) || lowerOrigin.includes(lowerRouteStop)) matchScore += 2;
        if (lowerRouteOrig.includes(lowerOrigin) || lowerOrigin.includes(lowerRouteOrig)) matchScore += 1;

        return {
          route,
          waitMinutes,
          rideMinutes,
          totalDurationMins,
          matchScore,
        };
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.totalDurationMins - b.totalDurationMins;
      });
  }, [routes, originStop, destinationStop, walkingMinutes, bufferMinutes, currentTimeMs]);

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4 text-left transition-colors">
      {/* Top Selector Modes - Subpestañas en Azul y Blanco */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1C2A3E]">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectorMode('origin-destination')}
            className={`py-2 px-3.5 rounded-lg font-bold transition-all cursor-pointer flex-1 sm:flex-initial flex items-center justify-center gap-1.5 ${
              selectorMode === 'origin-destination'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${selectorMode === 'origin-destination' ? 'text-white' : 'text-[#0060EA] dark:text-[#38BDF8]'}`} />
            <span>Por Estación</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectorMode('direct-route')}
            className={`py-2 px-3.5 rounded-lg font-bold transition-all cursor-pointer flex-1 sm:flex-initial flex items-center justify-center gap-1.5 ${
              selectorMode === 'direct-route'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bus className={`w-3.5 h-3.5 ${selectorMode === 'direct-route' ? 'text-white' : 'text-[#0060EA] dark:text-[#38BDF8]'}`} />
            <span>Por Ruta Directa</span>
          </button>
        </div>
      </div>

      {/* MODE 1: ORIGIN & DESTINATION */}
      {selectorMode === 'origin-destination' ? (
        <div className="space-y-3.5">
          {/* Origin Station Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  A
                </span>
                <span>Origen / Estación de salida:</span>
              </label>
              <button
                type="button"
                onClick={handleGpsLocateNearest}
                disabled={isLocatingGps}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] border border-[#0080FF]/40 rounded-lg transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Navigation className={`w-3 h-3 ${isLocatingGps ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span>{isLocatingGps ? 'Buscando...' : 'GPS más cercana'}</span>
              </button>
            </div>

            {gpsMessage && (
              <div className="p-2.5 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 rounded-xl text-xs text-[#0060EA] dark:text-[#38BDF8] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0070F3] dark:text-[#38BDF8] shrink-0" strokeWidth={2} />
                  <span className="truncate">{gpsMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGpsMessage(null)}
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-0.5 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative">
              <select
                value={originStop}
                onChange={(e) => onChangeOriginStop(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-300 dark:border-[#1C2A3E] rounded-xl p-3 pr-10 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm focus:outline-none focus:border-[#0070F3] transition cursor-pointer appearance-none"
              >
                {allStations.map((st) => (
                  <option key={`orig-${st}`} value={st} className="bg-white dark:bg-[#0E1726] text-slate-900 dark:text-white">
                    {st}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Swap Stations Button */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-[#1C2A3E]" />
            </div>
            <div className="relative flex justify-center">
              <button
                type="button"
                onClick={handleSwapStations}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0E1B2E] hover:bg-slate-50 dark:hover:bg-[#0080FF]/15 text-slate-700 dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/40 rounded-full text-[11px] font-bold transition shadow-xs cursor-pointer group"
                title="Invertir origen y destino"
              >
                <ArrowLeftRight className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8] group-hover:rotate-180 transition-transform duration-300" strokeWidth={2} />
                <span>Invertir (⇄)</span>
              </button>
            </div>
          </div>

          {/* Intermediate Stops */}
          {intermediateStops && intermediateStops.length > 0 && (
            <div className="space-y-2">
              {intermediateStops.map((stop, idx) => (
                <div key={`intermediate-${idx}`} className="p-2.5 bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#0070F3] text-white font-bold text-[9px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>Parada Intermedia</span>
                    </label>
                    {onRemoveIntermediateStop && (
                      <button
                        type="button"
                        onClick={() => onRemoveIntermediateStop(idx)}
                        className="text-slate-400 hover:text-red-500 text-[10px] font-semibold cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={stop}
                      onChange={(e) => onChangeIntermediateStop && onChangeIntermediateStop(idx, e.target.value)}
                      className="w-full bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-lg p-2 pr-8 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:border-[#0070F3] cursor-pointer appearance-none"
                    >
                      {allStations.map((st) => (
                        <option key={`inter-${idx}-${st}`} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Destination Station Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  B
                </span>
                <span>Destino final:</span>
              </span>
              {onAddIntermediateStop && (!intermediateStops || intermediateStops.length < 3) && (
                <button
                  type="button"
                  onClick={onAddIntermediateStop}
                  className="text-[11px] font-bold text-[#0060EA] dark:text-[#38BDF8] hover:underline cursor-pointer"
                >
                  + Parada intermedia
                </button>
              )}
            </label>
            <div className="relative">
              <select
                value={destinationStop}
                onChange={(e) => onChangeDestinationStop(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-300 dark:border-[#1C2A3E] rounded-xl p-3 pr-10 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm focus:outline-none focus:border-[#0070F3] transition cursor-pointer appearance-none"
              >
                {allStations.map((st) => (
                  <option key={`dest-${st}`} value={st} className="bg-white dark:bg-[#0E1726] text-slate-900 dark:text-white">
                    {st}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Ranked Buses List - Styled with circular numbered badges */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-white" />
                Buses disponibles
              </span>
              <span className="text-[10px] text-[#0060EA] dark:text-[#38BDF8] font-bold">Llegada más rápida primero</span>
            </div>

            <div className="space-y-2">
              {rankedBuses.slice(0, 3).map((item, index) => {
                const isSelected = item.route.id === selectedRouteId;

                return (
                  <button
                    key={item.route.id}
                    type="button"
                    onClick={() => {
                      onSelectRouteId(item.route.id);
                      onCalculate();
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#0080FF] ring-1 ring-[#0080FF]/40 shadow-xs'
                        : 'bg-slate-50/90 hover:bg-slate-100 dark:bg-[#070D18] dark:hover:bg-[#0E1B2E]/60 border-slate-200 dark:border-[#1C2A3E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      {/* Step-like circular badge */}
                      <span className="w-6 h-6 rounded-full bg-[#0070F3] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span
                        className="text-xs font-black px-2.5 py-0.5 rounded-lg text-white font-mono shrink-0 shadow-xs"
                        style={{ backgroundColor: item.route.accentColor }}
                      >
                        {item.route.code}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                          {item.route.name}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Hacia: <strong className="text-slate-700 dark:text-slate-200">{item.route.destination}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-right">
                      <div className="bg-white dark:bg-[#0E1726] px-2 py-1 rounded-lg border border-slate-200 dark:border-[#1C2A3E]">
                        <span className="text-[9px] text-slate-400 block font-medium">Paso</span>
                        <span className="font-mono text-[#0060EA] dark:text-[#38BDF8] font-black text-xs">~{item.waitMinutes}m</span>
                      </div>
                      <div className="bg-white dark:bg-[#0E1726] px-2 py-1 rounded-lg border border-slate-200 dark:border-[#1C2A3E]">
                        <span className="text-[9px] text-slate-400 block font-medium">Total</span>
                        <span className="font-mono text-slate-900 dark:text-white font-black text-xs">~{item.totalDurationMins}m</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: DIRECT ROUTE */
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 font-bold rounded-lg transition cursor-pointer text-center flex-1 min-w-[70px] ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-xs'
                  : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-[#BFDBFE] dark:border-[#1C2A3E]'
              }`}
            >
              Todas
            </button>
            {availableTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`py-1.5 px-3 font-bold rounded-lg transition cursor-pointer text-center flex-1 min-w-[80px] ${
                  filterType === t
                    ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-xs'
                    : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-[#BFDBFE] dark:border-[#1C2A3E]'
                }`}
              >
                {typeLabels[t] || t}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              id="rutaSelectDirect"
              value={selectedRouteId}
              onChange={(e) => onSelectRouteId(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-300 dark:border-[#1C2A3E] rounded-xl p-3.5 pr-10 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-[#0070F3] transition cursor-pointer appearance-none"
            >
              {routes
                .filter((r) => filterType === 'all' || r.type === filterType)
                .map((route) => (
                  <option key={route.id} value={route.id} className="bg-white dark:bg-[#0E1726] text-slate-900 dark:text-white py-2">
                    {route.code} — {route.name} ({route.popularStop})
                  </option>
                ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      )}

      {/* Walking & Buffer Settings */}
      <div className="pt-3 border-t border-slate-200 dark:border-[#1C2A3E] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />
            Caminata a la estación:
          </span>
          <span className="font-mono text-white font-bold bg-gradient-to-r from-[#0080FF] to-[#0060EA] border border-[#0080FF]/50 px-2.5 py-0.5 rounded-lg shadow-xs">
            {walkingMinutes} min
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {walkPresets.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => onChangeWalkingMinutes(mins)}
              className={`py-2 px-1 text-xs font-bold rounded-xl border transition cursor-pointer min-h-[36px] flex items-center justify-center ${
                walkingMinutes === mins
                  ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0080FF] shadow-md shadow-blue-500/25'
                  : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#BFDBFE] dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 hover:bg-[#DBEAFE] dark:hover:bg-[#15233A]'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Buffer margin */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <span>Margen por fila:</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 4].map((buf) => (
              <button
                key={buf}
                type="button"
                onClick={() => onChangeBufferMinutes(buf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[26px] ${
                  bufferMinutes === buf
                    ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                +{buf}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calculate / Consult Trigger Button - Vibrant Gradient */}
      <button
        type="button"
        id="btnConsultar"
        disabled={isConsulting}
        onClick={onCalculate}
        className={`w-full bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] active:scale-[0.99] text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 min-h-[46px] ${
          isConsulting ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {isConsulting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consultando tiempos de llegada...</span>
          </>
        ) : (
          <>
            <span>Calcular Hora de Salida</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </>
        )}
      </button>
    </div>
  );
};
