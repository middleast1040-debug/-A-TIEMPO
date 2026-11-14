import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  ShieldAlert,
  Radio,
  ExternalLink,
  X,
  Activity,
  Zap,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface RadarTacticoProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  cityId: string;
}

const CITY_COORDS: Record<string, { lat: number; lon: number; corridors: string[] }> = {
  bogota: {
    lat: 4.6533,
    lon: -74.0836,
    corridors: ['Autopista Norte', 'Av. Caracas', 'NQS / Cra 30', 'Calle 80', 'Av. El Dorado'],
  },
  medellin: {
    lat: 6.2442,
    lon: -75.5812,
    corridors: ['Av. Regional', 'Autopista Sur', 'Av. El Poblado', 'Av. Oriental'],
  },
  cali: {
    lat: 3.4516,
    lon: -76.532,
    corridors: ['Calle 5ta', 'Autopista Suroriental', 'Av. Roosevelt', 'Av. Pasoancho'],
  },
  barranquilla: {
    lat: 10.9685,
    lon: -74.7813,
    corridors: ['Vía 40', 'Calle 72', 'Av. Murillo', 'Circunvalar'],
  },
  cartagena: {
    lat: 10.391,
    lon: -75.4794,
    corridors: ['Av. Pedro de Heredia', 'Av. Santander', 'Transversal 54'],
  },
};

export const RadarTacticoModal: React.FC<RadarTacticoProps> = ({
  isOpen,
  onClose,
  cityName,
  cityId,
}) => {
  const [sosSent, setSosSent] = useState(false);
  if (!isOpen) return null;

  const geo = CITY_COORDS[cityId] || CITY_COORDS.bogota;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-gradient-to-b from-[#0D1627] to-[#060B14] border border-cyan-500/30 shadow-[0_0_60px_-15px_rgba(6,182,212,0.35)] text-slate-100 p-5 sm:p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold tracking-wider uppercase">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Telemetría Vial & Rescate • {cityName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-400 bg-clip-text text-transparent">
              Radar Inteligente en Vivo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Waze Live Embed */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/25 bg-slate-900 shadow-inner h-72 sm:h-96">
              <iframe
                title={`Waze Live ${cityName}`}
                src={`https://embed.waze.com/iframe?zoom=13&lat=${geo.lat}&lon=${geo.lon}&ct=livemap`}
                className="w-full h-full border-0"
                allowFullScreen
              />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Flujo Vehicular Sincronizado
                </span>
                <a
                  href={`https://waze.com/ul?ll=${geo.lat},${geo.lon}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  <span>Abrir App Waze</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Corredores */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Corredores:</span>
              {geo.corridors.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-cyan-200 shrink-0"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Tactical Rescue Column */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0B1424] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm text-white">Protocolo Anti-Trancón</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Si detectas accidente o bloqueo en troncal, utiliza los paraderos zonales paralelos para mantener tu transbordo a <strong className="text-emerald-400">$0 COP</strong> sin pagar tarifas dinámicas.
              </p>
              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <strong className="text-slate-200 block">Plan B Alimentador</strong>
                    <span className="text-slate-400">Aborda ruta zonal hacia estación cabecera más cercana.</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <strong className="text-slate-200 block">Zona Segura Iluminada</strong>
                    <span className="text-slate-400">Espera siempre en paraderos con bahía demarcada.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Off-Grid Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-orange-950/30 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Asistencia en Ruta</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSosSent(true);
                  setTimeout(() => setSosSent(false), 4000);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-orange-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>{sosSent ? '¡Coordenadas Copiadas al Portapapeles!' : 'Compartir Ubicación de Rescate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
