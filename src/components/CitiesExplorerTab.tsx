import React from 'react';
import { COLOMBIA_SYSTEMS } from '../data/colombiaTransit';
import {
  MapPin,
  Map,
  Compass,
  Maximize2,
} from 'lucide-react';
import { TransitLeafletMapContainer } from './TransitLeafletMapContainer';

interface CitiesExplorerTabProps {
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
  onOpenCardManager?: () => void;
  onOpenFullScreenMap?: () => void;
}

export const CitiesExplorerTab: React.FC<CitiesExplorerTabProps> = ({
  selectedCityId,
  onSelectCity,
  onOpenFullScreenMap,
}) => {
  const currentCity = COLOMBIA_SYSTEMS[selectedCityId] || COLOMBIA_SYSTEMS.bogota;
  const citiesList = Object.values(COLOMBIA_SYSTEMS);

  return (
    <div className="space-y-5 text-left transition-colors">
      {/* 1. SECCIÓN DE MAPAS DENTRO DE CIUDADES */}
      <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1C2A3E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#0070F3]/15 border border-blue-200 dark:border-[#0070F3]/30 flex items-center justify-center shrink-0">
              <Map className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Mapa Interactivo: {currentCity.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Corredores troncales, estaciones GTFS y tu ubicación GPS en {currentCity.systemName}
              </p>
            </div>
          </div>

          {onOpenFullScreenMap && (
            <button
              type="button"
              onClick={onOpenFullScreenMap}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Pantalla Completa</span>
            </button>
          )}
        </div>

        {/* Real Embedded Leaflet Map Container */}
        <div className="space-y-2">
          <TransitLeafletMapContainer
            cityId={selectedCityId}
            cityName={currentCity.name}
            height="320px"
            showControls={true}
            onOpenFullScreen={onOpenFullScreenMap}
          />
        </div>
      </div>

      {/* 2. SELECTOR DE CIUDADES COLOMBIA */}
      <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Cambiar Ciudad
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Selecciona tu sistema masivo para ajustar rutas, tarifas y tarjetas
            </p>
          </div>
        </div>

        {/* City Cards Grid - Clean, Minimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {citiesList.map((sys) => {
            const isSelected = selectedCityId === sys.id;

            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => onSelectCity(sys.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#EFF6FF] dark:bg-[#0070F3]/15 border-[#0070F3] shadow-sm shadow-blue-500/10'
                    : 'bg-slate-50 dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] hover:border-blue-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                      🇨🇴 {sys.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] px-2 py-0.5 rounded-full font-mono shrink-0 shadow-xs">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {sys.systemName} · {sys.cardName}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-[#0060EA] dark:text-[#38BDF8] block">
                    ${sys.fare.toLocaleString('es-CO')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">tarifa</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
