import React from 'react';

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
    <header className="w-full border-b border-slate-200 dark:border-[#1E293B] bg-white/95 dark:bg-[#0B131E]/95 backdrop-blur-xl sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 w-full">
        
        {/* LOGO Y MARCA NUZUN */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#0D47A1] flex items-center justify-center shadow-md shadow-[#1A73E8]/30 text-white font-black">
            {/* Isotipo Vectorial NUZUN */}
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
              <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              NUZUN
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#1A73E8] mt-1">
              Movilidad Exacta
            </span>
          </div>
        </div>

        {/* CONTROLES DE ACCIÓN */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Botón Modo Día / Noche */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111C2E] dark:hover:bg-[#1A2840] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            title={themeMode === 'dark' ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
          >
            {themeMode === 'dark' ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#1A73E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Botón Checklist */}
          {onOpenChecklist && (
            <button
              type="button"
              onClick={onOpenChecklist}
              className="relative flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111C2E] dark:hover:bg-[#1A2840] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Lista antes de salir de casa"
            >
              <svg className="w-4 h-4 text-[#1A73E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
              </svg>
              {checklistCount && checklistCount.total > 0 && (
                <span className="ml-1 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
                  {checklistCount.checked}/{checklistCount.total}
                </span>
              )}
            </button>
          )}

          {/* Botón Ajustes */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111C2E] dark:hover:bg-[#1A2840] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            title="Ajustes y opciones"
          >
            <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="text-xs font-bold hidden sm:inline">Ajustes</span>
          </button>

        </div>
      </div>
    </header>
  );
};
