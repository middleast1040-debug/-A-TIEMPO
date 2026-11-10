import React from 'react';
import { Route, FavoriteDestination } from '../types/transit';
import { calculateDeparture, formatMinutesAndSeconds } from '../utils/transitCalculator';
import { Bookmark, Footprints, Trash2, MapPin, Plus, ArrowUpRight } from 'lucide-react';

interface FavoritesListProps {
  favorites: FavoriteDestination[];
  routes: Route[];
  currentTimeMs: number;
  onSelectFavorite: (fav: FavoriteDestination) => void;
  onRemoveFavorite: (id: string) => void;
  onAddCurrentAsFavorite: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  routes,
  currentTimeMs,
  onSelectFavorite,
  onRemoveFavorite,
  onAddCurrentAsFavorite,
}) => {
  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3 text-left transition-colors">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1C2A3E] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-lg bg-blue-50 dark:bg-[#0070F3]/20 border border-blue-200 dark:border-[#0070F3]/40 flex items-center justify-center shrink-0">
            <Bookmark className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8]" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
            Rutas Favoritas
          </h3>
          <span className="text-[10px] font-mono text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] px-1.5 py-0.2 rounded border border-[#BFDBFE] dark:border-[#0080FF]/30 shrink-0 font-bold">
            {favorites.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCurrentAsFavorite}
          className="text-xs text-[#0060EA] dark:text-[#38BDF8] hover:text-[#0050D0] dark:hover:text-white font-bold flex items-center gap-1 cursor-pointer transition py-1 px-2.5 rounded-lg bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-blue-100 dark:hover:bg-[#0080FF]/20 border border-[#BFDBFE] dark:border-[#0080FF]/40 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Guardar actual</span>
        </button>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-5 px-3 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-dashed border-slate-200 dark:border-[#1C2A3E] text-xs space-y-1.5">
          <p className="font-bold text-slate-700 dark:text-slate-300">Sin rutas guardadas</p>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Guarda tus recorridos diarios para consultar tu salida en un toque.
          </p>
        </div>
      ) : (
        /* Saved Destinations List */
        <div className="space-y-2">
          {favorites.map((fav) => {
            const route = routes.find((r) => r.id === fav.routeId);
            if (!route) return null;

            const calc = calculateDeparture(
              route,
              fav.stopName,
              fav.walkingMinutes,
              fav.bufferMinutes,
              currentTimeMs
            );

            const isUrgent = calc.totalSecondsRemaining <= 180;

            return (
              <div
                key={fav.id}
                onClick={() => onSelectFavorite(fav)}
                className="group relative bg-slate-50 hover:bg-slate-100 dark:bg-[#070D18] dark:hover:bg-[#0E1B2E] p-3 rounded-xl border border-slate-200 dark:border-[#1C2A3E] hover:border-[#0080FF]/50 transition cursor-pointer flex flex-col gap-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white font-mono shrink-0 shadow-2xs"
                      style={{ backgroundColor: route.accentColor }}
                    >
                      {route.code}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                      {fav.customTitle || route.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                        isUrgent
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 animate-pulse'
                          : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#BFDBFE] dark:border-[#0080FF]/40 text-[#0060EA] dark:text-[#38BDF8]'
                      }`}
                    >
                      Sal en {formatMinutesAndSeconds(calc.totalSecondsRemaining)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(fav.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                      title="Eliminar favorito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">{fav.stopName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    <Footprints className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8]" />
                    <span>{fav.walkingMinutes} min</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#0060EA] dark:group-hover:text-[#38BDF8]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
