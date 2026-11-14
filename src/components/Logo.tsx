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
        className={`${dimensions} relative rounded-xl bg-gradient-to-tr from-[#0055FF] via-[#0088FF] to-[#00D4AA] p-[1.5px] shadow-lg shadow-blue-500/20`}
      >
        <div className="w-full h-full rounded-[10.5px] bg-[#070D18] flex items-center justify-center relative overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Anillo de precisión orbital */}
            <circle
              cx="16"
              cy="16"
              r="11.5"
              stroke="url(#atiempo_grad)"
              strokeWidth="2.5"
              strokeDasharray="52 16"
              strokeLinecap="round"
            />
            {/* Vector de ruta y aguja exacta */}
            <path
              d="M16 9V16L21 19.5"
              stroke="#FFFFFF"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="2" fill="#00E5A8" />
            <defs>
              <linearGradient
                id="atiempo_grad"
                x1="4"
                y1="4"
                x2="28"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#00E5A8" />
              </linearGradient>
            </defs>
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
