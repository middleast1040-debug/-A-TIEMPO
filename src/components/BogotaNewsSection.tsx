import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Wind,
  Umbrella,
  AlertTriangle,
  Construction,
  Users,
  Compass,
  Info,
  MapPin,
  RefreshCw,
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  Send,
  ShieldAlert,
  Activity,
  PhoneCall,
  Volume2,
  Radio,
} from 'lucide-react';

// Respaldo seguro por si fallan las rutas externas
const FALLBACK_WEATHER = {
  temperatureC: 18,
  condition: 'Parcialmente Nublado',
  rainProbability: 20,
  windSpeedKmH: 12,
  advisory: 'Condiciones estables para transitar por la ciudad.'
};

const FALLBACK_NEWS = [
  {
    id: '1',
    category: 'trancon',
    categoryLabel: 'Trancón',
    title: 'Alta congestión sobre la Autopista Norte',
    description: 'Flujo vehicular lento debido a alto volumen de vehículos en hora pico.',
    affectedCorridor: 'Autopista Norte con Calle 100',
    timeAgo: 'Hace 10 min',
    isCritical: false
  },
  {
    id: '2',
    category: 'obra',
    categoryLabel: 'Obra',
    title: 'Mantenimiento vial programado',
    description: 'Trabajos de malla vial en el carril mixto.',
    affectedCorridor: 'Avenida Caracas',
    timeAgo: 'Hace 25 min',
    isCritical: false
  }
];

interface BogotaNewsSectionProps {
  citySystem?: any;
}

export const BogotaNewsSection: React.FC<BogotaNewsSectionProps> = ({
  citySystem,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');
  const [isPushActive, setIsPushActive] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isTestingSeismic, setIsTestingSeismic] = useState(false);
  const [seismicFeedback, setSeismicFeedback] = useState<string | null>(null);

  const activeSystemName = citySystem?.name || 'Bogotá (TransMilenio / SITP)';
  const activeSubName = citySystem?.systemName || 'Sistema Integrado de Transporte';
  const news = citySystem?.news && citySystem.news.length > 0 ? citySystem.news : FALLBACK_NEWS;
  const weather = citySystem?.weather || FALLBACK_WEATHER;

  const filteredNews = news.filter((item: any) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'criticas') return item.isCritical;
    return item.category === selectedFilter;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRefreshing(false);
  };

  const handleRequestPermission = async () => {
    setPermissionState('granted');
    setIsPushActive(true);
    setFeedbackMessage('¡Notificaciones activadas correctamente!');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleTogglePush = () => {
    const nextState = !isPushActive;
    setIsPushActive(nextState);
    setFeedbackMessage(nextState ? 'Alertas críticas reactivadas.' : 'Alertas críticas pausadas.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSendTestAlert = () => {
    setFeedbackMessage('Alerta de prueba enviada a tu dispositivo.');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleTestSeismicAlarm = () => {
    setIsTestingSeismic(true);
    setSeismicFeedback('Simulacro sísmico activo: protocolo de evacuación en marcha.');
    setTimeout(() => {
      setIsTestingSeismic(false);
      setSeismicFeedback(null);
    }, 4000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trancon':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case 'obra':
        return <Construction className="w-3.5 h-3.5 text-amber-500" />;
      case 'marcha':
        return <Users className="w-3.5 h-3.5 text-purple-500" />;
      case 'desvio':
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />;
    }
  };

  return (
    <section className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 text-left transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1C2A3E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Alertas del Día · {activeSystemName}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estado de vías, troncales y clima en {activeSubName}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 hover:bg-[#DBEAFE] dark:hover:bg-[#15233A] transition cursor-pointer font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Weather Bar */}
      <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-3.5 sm:p-4 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 flex items-center justify-center text-[#0070F3] shrink-0">
              <CloudRain className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {weather.temperatureC}°C
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {weather.condition}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Umbrella className="w-3.5 h-3.5 text-[#0070F3]" strokeWidth={2} />
                  Lluvia: <strong className="text-slate-800 dark:text-white font-mono">{weather.rainProbability}%</strong>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />
                  <span>{weather.windSpeedKmH} km/h</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs bg-white dark:bg-[#0E1726] p-2.5 rounded-lg border border-slate-200 dark:border-[#1C2A3E]">
            <span className="text-[10px] text-[#0060EA] dark:text-[#38BDF8] font-bold block mb-0.5">
              Alerta de viaje:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              {weather.advisory}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'criticas', label: '🚨 Críticas' },
          { id: 'trancon', label: 'Trancones' },
          { id: 'obra', label: 'Obras' },
          { id: 'marcha', label: 'Movilizaciones' },
          { id: 'desvio', label: 'Desvíos' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id)}
            className={`py-1.5 px-3 font-bold rounded-xl transition cursor-pointer whitespace-nowrap text-xs border ${
              selectedFilter === tab.id
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0070F3] shadow-md shadow-blue-500/25'
                : 'bg-[#EFF6FF] dark:bg-[#070D18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-[#BFDBFE] dark:border-[#1C2A3E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incident News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredNews.map((item: any) => (
          <div
            key={item.id}
            className="bg-[#F8FAFC] hover:bg-slate-100 dark:bg-[#070D18] dark:hover:bg-[#0E1B2E] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-3.5 transition space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  {getCategoryIcon(item.category)}
                  <span>{item.categoryLabel}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.timeAgo}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 truncate">
                <MapPin className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
                <span className="truncate font-medium">{item.affectedCorridor}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerta de Sismos */}
      <div className="pt-2 border-t border-slate-100 dark:border-[#1C2A3E] space-y-3">
        <div className="bg-gradient-to-br from-amber-500/10 via-transparent to-red-500/10 dark:from-[#0E1726] dark:to-[#070D18] border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Alerta de Sismos & Protocolo de Emergencia
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Monitoreo Servicio Geológico Colombiano (SGC)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSeismicAlarm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:from-[#1A8CFF] hover:to-[#0054D1] transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isTestingSeismic ? 'Simulacro Activo...' : 'Probar Alarma Sísmica'}</span>
            </button>
          </div>

          {seismicFeedback && (
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{seismicFeedback}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
