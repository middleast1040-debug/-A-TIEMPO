import React from 'react';
import {
  X,
  Settings,
  BookOpen,
  Sun,
  Moon,
  Bell,
  BellRing,
  Wifi,
  RefreshCw,
  HeartHandshake,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Info,
} from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenTutorial: () => void;
  onOpenAccessibilityModal: () => void;
  onOpenCitiesTab: () => void;
  onSyncCache: () => void;
  cacheRoutesCount: number;
  lastSyncFormatted: string;
  isSyncingCache: boolean;
  pushPermission: string;
  onRequestPushPermission: () => void;
  isWakeUpAlarmActive: boolean;
  onToggleWakeUpAlarm: () => void;
  cityName: string;
  isSubscribed: boolean;
  onOpenSubscriptionModal: () => void;
  onOpenChecklist?: () => void;
  isDataSaverActive?: boolean;
  onToggleDataSaver?: () => void;
  originStop?: string;
  destinationStop?: string;
  routeCode?: string;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onToggleTheme,
  onOpenTutorial,
  onOpenAccessibilityModal,
  onOpenCitiesTab,
  onSyncCache,
  cacheRoutesCount,
  lastSyncFormatted,
  isSyncingCache,
  pushPermission,
  onRequestPushPermission,
  isWakeUpAlarmActive,
  onToggleWakeUpAlarm,
  cityName,
  onOpenChecklist,
  isDataSaverActive = false,
  onToggleDataSaver,
  originStop = 'Origen',
  destinationStop = 'Destino',
  routeCode = 'TM',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto no-scrollbar transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2A3E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Configuración
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Personaliza alertas, modos y preferencias de viaje
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer"
            aria-label="Cerrar configuración"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. TUTORIAL PRINCIPAL DESTACADO */}
        <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-[#070D18] border border-[#BFDBFE] dark:border-[#1C2A3E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0070F3] text-white font-bold shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Tutorial y Asesoría A Tiempo
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Guía completa de apoyos, subsidios, salidas exactas y servicios generales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenTutorial();
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0 active:scale-95"
          >
            Ver Guía
          </button>
        </div>

        {/* 2. VISUALIZACIÓN & TEMA */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
            Visualización & Modo
          </span>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] rounded-xl p-3 border border-slate-200 dark:border-[#1C2A3E] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {themeMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#38BDF8]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Tema: {themeMode === 'dark' ? 'Modo Nocturno (Medianoche)' : 'Modo Diurno (Luz solar)'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {themeMode === 'dark' ? 'Descansa la vista y ahorra batería' : 'Máximo contraste bajo el sol'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1B2E] hover:bg-slate-100 dark:hover:bg-[#15233A] text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/40 cursor-pointer transition shadow-2xs"
              >
                Cambiar a {themeMode === 'dark' ? 'Modo Día' : 'Modo Noche'}
              </button>
            </div>

            {/* Modo Apoyo & Subsidios */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Modo Apoyo & Subsidios
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Lectura en voz asistida, visión aumentada y tarifas preferenciales
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccessibilityModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1B2E] hover:bg-slate-100 dark:hover:bg-[#15233A] text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/40 cursor-pointer transition shadow-2xs"
              >
                Configurar
              </button>
            </div>

            {/* Lista Antes de Salir */}
            {onOpenChecklist && (
              <div className="pt-2 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Lista Antes de Salir de Casa
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Revisa tarjeta con saldo, llaves, celular con batería y paraguas
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChecklist();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1B2E] hover:bg-slate-100 dark:hover:bg-[#15233A] text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/40 cursor-pointer transition shadow-2xs"
                >
                  Abrir Lista
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. ALERTAS & SEGUNDO PLANO */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
            Alertas & Notificaciones
          </span>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] rounded-xl p-3 border border-slate-200 dark:border-[#1C2A3E] space-y-2.5">
            {/* Alertas push en segundo plano */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Alertas al Momento de Salir
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {pushPermission === 'granted'
                      ? 'Activadas · Avisos suaves cuando debas cruzar tu puerta'
                      : 'Permite avisos para salir a tiempo'}
                  </span>
                </div>
              </div>

              {pushPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={onRequestPushPermission}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white text-xs font-bold cursor-pointer transition shadow-2xs"
                >
                  Activar
                </button>
              ) : (
                <span className="text-[11px] font-bold text-[#0060EA] dark:text-[#38BDF8] flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Activas
                </span>
              )}
            </div>

            {/* Alarma por proximidad 2 paradas antes */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Alarma «Avísame al llegar»
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Tono suave 2 paradas antes de tu destino para viajar con tranquilidad
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleWakeUpAlarm}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                  isWakeUpAlarmActive
                    ? 'bg-[#0070F3] text-white border border-[#0070F3]'
                    : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E]'
                }`}
              >
                {isWakeUpAlarmActive ? 'Activada' : 'Desactivada'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. MODO SIN CONEXIÓN & MENSAJERÍA DIRECTA */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
            Ahorro de Datos & Mensajería Directa
          </span>

          <div className="bg-[#F8FAFC] dark:bg-[#070D18] rounded-xl p-3 border border-slate-200 dark:border-[#1C2A3E] space-y-2.5">
            {/* Ahorro de Datos Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Ahorro Extremo de Datos
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Prioriza datos locales y no descarga mapas pesados fuera de wifi
                  </span>
                </div>
              </div>

              {onToggleDataSaver && (
                <button
                  type="button"
                  onClick={onToggleDataSaver}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                    isDataSaverActive
                      ? 'bg-[#0070F3] text-white border border-[#0070F3]'
                      : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E]'
                  }`}
                >
                  {isDataSaverActive ? 'Activado' : 'Desactivado'}
                </button>
              )}
            </div>

            {/* Caché Local */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Caché Local para Estaciones
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {cacheRoutesCount} rutas y horarios protegidos · {lastSyncFormatted}
                </span>
              </div>

              <button
                type="button"
                onClick={onSyncCache}
                disabled={isSyncingCache}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1B2E] hover:bg-slate-100 dark:hover:bg-[#15233A] text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/40 cursor-pointer transition shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCache ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {/* Enviar SMS de Viaje sin Datos */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Aviso por Mensaje SMS a Familiares
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Envía tu trayecto a tus contactos sin gastar saldo ni megas
                </p>
              </div>

              <a
                href={`sms:?body=${encodeURIComponent(
                  `A Tiempo: Voy en camino en la ruta ${routeCode} desde ${originStop} hacia ${destinationStop}. Tiempo calculado con exactitud.`
                )}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/40 text-[#0060EA] dark:text-[#38BDF8] hover:bg-[#DBEAFE] dark:hover:bg-[#15233A] text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
              >
                <span>Enviar SMS</span>
              </a>
            </div>
          </div>
        </div>

        {/* 5. PRIVACIDAD & SEGURIDAD DE DATOS */}
        <div className="p-3 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0070F3] dark:text-[#38BDF8] shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Privacidad y Protección Local
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400">
                Tus tarjetas, saldos y rutas habituales permanecen guardadas únicamente en tu dispositivo
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#0060EA] dark:text-[#38BDF8] bg-white dark:bg-[#070D18] px-2 py-0.5 rounded-full border border-[#BFDBFE] dark:border-[#0080FF]/40 shrink-0">
            Seguro
          </span>
        </div>

        {/* 6. CIUDAD ACTIVA */}
        <div className="p-3 bg-[#F8FAFC] dark:bg-[#070D18] rounded-xl border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Ciudad Activa: {cityName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Cambia entre Bogotá, Medellín, Cali, Barranquilla o Bucaramanga
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCitiesTab();
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1B2E] hover:bg-slate-100 dark:hover:bg-[#15233A] text-xs font-bold text-[#0060EA] dark:text-[#38BDF8] border border-slate-200 dark:border-[#0080FF]/40 cursor-pointer transition shadow-2xs"
          >
            Cambiar
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-[#1C2A3E]">
          A Tiempo · Tu Salida Exacta en Transporte Masivo · Colombia
        </div>
      </div>
    </div>
  );
};
