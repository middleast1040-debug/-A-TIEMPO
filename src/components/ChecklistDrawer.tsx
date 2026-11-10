import React, { useState } from 'react';
import { ExitChecklistItem } from '../types/transit';
import {
  CreditCard,
  Key,
  Umbrella,
  Smartphone,
  Headphones,
  CheckCircle2,
  Circle,
  X,
  RotateCcw,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface ChecklistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ExitChecklistItem[];
  onToggleItem: (id: string) => void;
  onResetItems: () => void;
  onAddItem: (label: string, sublabel: string) => void;
}

export const ChecklistDrawer: React.FC<ChecklistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onToggleItem,
  onResetItems,
  onAddItem,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newSublabel, setNewSublabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />;
      case 'Key':
        return <Key className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />;
      case 'Umbrella':
        return <Umbrella className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />;
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddItem(newLabel.trim(), newSublabel.trim() || 'Recordatorio');
    setNewLabel('');
    setNewSublabel('');
    setIsAdding(false);
  };

  const completedCount = items.filter((i) => i.checked).length;
  const isAllReady = completedCount === items.length && items.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl relative max-h-[90vh] flex flex-col text-left transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1C2A3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#0070F3]/15 border border-blue-200 dark:border-[#0070F3]/30 flex items-center justify-center text-[#0060EA] dark:text-[#38BDF8]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Lista de Salida</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Objetos esenciales antes de salir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#15233A] transition cursor-pointer flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status banner */}
        <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">Estado: </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {completedCount} de {items.length} listos
            </span>
          </div>
          {isAllReady ? (
            <span className="text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0070F3]/20 border border-[#BFDBFE] dark:border-[#0070F3]/40 px-2 py-0.5 rounded-md">
              Listo para salir
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">Revisa tus pertenencias</span>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 my-1">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                item.checked
                  ? 'bg-[#EFF6FF] dark:bg-[#0070F3]/15 border-[#BFDBFE] dark:border-[#0070F3]/30 opacity-75'
                  : 'bg-slate-50 dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] hover:border-blue-300 dark:hover:border-[#0080FF]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-center shrink-0">
                  {getIcon(item.iconName)}
                </div>
                <div>
                  <div
                    className={`text-sm font-medium ${
                      item.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white font-bold'
                    }`}
                  >
                    {item.label}
                  </div>
                  {item.sublabel && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.sublabel}</div>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-[#0070F3]">
                {item.checked ? (
                  <CheckCircle2 className="w-5 h-5 fill-[#0070F3] text-white" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add item collapsible */}
        {isAdding ? (
          <form onSubmit={handleAddNew} className="p-3 bg-slate-50 dark:bg-[#070D18] rounded-xl border border-slate-200 dark:border-[#1C2A3E] space-y-2 mt-2">
            <input
              type="text"
              placeholder="Ej: Carnet, llaves..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-white dark:bg-[#0E1726] border border-slate-300 dark:border-[#1C2A3E] rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070F3]"
              autoFocus
            />
            <input
              type="text"
              placeholder="Nota opcional"
              value={newSublabel}
              onChange={(e) => setNewSublabel(e.target.value)}
              className="w-full bg-white dark:bg-[#0E1726] border border-slate-300 dark:border-[#1C2A3E] rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070F3]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-[#1C2A3E]">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 text-xs text-[#0060EA] dark:text-[#38BDF8] hover:underline py-1.5 px-2 rounded-lg cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir objeto</span>
            </button>

            <button
              type="button"
              onClick={onResetItems}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white py-1.5 px-2 rounded-lg cursor-pointer"
              title="Desmarcar todos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
