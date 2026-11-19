import React from 'react';

interface NuzunLogoProps {
  className?: string;
}

export const NuzunLogo: React.FC<NuzunLogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 292 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NUZUN - Movilidad Exacta"
      role="img"
    >
      {/* Primera N (44x44px) */}
      <path
        d="M12 52V8L56 52V8"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-900 dark:text-white transition-colors"
      />

      {/* Primera U (36x44px) */}
      <path
        d="M72 8V34C72 43.9411 80.0589 52 90 52C99.9411 52 108 43.9411 108 34V8"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        className="text-slate-900 dark:text-white transition-colors"
      />

      {/* Z Central (Exactamente 44x44px igual que las N, en azul acento) */}
      <path
        d="M124 8H168L124 52H168"
        stroke="#1A73E8"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Segunda U (Idéntica a la primera U - 36x44px) */}
      <path
        d="M184 8V34C184 43.9411 192.059 52 202 52C211.941 52 220 43.9411 220 34V8"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        className="text-slate-900 dark:text-white transition-colors"
      />

      {/* Segunda N (Idéntica a la primera N - 44x44px) */}
      <path
        d="M236 52V8L280 52V8"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-900 dark:text-white transition-colors"
      />
    </svg>
  );
};
