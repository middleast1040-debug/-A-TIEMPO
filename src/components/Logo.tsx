import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#0D47A1] text-white shadow-sm shadow-[#1A73E8]/25 shrink-0 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Ruta principal: se adapta dinámicamente según el tema */}
        <path
          d="M8 26V12C8 9.79086 9.79086 8 12 8C13.6 8 15.05 8.95 15.68 10.42L20.32 21.58C20.95 23.05 22.4 24 24 24C26.2091 24 28 22.2091 28 20V10"
          className="stroke-white dark:stroke-white"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Puntos de control brillantes */}
        <circle cx="8" cy="26" r="3" fill="#38BDF8" />
        <circle cx="28" cy="10" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
