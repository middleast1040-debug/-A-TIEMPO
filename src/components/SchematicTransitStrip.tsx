import React from 'react';
import { Route } from '../types/transit';
import { MapPin, Navigation } from 'lucide-react';

interface SchematicTransitStripProps {
  route: Route;
  originStop: string;
  destinationStop: string;
  intermediateStops?: string[];
  onSelectStation?: (stationName: string) => void;
}

export const SchematicTransitStrip: React.FC<SchematicTransitStripProps> = ({
  route,
  originStop,
  destinationStop,
  intermediateStops = [],
  onSelectStation,
}) => {
  const baseStations = route.stationsList && route.stationsList.length > 0
    ? [...route.stationsList]
    : [route.origin, route.popularStop, route.destination].filter(Boolean);

  const stations = React.useMemo(() => {
    const list = [...baseStations];
    intermediateStops.forEach((inter) => {
      if (inter && !list.some((s) => s.toLowerCase() === inter.toLowerCase())) {
        const destIdx = list.findIndex((s) => s.toLowerCase().includes(destinationStop.toLowerCase()));
        if (destIdx > 0) {
          list.splice(destIdx, 0, inter);
        } else {
          list.push(inter);
        }
      }
    });
    return list;
  }, [baseStations, intermediateStops, destinationStop]);

  const accentColor = route.accentColor || '#0070F3';

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-sm dark:shadow-lg transition-colors">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-lg text-white font-bold font-mono text-[11px] shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            {route.code}
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Esquema de Paradas ({stations.length} estaciones)
          </span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          ~{route.transitMinutes} min en bus
        </span>
      </div>

      {/* Horizontal Tube Line Diagram */}
      <div className="relative pt-2 pb-1 overflow-x-auto no-scrollbar">
        <div className="flex items-start gap-4 min-w-[540px] relative px-2">
          {/* Connecting Line */}
          <div
            className="absolute top-4 left-6 right-6 h-1 rounded-full z-0 opacity-80"
            style={{ backgroundColor: accentColor }}
          />

          {stations.map((st, idx) => {
            const isOrigin = st.toLowerCase().includes(originStop.toLowerCase()) || originStop.toLowerCase().includes(st.toLowerCase());
            const isDest = st.toLowerCase().includes(destinationStop.toLowerCase()) || destinationStop.toLowerCase().includes(st.toLowerCase());
            const intermediateIndex = intermediateStops.findIndex(
              (i) => i.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(i.toLowerCase())
            );
            const isIntermediate = !isOrigin && !isDest && intermediateIndex !== -1;
            const isFirst = idx === 0;
            const isLast = idx === stations.length - 1;

            return (
              <button
                key={`${st}-${idx}`}
                type="button"
                onClick={() => onSelectStation && onSelectStation(st)}
                className="group relative z-10 flex flex-col items-center flex-1 min-w-[85px] text-center focus:outline-none cursor-pointer"
                title={`Estación: ${st}`}
              >
                {/* Station Node Marker */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                    isOrigin
                      ? 'bg-[#0070F3] text-white ring-4 ring-[#0070F3]/30'
                      : isDest
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                      : isIntermediate
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30'
                      : isFirst || isLast
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-slate-300 dark:ring-slate-700'
                      : 'bg-white dark:bg-[#0E1726] border-2 border-slate-300 dark:border-[#1C2A3E] group-hover:border-[#0070F3]'
                  }`}
                >
                  {isOrigin ? (
                    <Navigation className="w-3.5 h-3.5 fill-current" />
                  ) : isDest ? (
                    <MapPin className="w-3.5 h-3.5 fill-current" />
                  ) : isIntermediate ? (
                    <MapPin className="w-3.5 h-3.5 text-slate-950 fill-current" />
                  ) : (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </div>

                {/* Station Label */}
                <span
                  className={`mt-2 text-[11px] leading-tight line-clamp-2 transition-colors ${
                    isOrigin
                      ? 'font-bold text-[#0060EA] dark:text-[#38BDF8]'
                      : isDest
                      ? 'font-bold text-rose-600 dark:text-rose-300'
                      : isIntermediate
                      ? 'font-bold text-amber-600 dark:text-amber-400'
                      : 'font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  {st}
                </span>

                {isOrigin && (
                  <span className="text-[9px] uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] font-bold mt-0.5">
                    Origen
                  </span>
                )}
                {isIntermediate && (
                  <span className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                    Parada #{intermediateIndex + 1}
                  </span>
                )}
                {isDest && (
                  <span className="text-[9px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                    Destino
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
