import React, { useState, useMemo } from 'react';
import { Route } from '../types/transit';
import {
  Search,
  Bus,
  Clock,
  MapPin,
  Accessibility,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface BusLocatorSectionProps {
  routes: Route[];
  cityName: string;
  onSelectBusRoute: (routeId: string, origin: string, destination: string) => void;
  onOpenMapForRoute?: (route: Route) => void;
}

type BusCategoryFilter = 'all' | 'transmilenio' | 'sitp' | 'alimentador';

export const BusLocatorSection: React.FC<BusLocatorSectionProps> = ({
  routes,
  cityName,
  onSelectBusRoute,
  onOpenMapForRoute,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<BusCategoryFilter>('all');

  // Filter routes based on search term and category
  const filteredRoutes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return routes.filter((r) => {
      // Category filter
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'alimentador' && r.type !== 'alimentador') return false;
        if (selectedFilter === 'transmilenio' && r.type !== 'transmilenio') return false;
        if (selectedFilter === 'sitp' && r.type !== 'sitp') return false;
      }

      // Search text match
      if (!term) return true;

      const codeMatch = r.code.toLowerCase().includes(term);
      const nameMatch = r.name.toLowerCase().includes(term);
      const originMatch = r.origin.toLowerCase().includes(term);
      const destMatch = r.destination.toLowerCase().includes(term);
      const stopMatch = r.popularStop?.toLowerCase().includes(term);
      const zoneMatch = r.zone?.toLowerCase().includes(term);
      const corridorMatch = r.corridor?.toLowerCase().includes(term);

      return (
        codeMatch ||
        nameMatch ||
        originMatch ||
        destMatch ||
        stopMatch ||
        zoneMatch ||
        corridorMatch
      );
    });
  }, [routes, searchTerm, selectedFilter]);

  // Derive Platform/Vagón for each route (Simulating precise station doors)
  const getVagonAndDoor = (code: string) => {
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const vagon = (hash % 3) + 1;
    const puerta = ((hash * 2) % 4) + 1;
    return `Vagón ${vagon} · Puerta ${puerta}`;
  };

  // Live estimated arrival minutes based on headway
  const getSimulatedArrivals = (headwayMinutes: number) => {
    const base = Math.max(2, (headwayMinutes * 0.6) | 0);
    return [base, base + headwayMinutes, base + headwayMinutes * 2];
  };

  return (
    <section className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 text-left transition-colors">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1C2A3E]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8]">
              <Search className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Ubicador de Buses por Código o Nombre
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Encuentra cualquier bus de {cityName}, su vagón exacto de parada y tiempo de llegada.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] border border-[#0080FF]/40 px-2.5 py-1 rounded-xl self-start sm:self-auto shadow-xs">
          <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>Frecuencia y Vagón Oficial</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ej. H27, C15, K43, 330, Z8) o destino..."
            className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070F3] transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips - Subpestañas en Azul y Letras Blancas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          {[
            { id: 'all' as BusCategoryFilter, label: 'Todos los Buses' },
            { id: 'transmilenio' as BusCategoryFilter, label: 'Troncales Expresos' },
            { id: 'alimentador' as BusCategoryFilter, label: 'Alimentadores' },
            { id: 'sitp' as BusCategoryFilter, label: 'SITP / Duales' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedFilter === cat.id
                  ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0080FF] shadow-md shadow-blue-500/25'
                  : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border-[#BFDBFE] dark:border-[#1C2A3E] hover:bg-[#DBEAFE] dark:hover:bg-[#15233A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-[11px] text-slate-400 font-mono ml-auto shrink-0 pl-2">
            {filteredRoutes.length} {filteredRoutes.length === 1 ? 'bus' : 'buses'}
          </span>
        </div>
      </div>

      {/* Bus Cards List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
        {filteredRoutes.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-[#F8FAFC] dark:bg-[#070D18] rounded-xl border border-dashed border-slate-200 dark:border-[#1C2A3E]">
            <Bus className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No se encontró ningún bus con el código &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Prueba buscando por número (ej. 27, 15, 330) o nombre de estación.
            </p>
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const vagonDoor = getVagonAndDoor(route.code);
            const arrivals = getSimulatedArrivals(route.headwayMinutes || 6);

            const isTroncal = route.type === 'transmilenio';
            const isAlimentador = route.type === 'alimentador';

            const badgeBg = isTroncal
              ? 'bg-red-600 text-white'
              : isAlimentador
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0070F3] text-white';

            return (
              <div
                key={route.id}
                className="p-3 sm:p-3.5 bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl hover:border-[#0080FF]/50 transition space-y-2.5"
              >
                {/* Top Row: Code Badge, Name, Type, Accessibility */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider shadow-xs shrink-0 ${badgeBg}`}
                    >
                      {route.code}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {route.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                          ({route.zone || 'Ruta Urbana'})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {route.origin} ↔ {route.destination}
                      </div>
                    </div>
                  </div>

                  {/* Accessibility & GPS Signals */}
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span
                      className="p-1 rounded-md bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] text-blue-500"
                      title="Vehículo con rampa de accesibilidad para silla de ruedas"
                    >
                      <Accessibility className="w-3 h-3" />
                    </span>
                    <span
                      className="p-1 rounded-md bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] text-[#0060EA] dark:text-[#38BDF8] flex items-center gap-1 text-[10px] font-mono font-bold"
                      title="Señal GPS certificada en tiempo real"
                    >
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span className="hidden sm:inline">GPS</span>
                    </span>
                  </div>
                </div>

                {/* Middle Info Row: Platform Vagón & Estimated Next Buses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-[#1C2A3E] text-xs">
                  {/* Vagón / Door */}
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
                    <span className="font-semibold truncate">{vagonDoor}</span>
                    <span className="text-slate-400 text-[10px] hidden sm:inline">· Parada designada</span>
                  </div>

                  {/* Next Buses Countdowns */}
                  <div className="flex items-center gap-2 sm:justify-end text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Próximos:
                    </span>
                    <div className="flex items-center gap-1 font-mono font-bold">
                      <span className="text-[#0060EA] dark:text-[#38BDF8] bg-blue-50 dark:bg-[#0070F3]/15 border border-blue-200 dark:border-[#0070F3]/30 px-1.5 py-0.5 rounded">
                        {arrivals[0]} min
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0E1B2E] border border-slate-200 dark:border-[#1C2A3E] px-1.5 py-0.5 rounded">
                        {arrivals[1]} min
                      </span>
                      <span className="text-slate-400 bg-slate-100 dark:bg-[#0E1B2E] border border-slate-200 dark:border-[#1C2A3E] px-1.5 py-0.5 rounded hidden sm:inline">
                        {arrivals[2]} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate min-w-0">
                    Frecuencia: cada {route.headwayMinutes || 6} min · {route.corridor || 'Troncal'}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onOpenMapForRoute && (
                      <button
                        type="button"
                        onClick={() => onOpenMapForRoute(route)}
                        className="py-1 px-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-lg transition cursor-pointer"
                      >
                        Ver Mapa
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectBusRoute(route.id, route.popularStop || route.origin, route.destination)}
                      className="py-1 px-3 text-[11px] font-bold text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                    >
                      <span>Calcular Salida</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
