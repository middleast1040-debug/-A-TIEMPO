import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${dimensions} relative rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-[1.5px] shadow-lg shadow-blue-500/20`}
      >
        <div className="w-full h-full rounded-[10.5px] bg-[#070D18] flex items-center justify-center relative overflow-hidden">
          {/* Isotipo oficial: Letra A estilizada con flecha ascendente dinámica */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Estructura geométrica de la A */}
            <path
              d="M16 5L6 25H11L16 14L21 25H26L16 5Z"
              fill="#F8FAFC"
              fillOpacity="0.95"
            />
            {/* Flecha curva ascendente corporativa */}
            <path
              d="M7 19C11 15 19 15 25 10M25 10V16M25 10H19"
              stroke="#0070F3"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
            A Tiempo
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0070F3] dark:text-cyan-400 mt-0.5">
            Colombia
          </span>
        </div>
      )}
    </div>
  );
};
