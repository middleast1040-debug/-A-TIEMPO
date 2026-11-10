import React, { useState } from 'react';
import { Search, Home, Briefcase, GraduationCap, Plane, MapPin } from 'lucide-react';
import { TransitCitySystem } from '../data/colombiaTransit';

interface QuickDestinationHubProps {
  citySystem: TransitCitySystem;
  onSelectDestination: (destName: string, originName?: string) => void;
  currentDestination: string;
}

interface DestinationPreset {
  id: string;
  label: string;
  icon: 'home' | 'work' | 'study' | 'airport';
  destByCity: Record<string, string>;
  originByCity?: Record<string, string>;
}

const DEFAULT_PRESETS: DestinationPreset[] = [
  {
    id: 'work',
    label: 'Trabajo',
    icon: 'work',
    destByCity: {
      bogota: 'Estación Calle 100',
      medellin: 'Estación Poblado',
      cali: 'Estación Menga',
      barranquilla: 'Estación Joe Arroyo',
      cartagena: 'Estación Centro',
      pereira: 'Estación Victoria',
      bucaramanga: 'Estación Provenza',
    },
    originByCity: {
      bogota: 'Portal Usme',
      medellin: 'Estación Niquía',
      cali: 'Estación Andrés Sanín',
      barranquilla: 'Portal de Soledad',
      cartagena: 'Patio Portal',
      pereira: 'Intercambiador Cuba',
      bucaramanga: 'Estación Quebradaseca',
    },
  },
  {
    id: 'home',
    label: 'Casa',
    icon: 'home',
    destByCity: {
      bogota: 'Portal Usme',
      medellin: 'Estación Niquía',
      cali: 'Estación Andrés Sanín',
      barranquilla: 'Portal de Soledad',
      cartagena: 'Patio Portal',
      pereira: 'Intercambiador Cuba',
      bucaramanga: 'Estación Quebradaseca',
    },
  },
  {
    id: 'study',
    label: 'Estudio',
    icon: 'study',
    destByCity: {
      bogota: 'Ciudad Universitaria',
      medellin: 'Estación Universidad',
      cali: 'Estación Universidades',
      barranquilla: 'Estación Romelio Martínez',
      cartagena: 'Estación La Bodeguita',
      pereira: 'Estación UTP',
      bucaramanga: 'Estación UIS',
    },
  },
  {
    id: 'airport',
    label: 'Terminal / Vuelo',
    icon: 'airport',
    destByCity: {
      bogota: 'Portal El Dorado',
      medellin: 'Estación Caribe',
      cali: 'Terminal Menga',
      barranquilla: 'Terminal Metropolitano',
      cartagena: 'Patio Portal',
      pereira: 'Terminal de Transportes',
      bucaramanga: 'Terminal Bucaramanga',
    },
  },
];

export const QuickDestinationHub: React.FC<QuickDestinationHubProps> = ({
  citySystem,
  onSelectDestination,
  currentDestination,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredStations = query.trim()
    ? (citySystem.stations || []).filter((st) =>
        st.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelect = (dest: string, orig?: string) => {
    onSelectDestination(dest, orig);
    setQuery('');
    setIsFocused(false);
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'home':
        return <Home className="w-3.5 h-3.5" />;
      case 'work':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'study':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'airport':
        return <Plane className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 text-left space-y-3 shadow-sm dark:shadow-lg transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />
          ¿A dónde vas en {citySystem.name}?
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          {citySystem.systemName}
        </span>
      </div>

      {/* Search Field */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-300 dark:border-[#1C2A3E] rounded-xl px-3 py-2.5 focus-within:border-[#0070F3] transition-all">
          <MapPin className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Buscar estación o destino..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {isFocused && filteredStations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-[#1C2A3E]">
            {filteredStations.map((station) => (
              <button
                key={station}
                type="button"
                onClick={() => handleSelect(station)}
                className="w-full px-3 py-2 text-left text-xs text-slate-800 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-[#0E1B2E] hover:text-[#0060EA] dark:hover:text-[#38BDF8] flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
                  <span className="font-semibold">{station}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Elegir</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {DEFAULT_PRESETS.map((preset) => {
          const destName = preset.destByCity[citySystem.id] || preset.destByCity.bogota;
          const origName = preset.originByCity?.[citySystem.id];
          const isSelected = currentDestination.toLowerCase() === destName.toLowerCase();

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelect(destName, origName)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border max-w-full ${
                isSelected
                  ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0070F3] shadow-md shadow-blue-500/25 font-bold'
                  : 'bg-[#EFF6FF] dark:bg-[#070D18] text-slate-700 dark:text-slate-300 hover:text-[#0060EA] dark:hover:text-white border-[#BFDBFE] dark:border-[#1C2A3E] hover:bg-blue-100 dark:hover:bg-[#0E1B2E]'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-[#0060EA] dark:text-[#38BDF8]'}>
                {getIcon(preset.icon)}
              </span>
              <span className="truncate">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
