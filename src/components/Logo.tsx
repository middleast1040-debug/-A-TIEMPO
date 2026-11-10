import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  showText?: boolean;
  className?: string;
  cityName?: string;
  subtitle?: string;
}

/**
 * Minimalist, Spectacular, Iconic Transit Mark for "A TIEMPO".
 * Electric Blue & Cyan precision chrono-transit logo.
 */
export const ATiempoEmblem: React.FC<{ sizeClass?: string; className?: string }> = ({
  sizeClass = 'w-9 h-9',
  className = '',
}) => {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${sizeClass} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(0,112,243,0.3)] dark:drop-shadow-[0_0_16px_rgba(0,128,255,0.4)] transition-transform duration-300 hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="chrono-blue" x1="16" y1="16" x2="84" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0080FF" />
            <stop offset="100%" stopColor="#0060EA" />
          </linearGradient>

          <linearGradient id="chrono-accent" x1="45" y1="45" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#0070F3" />
          </linearGradient>
        </defs>

        {/* Minimalist Squircle Base */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="26"
          className="fill-white dark:fill-[#0E1726] stroke-slate-200 dark:stroke-[#1C2A3E]"
          strokeWidth="1.5"
        />

        {/* Precision Dial Arc (Top Right 12:00 - 3:00) */}
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 6"
          className="text-slate-300 dark:text-[#1C2A3E]"
        />

        {/* The Continuous Chrono-Transit Rail */}
        <path
          d="M26 70 L47 26 C48.5 23 51.5 23 53 26 L62 44 C67 54 77 56 80 50"
          stroke="url(#chrono-blue)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Precision Speed Crossbar */}
        <path
          d="M34 52 H64"
          stroke="url(#chrono-accent)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Exact Departure Time Point at 12:00 Apex */}
        <circle cx="50" cy="24" r="3.5" fill="#FFFFFF" />
        <circle cx="50" cy="24" r="1.8" fill="#0070F3" />

        {/* Arrival Terminal Stop */}
        <circle cx="80" cy="50" r="3.5" fill="#38BDF8" />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showText = true,
  className = '',
  cityName,
  subtitle,
}) => {
  const sizeMap = {
    xs: {
      mark: 'w-7 h-7',
      title: 'text-sm font-black',
      sub: 'text-[9px]',
      container: 'gap-1.5',
    },
    sm: {
      mark: 'w-8 h-8',
      title: 'text-base font-black',
      sub: 'text-[10px]',
      container: 'gap-2',
    },
    md: {
      mark: 'w-9 h-9',
      title: 'text-lg font-black',
      sub: 'text-[11px]',
      container: 'gap-2.5',
    },
    lg: {
      mark: 'w-12 h-12',
      title: 'text-2xl font-black tracking-tight',
      sub: 'text-xs',
      container: 'gap-3',
    },
    xl: {
      mark: 'w-16 h-16',
      title: 'text-3xl font-black tracking-tight',
      sub: 'text-sm',
      container: 'gap-3.5',
    },
  };

  const currentSize = sizeMap[size];
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={`inline-flex items-center ${
        isHorizontal ? 'flex-row' : 'flex-col text-center'
      } ${currentSize.container} ${className} select-none group min-w-0`}
    >
      <ATiempoEmblem sizeClass={currentSize.mark} />

      {showText && (
        <div className={`flex flex-col min-w-0 ${isHorizontal ? 'text-left' : 'items-center text-center'}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`${currentSize.title} tracking-tight font-black text-slate-900 dark:text-white transition-colors duration-200 truncate`}
            >
              A TIEMPO
            </span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#0070F3] animate-pulse shrink-0"
              title="Sistema en vivo"
            />
          </div>

          <div className="flex items-center gap-1 leading-tight mt-0.5 min-w-0">
            <span
              className={`${currentSize.sub} font-semibold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] truncate max-w-[170px] sm:max-w-none`}
            >
              {subtitle || (cityName ? cityName : 'Salidas Exactas')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
