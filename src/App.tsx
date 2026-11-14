import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Route,
  FavoriteDestination,
  ExitChecklistItem,
  TravelActivityState,
} from './types/transit';
import {
  INITIAL_BOGOTA_ROUTES,
  INITIAL_FAVORITES,
  INITIAL_CHECKLIST,
} from './data/bogotaRoutes';
import { calculateDeparture } from './utils/transitCalculator';
import { playDepartureChime } from './utils/audioAlert';
import { Header } from './components/Header';
import { RouteSelector } from './components/RouteSelector';
import { DepartureResultCard } from './components/DepartureResultCard';
import { CitiesExplorerTab } from './components/CitiesExplorerTab';
import { FavoritesList } from './components/FavoritesList';
import { ChecklistDrawer } from './components/ChecklistDrawer';
import { AddCustomRouteModal } from './components/AddCustomRouteModal';
import { FocusDepartureMode } from './components/FocusDepartureMode';
import { BogotaNewsSection } from './components/BogotaNewsSection';
import { Logo } from './components/Logo';
import { COLOMBIA_SYSTEMS, TransitCitySystem } from './data/colombiaTransit';
import { TuLlaveCard, TuLlaveTransaction } from './types/tullave';
import { SubscriptionModal } from './components/SubscriptionModal';
import { HomeScreenWidgetModal } from './components/HomeScreenWidgetModal';
import {
  getStoredCards,
  saveStoredCards,
  getStoredTransactions,
} from './utils/tullaveStorage';
import { TuLlaveQuickWidget } from './components/TuLlaveQuickWidget';
import { TuLlaveManagerModal, TuLlaveTab } from './components/TuLlaveManagerModal';
import { QuickDestinationHub } from './components/QuickDestinationHub';
import { TransferWindowWidget } from './components/TransferWindowWidget';
import { BottomNavDock, AppNavTab } from './components/BottomNavDock';
import { AccessibilitySupportModal, AccessibilitySettings } from './components/AccessibilitySupportModal';
import { AppTutorialModal } from './components/AppTutorialModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { RadarTacticoModal } from './components/RadarTacticoModal';
import { WeeklyRouteSchedule } from './components/WeeklyRouteSchedule';
import { BusLocatorSection } from './components/BusLocatorSection';
import { SocialShareFooter } from './components/SocialShareFooter';
import { encryptedLocalStorageGet, encryptedLocalStorageSet } from './utils/cryptoStorage';
import {
  sendDeparturePushNotification,
  sendProximityArrivalNotification,
  sendLowBalancePushNotification,
  requestNotificationPermission,
  getNotificationPermission,
} from './utils/notifications';
import {
  getOfflineCacheStatus,
  syncOfflineTransitCache,
} from './utils/offlineTransitCache';
import {
  Radar,
  Play,
  CheckCircle2,
  WifiOff,
  MapPin,
  ArrowRightLeft,
  Footprints,
  Gauge,
} from 'lucide-react';

const STORAGE_KEYS = {
  CITY: 'ontime_colombia_selected_city_v1',
  ROUTES: 'ontime_bogota_routes_v1',
  FAVORITES: 'ontime_bogota_favorites_v1',
  SELECTED_ROUTE: 'ontime_bogota_selected_route_v1',
  ORIGIN_STOP: 'ontime_colombia_origin_stop_v1',
  DESTINATION_STOP: 'ontime_colombia_destination_stop_v1',
  WALK_MINS: 'ontime_bogota_walk_mins_v1',
  BUFFER_MINS: 'ontime_bogota_buffer_mins_v1',
  CHECKLIST: 'ontime_bogota_checklist_v1',
  ALARM: 'ontime_bogota_alarm_active_v1',
  TRAVEL_STATE: 'ontime_colombia_travel_state_v1',
};

type AppTab = 'planear' | 'transbordo' | 'ciudades' | 'noticias';

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CITY);
      if (saved && COLOMBIA_SYSTEMS[saved]) return saved;
    } catch {}
    return 'bogota';
  });

  const currentCitySystem: TransitCitySystem = useMemo(() => {
    return COLOMBIA_SYSTEMS[selectedCityId] || COLOMBIA_SYSTEMS.bogota;
  }, [selectedCityId]);

  const [activeTab, setActiveTab] = useState<AppTab>('planear');
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [routes, setRoutes] = useState<Route[]>(() => {
    try {
      const savedCity = localStorage.getItem(STORAGE_KEYS.CITY);
      if (savedCity && COLOMBIA_SYSTEMS[savedCity]) {
        return COLOMBIA_SYSTEMS[savedCity].routes;
      }
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BOGOTA_ROUTES;
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_ROUTE);
      if (saved) return saved;
    } catch {}
    return 'tm-h27';
  });

  const [originStop, setOriginStop] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORIGIN_STOP);
      if (saved) return saved;
    } catch {}
    return 'Estación Calle 100';
  });

  const [destinationStop, setDestinationStop] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DESTINATION_STOP);
      if (saved) return saved;
    } catch {}
    return 'Portal Usme';
  });

  const [travelState, setTravelState] = useState<TravelActivityState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRAVEL_STATE) as TravelActivityState;
      if (saved === 'inactive' || saved === 'monitoring' || saved === 'arrived') return saved;
    } catch {}
    return 'inactive';
  });

  const [walkingMinutes, setWalkingMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALK_MINS);
      if (saved) return Number(saved) || 5;
    } catch {}
    return 5;
  });

  const [bufferMinutes, setBufferMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUFFER_MINS);
      if (saved) return Number(saved);
    } catch {}
    return 1;
  });

  const [intermediateStops, setIntermediateStops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ontime_intermediate_stops_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleAddIntermediateStop = () => {
    if (intermediateStops.length >= 4) return;
    const allStops = currentCitySystem.stations || [];
    const candidate =
      allStops.find(
        (st) => st !== originStop && st !== destinationStop && !intermediateStops.includes(st)
      ) || 'Calle 72';
    const next = [...intermediateStops, candidate];
    setIntermediateStops(next);
    try {
      localStorage.setItem('ontime_intermediate_stops_v1', JSON.stringify(next));
    } catch {}
  };

  const handleRemoveIntermediateStop = (idx: number) => {
    const next = intermediateStops.filter((_, i) => i !== idx);
    setIntermediateStops(next);
    try {
      localStorage.setItem('ontime_intermediate_stops_v1', JSON.stringify(next));
    } catch {}
  };

  const handleChangeIntermediateStop = (idx: number, stop: string) => {
    const next = [...intermediateStops];
    next[idx] = stop;
    setIntermediateStops(next);
    try {
      localStorage.setItem('ontime_intermediate_stops_v1', JSON.stringify(next));
    } catch {}
  };

  const [isDataSaverActive, setIsDataSaverActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('atiempo_data_saver_v1') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleDataSaver = () => {
    setIsDataSaverActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('atiempo_data_saver_v1', String(next));
      } catch {}
      return next;
    });
  };

  const [favorites, setFavorites] = useState<FavoriteDestination[]>(() => {
    return encryptedLocalStorageGet<FavoriteDestination[]>(
      STORAGE_KEYS.FAVORITES,
      INITIAL_FAVORITES
    );
  });

  const [checklist, setChecklist] = useState<ExitChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CHECKLIST;
  });

  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALARM);
      if (saved) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [isConsulting, setIsConsulting] = useState(false);

  const [tullaveCards, setTullaveCards] = useState<TuLlaveCard[]>(() => getStoredCards());
  const [tullaveTransactions, setTullaveTransactions] = useState<TuLlaveTransaction[]>(() =>
    getStoredTransactions()
  );
  const [isTuLlaveModalOpen, setIsTuLlaveModalOpen] = useState(false);
  const [tuLlaveInitialTab, setTuLlaveInitialTab] = useState<TuLlaveTab | 'totems'>('saldo');
  const [isQuickRefreshingTuLlave, setIsQuickRefreshingTuLlave] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('atiempo_pro_subscription_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('atiempo_tutorial_seen_v1');
    } catch {
      return false;
    }
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [cacheStatus, setCacheStatus] = useState(() => getOfflineCacheStatus());
  const [isSyncingCache, setIsSyncingCache] = useState(false);
  const [cacheSyncToast, setCacheSyncToast] = useState<string | null>(null);

  const handleSyncCache = () => {
    setIsSyncingCache(true);
    setTimeout(() => {
      syncOfflineTransitCache();
      const updated = getOfflineCacheStatus();
      setCacheStatus(updated);
      setIsSyncingCache(false);
      setCacheSyncToast(`Memoria offline sincronizada (${updated.routesCount} rutas listas).`);
      setTimeout(() => setCacheSyncToast(null), 3500);
    }, 500);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isWakeUpAlarmActive, setIsWakeUpAlarmActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('atiempo_wakeup_alarm_v1') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleWakeUpAlarm = () => {
    setIsWakeUpAlarmActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('atiempo_wakeup_alarm_v1', String(next));
      } catch {}
      return next;
    });
  };

  const [pushPermission, setPushPermission] = useState<string>(() =>
    getNotificationPermission()
  );

  const handleRequestPushPermission = async () => {
    const res = await requestNotificationPermission();
    setPushPermission(res);
  };

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('atiempo_theme_mode_v1');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    try {
      localStorage.setItem('atiempo_theme_mode_v1', themeMode);
    } catch {}
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('atiempo_accessibility_support_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      speechAssistance: false,
      largeText: false,
      highContrast: false,
      visualFlashing: false,
      hapticFeedback: true,
      subsidizedProfile: null,
    };
  });
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);

  const handleActivateSubscription = () => {
    setIsSubscribed(true);
    try {
      localStorage.setItem('atiempo_pro_subscription_v1', 'true');
    } catch {}
  };

  const activeTuLlaveCard = useMemo(() => {
    const cityCard = tullaveCards.find((c) => c.cityId === selectedCityId);
    if (cityCard) return cityCard;
    return tullaveCards.find((c) => c.isDefault) || tullaveCards[0];
  }, [tullaveCards, selectedCityId]);

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    localStorage.setItem(STORAGE_KEYS.CITY, cityId);
    const targetSys = COLOMBIA_SYSTEMS[cityId];
    if (targetSys && targetSys.routes.length > 0) {
      setRoutes(targetSys.routes);
      const firstRoute = targetSys.routes[0];
      setSelectedRouteId(firstRoute.id);
      setOriginStop(firstRoute.popularStop || firstRoute.origin);
      setDestinationStop(firstRoute.destination);

      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(targetSys.routes));
      localStorage.setItem(STORAGE_KEYS.SELECTED_ROUTE, firstRoute.id);
      localStorage.setItem(STORAGE_KEYS.ORIGIN_STOP, firstRoute.popularStop || firstRoute.origin);
      localStorage.setItem(STORAGE_KEYS.DESTINATION_STOP, firstRoute.destination);
    }
    setTravelState('inactive');
    localStorage.setItem(STORAGE_KEYS.TRAVEL_STATE, 'inactive');

    const match = tullaveCards.find((c) => c.cityId === cityId);
    if (match) {
      const updated = tullaveCards.map((c) => ({
        ...c,
        isDefault: c.id === match.id,
      }));
      setTullaveCards(updated);
      saveStoredCards(updated);
    }
    setActiveTab('planear');
  };

  const handleOpenTuLlave = (tab: TuLlaveTab | 'totems' = 'saldo') => {
    setTuLlaveInitialTab(tab);
    setIsTuLlaveModalOpen(true);
  };

  const handleQuickRefreshTuLlave = async () => {
    if (!activeTuLlaveCard) return;
    setIsQuickRefreshingTuLlave(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const updated = tullaveCards.map((c) =>
      c.id === activeTuLlaveCard.id ? { ...c, lastCheckedAt: Date.now() } : c
    );
    setTullaveCards(updated);
    saveStoredCards(updated);
    setIsQuickRefreshingTuLlave(false);
  };

  const lastAlarmedBusRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    encryptedLocalStorageSet(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ROUTE, selectedRouteId);
  }, [selectedRouteId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORIGIN_STOP, originStop);
  }, [originStop]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DESTINATION_STOP, destinationStop);
  }, [destinationStop]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRAVEL_STATE, travelState);
  }, [travelState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALK_MINS, String(walkingMinutes));
  }, [walkingMinutes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUFFER_MINS, String(bufferMinutes));
  }, [bufferMinutes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALARM, JSON.stringify(isAlarmActive));
  }, [isAlarmActive]);

  const currentRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  const departureCalculation = useMemo(() => {
    if (!currentRoute) return null;
    return calculateDeparture(
      currentRoute,
      originStop || currentRoute.popularStop,
      walkingMinutes,
      bufferMinutes,
      currentTimeMs
    );
  }, [currentRoute, originStop, walkingMinutes, bufferMinutes, currentTimeMs]);

  const lastProximityAlarmRef = useRef<number>(0);
  const hasNotifiedLowBalanceRef = useRef<boolean>(false);

  useEffect(() => {
    if (!activeTuLlaveCard) return;
    const isLow = activeTuLlaveCard.balance < currentCitySystem.fare * 2;
    if (isLow && !hasNotifiedLowBalanceRef.current) {
      hasNotifiedLowBalanceRef.current = true;
      sendLowBalancePushNotification(
        activeTuLlaveCard.systemBrand || currentCitySystem.cardBrand,
        activeTuLlaveCard.balance,
        currentCitySystem.fare
      );
    }
  }, [activeTuLlaveCard, currentCitySystem]);

  useEffect(() => {
    if (travelState !== 'monitoring' || !departureCalculation) {
      return;
    }

    const remainingSec = departureCalculation.totalSecondsRemaining;
    const targetBus = departureCalculation.targetBusArrivalMs;

    if (isAlarmActive) {
      if (remainingSec <= 120 && remainingSec > 110 && lastAlarmedBusRef.current !== targetBus) {
        lastAlarmedBusRef.current = targetBus;
        playDepartureChime('gentle');
      } else if (remainingSec === 0 && lastAlarmedBusRef.current !== targetBus + 1) {
        lastAlarmedBusRef.current = targetBus + 1;
        playDepartureChime('urgent');
        sendDeparturePushNotification(
          currentRoute.code,
          originStop || currentRoute.popularStop,
          walkingMinutes
        );
      }
    }

    if (isWakeUpAlarmActive) {
      const transitMins = currentRoute.transitMinutes || 18;
      const destinationTimeMs = targetBus + transitMins * 60 * 1000;
      const msUntilDestination = destinationTimeMs - currentTimeMs;
      if (msUntilDestination <= 4 * 60 * 1000 && msUntilDestination > 3.4 * 60 * 1000) {
        if (lastProximityAlarmRef.current !== targetBus) {
          lastProximityAlarmRef.current = targetBus;
          playDepartureChime('urgent');
          sendProximityArrivalNotification(currentRoute.code, destinationStop, 2);
        }
      }
    }
  }, [
    departureCalculation,
    isAlarmActive,
    travelState,
    isWakeUpAlarmActive,
    currentRoute,
    originStop,
    destinationStop,
    walkingMinutes,
    currentTimeMs,
  ]);

  const handleCalculate = async () => {
    setIsConsulting(true);
    setHasCalculated(true);
    const el = document.getElementById('resultadoCard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsConsulting(false);
  };

  const handleSelectFavorite = (fav: FavoriteDestination) => {
    setSelectedRouteId(fav.routeId);
    setWalkingMinutes(fav.walkingMinutes);
    setBufferMinutes(fav.bufferMinutes);
    handleCalculate();
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isCurrentFavorite = useMemo(() => {
    return favorites.some((f) => f.routeId === selectedRouteId);
  }, [favorites, selectedRouteId]);

  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      setFavorites((prev) => prev.filter((f) => f.routeId !== selectedRouteId));
    } else {
      if (!currentRoute) return;
      const newFav: FavoriteDestination = {
        id: `fav-${Date.now()}`,
        routeId: currentRoute.id,
        customTitle: currentRoute.name,
        stopName: originStop || currentRoute.popularStop,
        walkingMinutes,
        bufferMinutes,
      };
      setFavorites((prev) => [newFav, ...prev]);
    }
  };

  const handleAddRoute = (newRoute: Route) => {
    setRoutes((prev) => [newRoute, ...prev]);
    setSelectedRouteId(newRoute.id);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleResetChecklist = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const handleAddChecklistItem = (label: string, sublabel: string) => {
    const newItem: ExitChecklistItem = {
      id: `chk-${Date.now()}`,
      label,
      sublabel,
      checked: false,
      iconName: 'ShieldCheck',
    };
    setChecklist((prev) => [...prev, newItem]);
  };

  const checklistCount = useMemo(() => {
    const checked = checklist.filter((i) => i.checked).length;
    return { checked, total: checklist.length };
  }, [checklist]);

  // Cálculo de ritmo de caminata sugerido según segundos restantes
  const walkPaceAdvice = useMemo(() => {
    if (!departureCalculation) return { label: 'Ritmo Normal', color: 'text-emerald-400' };
    const sec = departureCalculation.totalSecondsRemaining;
    if (sec > 300) return { label: 'Espera en casa aún', color: 'text-cyan-400' };
    if (sec > 60) return { label: 'Caminata constante (4.8 km/h)', color: 'text-emerald-400' };
    return { label: 'Paso rápido hacia el andén', color: 'text-amber-400' };
  }, [departureCalculation]);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-['Plus_Jakarta_Sans',sans-serif] transition-colors ${
        themeMode === 'light'
          ? 'bg-[#F4F6F9] text-slate-900'
          : 'bg-[#070D18] text-slate-100'
      } ${accessibilitySettings.largeText ? 'text-base sm:text-lg' : ''}`}
    >
      <Header
        onOpenChecklist={() => setIsChecklistOpen(true)}
        checklistCount={checklistCount}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 flex-1 pb-24 md:pb-8 box-border overflow-x-clip">
        {/* HUD DE PRECISIÓN PUERTA A ANDÉN */}
        <section className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#0C1424]/95 border border-slate-200 dark:border-slate-800/90 p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ciudades')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-xs font-bold text-blue-700 dark:text-cyan-300 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentCitySystem.name}</span>
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Pasaje ${currentCitySystem.fare.toLocaleString('es-CO')} · Transbordo $0</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Sincronización exacta{' '}
                <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
                  puerta a andén
                </span>
              </h1>

              {/* Telemetría Biométrica / Ritmo */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Footprints className="w-4 h-4 text-[#0070F3] dark:text-cyan-400" />
                  <span>Caminata: <strong>{walkingMinutes} min</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Gauge className="w-4 h-4 text-emerald-500" />
                  <span>Guía: <strong className={walkPaceAdvice.color}>{walkPaceAdvice.label}</strong></span>
                </div>
              </div>
            </div>

            {/* Acciones Directas: Radar Único y Monitor */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsRadarOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0055FF] to-[#0099FF] hover:from-[#0044DD] hover:to-[#0088EE] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                <Radar className="w-4 h-4" />
                <span>Radar Vial en Vivo</span>
              </button>

              <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      travelState === 'monitoring' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {travelState === 'monitoring' ? 'Alarma Activa' : 'En Espera'}
                  </span>
                </div>
                {travelState === 'monitoring' ? (
                  <button
                    type="button"
                    onClick={() => setTravelState('inactive')}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Pausar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTravelState('monitoring');
                      setIsAlarmActive(true);
                    }}
                    className="px-2.5 py-1 bg-blue-600/15 text-blue-600 dark:text-cyan-400 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Activar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {cacheSyncToast && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">{cacheSyncToast}</span>
          </div>
        )}

        {isOffline && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-500/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong className="block font-bold">Modo Sin Conexión Activo</strong>
                <span className="text-[11px]">{cacheStatus.routesCount} rutas operando offline.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncCache}
              className="px-3 py-1 text-xs font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg cursor-pointer"
            >
              Verificar
            </button>
          </div>
        )}

        {activeTab === 'planear' && (
          <div className="space-y-6">
            <QuickDestinationHub
              citySystem={currentCitySystem}
              currentDestination={destinationStop}
              onSelectDestination={(dest, orig) => {
                setDestinationStop(dest);
                if (orig) setOriginStop(orig);
                handleCalculate();
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <section className="lg:col-span-6 space-y-5">
                <RouteSelector
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRouteId={setSelectedRouteId}
                  originStop={originStop}
                  onChangeOriginStop={setOriginStop}
                  destinationStop={destinationStop}
                  onChangeDestinationStop={setDestinationStop}
                  intermediateStops={intermediateStops}
                  onAddIntermediateStop={handleAddIntermediateStop}
                  onRemoveIntermediateStop={handleRemoveIntermediateStop}
                  onChangeIntermediateStop={handleChangeIntermediateStop}
                  onOpenMap={() => setIsRadarOpen(true)}
                  availableStations={currentCitySystem.stations}
                  walkingMinutes={walkingMinutes}
                  onChangeWalkingMinutes={setWalkingMinutes}
                  bufferMinutes={bufferMinutes}
                  onChangeBufferMinutes={setBufferMinutes}
                  onCalculate={handleCalculate}
                  isConsulting={isConsulting}
                  currentTimeMs={currentTimeMs}
                  cityId={currentCitySystem.id}
                />

                {activeTuLlaveCard && (
                  <TuLlaveQuickWidget
                    card={activeTuLlaveCard}
                    fare={currentCitySystem.fare}
                    citySystemName={currentCitySystem.name}
                    onOpenModal={handleOpenTuLlave}
                    onQuickRefresh={handleQuickRefreshTuLlave}
                    isRefreshing={isQuickRefreshingTuLlave}
                  />
                )}
              </section>

              <section className="lg:col-span-6 space-y-5">
                {hasCalculated && departureCalculation && (
                  <div id="resultadoCard">
                    <DepartureResultCard
                      calculation={departureCalculation}
                      isAlarmActive={isAlarmActive && travelState === 'monitoring'}
                      onToggleAlarm={() => {
                        if (travelState !== 'monitoring') {
                          setTravelState('monitoring');
                          setIsAlarmActive(true);
                        } else {
                          setIsAlarmActive(!isAlarmActive);
                        }
                      }}
                      onTestChime={() => playDepartureChime('gentle')}
                      onOpenFocusMode={() => setIsFocusModeOpen(true)}
                      isFavorite={isCurrentFavorite}
                      onToggleFavorite={handleToggleFavorite}
                      isConsulting={isConsulting}
                      currentTimeMs={currentTimeMs}
                      destinationStop={destinationStop}
                      cityName={currentCitySystem.name}
                      isWakeUpAlarmActive={isWakeUpAlarmActive}
                      onToggleWakeUpAlarm={handleToggleWakeUpAlarm}
                    />
                  </div>
                )}

                <BusLocatorSection
                  routes={routes}
                  cityName={currentCitySystem.name}
                  onSelectBusRoute={(rId, orig, dest) => {
                    setSelectedRouteId(rId);
                    setOriginStop(orig);
                    setDestinationStop(dest);
                    handleCalculate();
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onOpenMapForRoute={(r) => {
                    setSelectedRouteId(r.id);
                    setIsRadarOpen(true);
                  }}
                />

                <FavoritesList
                  favorites={favorites}
                  routes={routes}
                  currentTimeMs={currentTimeMs}
                  onSelectFavorite={handleSelectFavorite}
                  onRemoveFavorite={handleRemoveFavorite}
                  onAddCurrentAsFavorite={handleToggleFavorite}
                />

                <WeeklyRouteSchedule
                  routes={routes}
                  currentRouteId={selectedRouteId}
                  originStop={originStop}
                  destinationStop={destinationStop}
                  onSelectRoute={(rId, orig, dest) => {
                    setSelectedRouteId(rId);
                    setOriginStop(orig);
                    setDestinationStop(dest);
                    handleCalculate();
                  }}
                />
              </section>
            </div>
          </div>
        )}

        {activeTab === 'transbordo' && (
          <div className="space-y-6">
            <TransferWindowWidget
              citySystem={currentCitySystem}
              onOpenCardManager={() => handleOpenTuLlave('saldo')}
            />
          </div>
        )}

        {activeTab === 'ciudades' && (
          <CitiesExplorerTab
            selectedCityId={selectedCityId}
            onSelectCity={(cityId) => {
              handleSelectCity(cityId);
              setActiveTab('planear');
            }}
            onOpenCardManager={() => handleOpenTuLlave('saldo')}
            onOpenFullScreenMap={() => setIsRadarOpen(true)}
          />
        )}

        {activeTab === 'noticias' && <BogotaNewsSection citySystem={currentCitySystem} />}
      </main>

      <BottomNavDock
        activeTab={activeTab as AppNavTab}
        onSelectTab={(tab) => {
          if (tab === 'tarjetas') {
            handleOpenTuLlave('saldo');
          } else {
            setActiveTab(tab as AppTab);
          }
        }}
        cardBalance={activeTuLlaveCard?.balance}
      />

      <footer className="w-full border-t border-slate-200 dark:border-[#1C2A3E] bg-white/95 dark:bg-[#070D18]/95 pt-5 pb-24 md:pb-8 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-3.5">
          <SocialShareFooter
            cityName={currentCitySystem.name}
            currentRouteCode={currentRoute?.code}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left pt-2 border-t border-slate-100 dark:border-[#1C2A3E]">
            <div className="flex items-center gap-2.5">
              <Logo size="sm" showText={false} />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Precisión Urbana · Hecho en Colombia
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              A Tiempo — Movilidad Inteligente
            </p>
          </div>
        </div>
      </footer>

      <RadarTacticoModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        cityName={currentCitySystem.name}
        cityId={currentCitySystem.id}
      />

      <ChecklistDrawer
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        items={checklist}
        onToggleItem={handleToggleChecklistItem}
        onResetItems={handleResetChecklist}
        onAddItem={handleAddChecklistItem}
      />

      <AddCustomRouteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRoute={handleAddRoute}
      />

      {isFocusModeOpen && departureCalculation && (
        <FocusDepartureMode
          calculation={departureCalculation}
          isAlarmActive={isAlarmActive && travelState === 'monitoring'}
          onToggleAlarm={() => setIsAlarmActive(!isAlarmActive)}
          onTestChime={() => playDepartureChime('gentle')}
          onClose={() => setIsFocusModeOpen(false)}
        />
      )}

      <TuLlaveManagerModal
        isOpen={isTuLlaveModalOpen}
        onClose={() => setIsTuLlaveModalOpen(false)}
        cards={tullaveCards}
        onUpdateCards={setTullaveCards}
        transactions={tullaveTransactions}
        onUpdateTransactions={setTullaveTransactions}
        initialTab={tuLlaveInitialTab}
        activeCityId={selectedCityId}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        isSubscribed={isSubscribed}
        onActivateSubscription={handleActivateSubscription}
        activeCard={activeTuLlaveCard}
      />

      {currentRoute && (
        <HomeScreenWidgetModal
          isOpen={isWidgetModalOpen}
          onClose={() => setIsWidgetModalOpen(false)}
          currentRoute={currentRoute}
          originStop={originStop}
          destinationStop={destinationStop}
          totalSecondsRemaining={departureCalculation?.totalSecondsRemaining || 480}
          cityName={currentCitySystem.name}
          cardBrand={currentCitySystem.cardBrand}
          balance={activeTuLlaveCard?.balance}
        />
      )}

      <AccessibilitySupportModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        settings={accessibilitySettings}
        onUpdateSettings={setAccessibilitySettings}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onActivateFreeAccess={() => {
          setIsSubscribed(true);
          try {
            localStorage.setItem('atiempo_pro_subscription_v1', 'true');
          } catch {}
        }}
        isSubscribed={isSubscribed}
      />

      <AppTutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        cityName={currentCitySystem.name}
      />

      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenTutorial={() => {
          setIsSettingsModalOpen(false);
          setIsTutorialModalOpen(true);
        }}
        onOpenAccessibilityModal={() => {
          setIsSettingsModalOpen(false);
          setIsAccessibilityModalOpen(true);
        }}
        onOpenCitiesTab={() => {
          setIsSettingsModalOpen(false);
          setActiveTab('ciudades');
        }}
        onSyncCache={handleSyncCache}
        cacheRoutesCount={cacheStatus.routesCount}
        lastSyncFormatted={cacheStatus.lastSyncFormatted}
        isSyncingCache={isSyncingCache}
        pushPermission={pushPermission}
        onRequestPushPermission={handleRequestPushPermission}
        isWakeUpAlarmActive={isWakeUpAlarmActive}
        onToggleWakeUpAlarm={() => setIsWakeUpAlarmActive((prev) => !prev)}
        cityName={currentCitySystem.name}
        isSubscribed={isSubscribed}
        onOpenSubscriptionModal={() => {
          setIsSettingsModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        onOpenChecklist={() => {
          setIsSettingsModalOpen(false);
          setIsChecklistOpen(true);
        }}
        isDataSaverActive={isDataSaverActive}
        onToggleDataSaver={handleToggleDataSaver}
        originStop={originStop}
        destinationStop={destinationStop}
        routeCode={currentRoute?.code || 'TM'}
      />
    </div>
  );
}
