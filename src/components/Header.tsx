import React from 'react';
import { Settings, ListChecks, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenChecklist?: () => void;
  checklistCount?: { checked: number; total: number };
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenChecklist,
  checklistCount,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  return (
    <header className="w-full border-b border-slate-200 dark:border-[#1C2A3E] bg-white/95 dark:bg-[#070D18]/95 backdrop-blur-xl sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 w-full">
        {/* Logo 3D Profesional */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <img 
            src="/logo-atiempo.png" 
            alt="A Tiempo Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-md shadow-blue-500/20" 
          />
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              A Tiempo
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#0060EA] dark:text-cyan-400 mt-1">
              Colombia
            </span>
          </div>
        </div>

        {/* Controles de Acción (Sol/Luna, Checklist, Ajustes) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón Diurno / Nocturno */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0E1726] dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-xs group"
            title={themeMode === 'dark' ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
            aria-label={themeMode === 'dark' ? 'Activar modo día' : 'Activar modo noche'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" strokeWidth={2} />
            ) : (
              <Moon className="w-4 h-4 text-[#0060EA] transition-transform group-hover:-rotate-12" strokeWidth={2} />
            )}
          </button>

          {/* Botón de Checklist */}
          {onOpenChecklist && (
            <button
              type="button"
              onClick={onOpenChecklist}
              className="relative flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0E1726] dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-xs group"
              title="Lista antes de salir de casa"
              aria-label="Abrir lista antes de salir de casa"
            >
              <ListChecks className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8] transition-transform group-hover:scale-110" strokeWidth={2} />
              {checklistCount && checklistCount.total > 0 && (
                <span className="ml-1 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
                  {checklistCount.checked}/{checklistCount.total}
                </span>
              )}
              {checklistCount && checklistCount.checked < checklistCount.total && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0070F3] ring-2 ring-white dark:ring-[#070D18]" />
              )}
            </button>
          )}

          {/* Botón de Ajustes */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0E1726] dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-xs group"
            title="Ajustes y opciones"
            aria-label="Abrir configuración y opciones"
          >
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-[#0060EA] dark:group-hover:text-[#38BDF8] transition-transform group-hover:rotate-45 duration-200" strokeWidth={2} />
            <span className="text-xs font-bold hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
};
