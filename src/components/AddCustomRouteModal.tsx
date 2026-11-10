import React, { useState } from 'react';
import { TransitType, Route } from '../types/transit';
import { X, Plus, Bus } from 'lucide-react';

interface AddCustomRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoute: (newRoute: Route) => void;
}

export const AddCustomRouteModal: React.FC<AddCustomRouteModalProps> = ({
  isOpen,
  onClose,
  onAddRoute,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<TransitType>('transmilenio');
  const [popularStop, setPopularStop] = useState('');
  const [headwayMinutes, setHeadwayMinutes] = useState(7);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !popularStop.trim()) return;

    const accentColor =
      type === 'transmilenio' ? '#dc2626' : type === 'sitp' ? '#2563eb' : '#16a34a';

    const newRoute: Route = {
      id: `custom-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      origin: 'Origen frecuente',
      destination: name.trim(),
      popularStop: popularStop.trim(),
      zone: type === 'transmilenio' ? 'Troncal Personalizada' : 'SITP Personalizado',
      headwayMinutes: Number(headwayMinutes) || 7,
      accentColor,
    };

    onAddRoute(newRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1C2A3E] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 flex items-center justify-center text-[#0070F3]">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Añadir Nueva Ruta</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Guarda tus buses cotidianos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type selector */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo de Servicio:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setType('transmilenio')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition cursor-pointer min-h-[40px] ${
                  type === 'transmilenio'
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600 dark:text-red-300 shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                }`}
              >
                Troncal
              </button>
              <button
                type="button"
                onClick={() => setType('sitp')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition cursor-pointer min-h-[40px] ${
                  type === 'sitp'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                }`}
              >
                SITP
              </button>
              <button
                type="button"
                onClick={() => setType('alimentador')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition cursor-pointer min-h-[40px] ${
                  type === 'alimentador'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-300 shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                }`}
              >
                Alimentador
              </button>
            </div>
          </div>

          {/* Route code */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Código o Número de Ruta:</label>
            <input
              type="text"
              required
              placeholder="Ej: K300, D24, 731, 19-2..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] focus:border-[#0070F3] rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono uppercase focus:outline-none transition-colors"
            />
          </div>

          {/* Route name / destination */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre o Destino Principal:</label>
            <input
              type="text"
              required
              placeholder="Ej: Portal ElDorado, Paloquemao, Cedritos..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] focus:border-[#0070F3] rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Station or Stop */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tu Parada o Estación Habitual:</label>
            <input
              type="text"
              required
              placeholder="Ej: Estación Av. Chile, Calle 72 con Cra 11..."
              value={popularStop}
              onChange={(e) => setPopularStop(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] focus:border-[#0070F3] rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Headway */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Frecuencia estimada del bus ({headwayMinutes} min):
            </label>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={headwayMinutes}
              onChange={(e) => setHeadwayMinutes(Number(e.target.value))}
              className="w-full accent-[#0070F3] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
              <span>Alta (3 min)</span>
              <span>Normal (8-10 min)</span>
              <span>Lenta (20 min)</span>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] font-bold min-h-[42px] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold flex items-center justify-center gap-1.5 min-h-[42px] shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Ruta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
