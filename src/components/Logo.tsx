import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  return (
    <div className="inline-flex items-center gap-3 select-none group">
      <div
        className={`${dimensions} relative rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 p-[2px] shadow-xl shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#0B132B] to-[#040812] flex items-center justify-center relative overflow-hidden shadow-inner">
          {/* Brillo de fondo ambiental */}
          <div className="absolute inset-0 bg-blue-500/10 blur-sm pointer-events-none" />

          {/* Isotipo con acabado profesional y relieve 3D */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Degradado metálico para la letra A */}
              <linearGradient id="gradLetter" x1="18" y1="4" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              {/* Sombra interna o bisel inferior de la A */}
              <linearGradient id="gradLetterShadow" x1="18" y1="14" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Degradado dinámico para la flecha de tránsito */}
              <linearGradient id="gradArrow" x1="6" y1="20" x2="30" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0052CC" />
                <stop offset="50%" stopColor="#0070F3" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              {/* Sombra paralela para la flecha */}
              <filter id="shadowArrow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Estructura principal de la Letra A con efecto biselado */}
            <path
              d="M18 4L6 28H12L18 15L24 28H30L18 4Z"
              fill="url(#gradLetter)"
            />
            {/* Trazo interno para dar profundidad en las piernas de la A */}
            <path
              d="M18 15L12 28H16L18 23L20 28H24L18 15Z"
              fill="url(#gradLetterShadow)"
              fillOpacity="0.4"
            />

            {/* Flecha curva ascendente corporativa con volumen y brillo */}
            <path
              d="M7 21C11.5 15.5 19.5 15.5 27 9.5M27 9.5V17M27 9.5H19.5"
              stroke="url(#gradArrow)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#shadowArrow)"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            A Tiempo
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#0070F3] dark:text-cyan-400 mt-1">
            Colombia
          </span>
        </div>
      )}
    </div>
  );
};
