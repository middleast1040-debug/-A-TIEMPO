import React from 'react';

interface NuzunLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
}

export const NuzunLogo: React.FC<NuzunLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Isotipo Geométrico SVG de Alta Precisión */}
      <div
        className={`${dimensions} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#0D47A1] text-white shadow-sm shadow-[#1A73E8]/25 shrink-0`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
        >
          {/* Trazo continuo de vía / movilidad exacta */}
          <path
            d="M8 26V12C8 9.79086 9.79086 8 12 8C13.6 8 15.05 8.95 15.68 10.42L20.32 21.58C20.95 23.05 22.4 24 24 24C26.2091 24 28 22.2091 28 20V10"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Punto de origen y destino */}
          <circle cx="8" cy="26" r="2.5" fill="#38BDF8" />
          <circle cx="28" cy="10" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-extrabold tracking-[0.18em] leading-none">
              NUZUN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]" />
          </div>
          {subtitle && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60 mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
