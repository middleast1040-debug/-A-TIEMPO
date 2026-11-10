import React, { useState, useEffect } from 'react';
import {
  CURRENT_BOGOTA_WEATHER,
  INITIAL_BOGOTA_NEWS,
  TransitNewsItem,
} from '../data/bogotaNews';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendCriticalTransitNotification,
  sendTestPushNotification,
  isPushAlertsEnabled,
  setPushAlertsEnabled,
  isTrulyRelevantAlert,
  NotificationPermissionState,
} from '../utils/notifications';
import { playSeismicAlertSound } from '../utils/audioAlert';
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
import { TransitCitySystem, COLOMBIA_SYSTEMS } from '../data/colombiaTransit';

interface BogotaNewsSectionProps {
  citySystem?: TransitCitySystem;
}

export const BogotaNewsSection: React.FC<BogotaNewsSectionProps> = ({
  citySystem = COLOMBIA_SYSTEMS.bogota,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [isPushActive, setIsPushActive] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isTestingSeismic, setIsTestingSeismic] = useState(false);
  const [seismicFeedback, setSeismicFeedback] = useState<string | null>(null);

  useEffect(() => {
    const currentPermission = getNotificationPermission();
    setPermissionState(currentPermission);
    setIsPushActive(isPushAlertsEnabled());
  }, []);

  const news = citySystem.news && citySystem.news.length > 0 ? citySystem.news : INITIAL_BOGOTA_NEWS;
  const weather = citySystem.weather || CURRENT_BOGOTA_WEATHER;

  const filteredNews = news.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'criticas') return isTrulyRelevantAlert(item);
    return item.category === selectedFilter;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRefreshing(false);
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      setIsPushActive(true);
      setFeedbackMessage('¡Notificaciones activadas! Solo recibirás alertas de alta prioridad.');
      sendTestPushNotification();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else if (result === 'denied') {
      setFeedbackMessage('Permiso denegado por el navegador.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleTogglePush = () => {
    const nextState = !isPushActive;
    setIsPushActive(nextState);
    setPushAlertsEnabled(nextState);
    setFeedbackMessage(
      nextState
        ? 'Alertas críticas reactivadas.'
        : 'Alertas críticas pausadas.'
    );
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSendTestAlert = () => {
    const sent = sendTestPushNotification();
    if (sent) {
      setFeedbackMessage('Alerta de prueba enviada a tu dispositivo.');
    } else {
      setFeedbackMessage('No se pudo enviar. Verifica los permisos de tu navegador.');
    }
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handlePushIndividualItem = (item: TransitNewsItem) => {
    const sent = sendCriticalTransitNotification(item);
    if (sent) {
      setFeedbackMessage(`Alerta enviada: ${item.title}`);
    } else {
      setFeedbackMessage('Activa las notificaciones en la tarjeta superior para recibir avisos.');
    }
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleTestSeismicAlarm = () => {
    setIsTestingSeismic(true);
    playSeismicAlertSound();
    setSeismicFeedback('Simulacro sísmico activo: tono de evacuación y vibración.');
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
              Alertas del Día · {citySystem.name}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estado de vías, troncales y clima en {citySystem.systemName}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 hover:bg-[#DBEAFE] dark:hover:bg-[#15233A] transition cursor-pointer font-bold"
          title="Actualizar reportes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Push Notifications Hub */}
      <div className="bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#EFF6FF] dark:bg-[#0E1B2E] text-[#0060EA] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-[#0080FF]/30">
                <BellRing className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Notificaciones de Alertas Críticas
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Avisos instantáneos únicamente si ocurre un cierre de troncal o bloqueo masivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {permissionState === 'default' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Activar Alertas</span>
              </button>
            )}

            {permissionState === 'granted' && (
              <>
                <button
                  type="button"
                  onClick={handleSendTestAlert}
                  className="flex items-center gap-1.5 bg-white dark:bg-[#0E1726] hover:bg-slate-50 dark:hover:bg-[#15233A] text-[#0060EA] dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/30 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </button>

                <button
                  type="button"
                  onClick={handleTogglePush}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    isPushActive
                      ? 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#BFDBFE] dark:border-[#0080FF]/40 text-[#0060EA] dark:text-[#38BDF8]'
                      : 'bg-white dark:bg-[#0E1726] border-slate-200 dark:border-[#1C2A3E] text-slate-500'
                  }`}
                >
                  {isPushActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />
                      <span>Activas</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pausadas</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {feedbackMessage && (
          <div className="mt-2.5 text-xs text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 rounded-xl p-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
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
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0070F3] shadow-md shadow-blue-500/25 font-bold'
                : 'bg-[#EFF6FF] dark:bg-[#070D18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-[#BFDBFE] dark:border-[#1C2A3E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incident News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredNews.map((item) => {
          const isCritical = isTrulyRelevantAlert(item);
          return (
            <div
              key={item.id}
              className="bg-[#F8FAFC] hover:bg-slate-100 dark:bg-[#070D18] dark:hover:bg-[#0E1B2E] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-3.5 transition space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      {getCategoryIcon(item.category)}
                      <span>{item.categoryLabel}</span>
                    </span>

                    {isCritical && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 inline-flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Crítico</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.timeAgo}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 min-w-0">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 min-w-0 flex-1">
                  <MapPin className="w-3 h-3 text-[#0060EA] dark:text-[#38BDF8] shrink-0" />
                  <span className="truncate font-medium">{item.affectedCorridor}</span>
                </span>

                {isCritical && permissionState === 'granted' && isPushActive && (
                  <button
                    type="button"
                    onClick={() => handlePushIndividualItem(item)}
                    className="shrink-0 inline-flex items-center gap-1 text-[10px] text-[#0060EA] dark:text-[#38BDF8] bg-white dark:bg-[#0E1726] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#1C2A3E] transition cursor-pointer font-bold"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Notificar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* ALERTA DE SISMOS Y PROTOCOLO SÍSMICO EN TRANSPORTE MASIVO */}
      {/* Posicionado abajo de todas las noticias como solicitó el usuario */}
      {/* ======================================================== */}
      <div className="pt-2 border-t border-slate-100 dark:border-[#1C2A3E] space-y-3">
        <div className="bg-gradient-to-br from-amber-500/10 via-transparent to-red-500/10 dark:from-[#0E1726] dark:to-[#070D18] border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5">
          {/* Header of Seismic Alert */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Alerta de Sismos & Protocolo de Emergencia
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] dark:bg-[#0070F3]/20 text-[#0060EA] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-[#0070F3]/30 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] animate-ping inline-block" />
                    SGC En Vivo
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Monitoreo Servicio Geológico Colombiano (SGC) y seguridad en estaciones y buses.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSeismicAlarm}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:from-[#1A8CFF] hover:to-[#0054D1] transition cursor-pointer active:scale-95 shrink-0"
              title="Probar sonido y vibración sísmica"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isTestingSeismic ? 'Simulacro Activo...' : 'Probar Alarma Sísmica'}</span>
            </button>
          </div>

          {seismicFeedback && (
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600/50 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
              <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
              <span>{seismicFeedback}</span>
            </div>
          )}

          {/* Current Real-time Seismic Status Badge */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8] shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Estado SGC: <strong className="text-slate-900 dark:text-white">Normal</strong> (Sin sismos de riesgo en corredores de transporte).
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Red masiva 100% operativa
            </span>
          </div>

          {/* Official Transit Evacuation Protocol (Numbered Steps 1, 2, 3) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Protocolo oficial durante un temblor en transporte:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Dentro del Bus / Tren
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  El conductor desacelerará fuera de puentes. Sujétate de las barandas y no intentes saltar en marcha.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    En Estación o Andén
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Aléjate de vidrios y bordes del andén. Adopta posición de protección (cabeza cubierta).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0070F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Evacuación Guiada
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Sigue al personal de estación hacia el punto de encuentro exterior. No uses ascensores.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Hotlines Bar */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-[#1C2A3E] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Líneas directas de emergencia:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="tel:123"
                className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] font-bold text-[11px] flex items-center gap-1 hover:bg-[#DBEAFE] transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Línea 123 (Nacional)</span>
              </a>
              <a
                href="tel:132"
                className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 font-bold text-[11px] flex items-center gap-1 hover:bg-red-100 transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>132 (Cruz Roja)</span>
              </a>
              <a
                href="tel:144"
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-100 transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>144 (Defensa Civil)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
