import React from 'react';
import { Compass, Clock, CreditCard, Building2, Newspaper } from 'lucide-react';

export type AppNavTab = 'planear' | 'ciudades' | 'transbordo' | 'tarjetas' | 'noticias';

interface BottomNavDockProps {
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  cardBalance?: number;
  isTransferActive?: boolean;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeTab,
  onSelectTab,
  cardBalance,
  isTransferActive = false,
}) => {
  const tabs = [
    {
      id: 'planear' as AppNavTab,
      label: 'Rutas',
      icon: Compass,
    },
    {
      id: 'ciudades' as AppNavTab,
      label: 'Ciudades',
      icon: Building2,
    },
    {
      id: 'transbordo' as AppNavTab,
      label: 'Transbordo',
      icon: Clock,
      badge: isTransferActive ? '$0' : undefined,
    },
    {
      id: 'tarjetas' as AppNavTab,
      label: 'Mi Tarjeta',
      icon: CreditCard,
      sublabel: typeof cardBalance === 'number' ? `$${(cardBalance / 1000).toFixed(0)}k` : undefined,
    },
    {
      id: 'noticias' as AppNavTab,
      label: 'Alertas',
      icon: Newspaper,
    },
  ];

  return (
    <nav
      aria-label="Navegación principal de A Tiempo"
      className="fixed bottom-0 md:bottom-3 left-0 right-0 z-40 md:max-w-md md:mx-auto md:rounded-2xl bg-white/95 dark:bg-[#070D18]/95 backdrop-blur-2xl border-t md:border border-slate-200 dark:border-[#1C2A3E] px-2 pt-1.5 pb-2 md:pb-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.6)] md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-colors"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onSelectTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all rounded-xl relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-[#0060EA] dark:text-[#38BDF8] font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#0060EA] dark:text-[#38BDF8]' : 'text-slate-500 dark:text-slate-400'
                  }`}
                  strokeWidth={2}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-[#0070F3] text-white px-1 rounded-full shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate max-w-full font-medium ${isActive ? 'font-bold text-[#0060EA] dark:text-[#38BDF8]' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-1 bg-[#0070F3] rounded-full shadow-[0_0_8px_#0070F3]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
