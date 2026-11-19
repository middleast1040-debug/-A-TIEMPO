import React from 'react';
import { NuzunLogo } from './NuzunLogo';

interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode = false,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Marca NUZUN */}
        <a href="/" className="flex items-center gap-3 focus:outline-none group">
          <NuzunLogo className="h-7 sm:h-8 w-auto transition-transform duration-200 group-hover:scale-[1.02]" />
          <span className="hidden md:inline-block text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-3">
            Movilidad Exacta
          </span>
        </a>

        {/* Controles del encabezado */}
        {onToggleDarkMode && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Cambiar tema"
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
