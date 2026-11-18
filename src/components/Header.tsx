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
    <header className="w-full border-b border-slate-200 dark:border-[#1E293B] bg-white/90 dark:bg-[#070D18]/90 backdrop-blur-xl sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 w-full">
        
        {/* LOGO Y MARCA NUZUN (Isotipo Vectorial de Alta Gama) */}
        <div className="flex items-center gap-3 shrink-0 select-none">
          <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#0D47A1] text-white shadow-sm shadow-[#1A73E8]/25 shrink-0">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 sm:w-6 sm:h-6"
            >
              <path
                d="M8 26V12C8 9.79086 9.79086 8 12 8C13.6 8 15.05 8.95 15.68 10.42L20.32 21.58C20.95 23.05 22.4 24 24 24C26.2091 24 28 22.2091 28 20V10"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="26" r="2.5" fill="#38BDF8" />
              <circle cx="28" cy="10" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
          
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-[0.18em] text-slate-900 dark:text-white">
                NUZUN
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#1A73E8] mt-1">
              Movilidad Exacta
            </span>
          </div>
        </div>

        {/* CONTROLES DE ACCIÓN */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111C2E] dark:hover:bg-[#1A2840] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A73E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {onOpenChecklist && (
            <button
              type="button"
              onClick={onOpenChecklist}
              aria-label="Lista de chequeo"
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111C2E] dark:hover:bg-[#1A2840] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A73E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
              </svg>
              {checklistCount && checklistCount.total > 0 && (
                <span className="ml-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
                  {checklistCount.checked}/{checklistCount.total}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Abrir ajustes"
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111C2E] dark:hover:bg-[#1A2840] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
