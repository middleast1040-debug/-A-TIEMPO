import React, { useState, useEffect, useMemo } from 'react';
import { Route, FavoriteDestination, ExitChecklistItem, TravelActivityState } from './types/transit';
import { INITIAL_BOGOTA_ROUTES, INITIAL_FAVORITES, INITIAL_CHECKLIST } from './data/bogotaRoutes';
import { calculateDeparture } from './utils/transitCalculator';
import { playDepartureChime } from './utils/audioAlert';
import { Header } from './components/Header';
import { RouteSelector } from './components/RouteSelector';
import { DepartureResultCard } from './components/DepartureResultCard';
import { CitiesExplorerTab } from './components/CitiesExplorerTab';
import { BogotaNewsSection } from './components/BogotaNewsSection';
import { FavoritesList } from './components/FavoritesList';
import { ChecklistDrawer } from './components/ChecklistDrawer';
import { AppSettingsModal } from './components/AppSettingsModal';
import { FocusDepartureMode } from './components/FocusDepartureMode';
import { SubscriptionFooterSection } from './components/SubscriptionFooterSection';
import { SocialShareFooter } from './components/SocialShareFooter';
import { COLOMBIA_SYSTEMS, TransitCitySystem } from './data/colombiaTransit';
import { TuLlaveCard, TuLlaveTransaction } from './types/tullave';
import { getStoredCards, saveStoredCards, getStoredTransactions } from './utils/tullaveStorage';
import { TuLlaveQuickWidget } from './components/TuLlaveQuickWidget';
import { TuLlaveManagerModal, TuLlaveTab } from './components/TuLlaveManagerModal';
import { QuickDestinationHub } from './components/QuickDestinationHub';
import { TransferWindowWidget } from './components/TransferWindowWidget';
import { BottomNavDock } from './components/BottomNavDock';
import { RadarTacticoModal } from './components/RadarTacticoModal';
import { BusLocatorSection } from './components/BusLocatorSection';
import { MapPin, ArrowRightLeft, Footprints, Gauge, Radar } from 'lucide-react';

export default function App() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('atiempo_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Sincronización robusta con la etiqueta html y el DOM global
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('atiempo_theme', themeMode);
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [selectedCityId, setSelectedCityId] = useState<string>('bogota');
  const currentCitySystem: TransitCitySystem = useMemo(() => {
    return COLOMBIA_SYSTEMS[selectedCityId] || COLOMBIA_SYSTEMS.bogota;
  }, [selectedCityId]);

  const [activeTab, setActiveTab] = useState<string>('planear');
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_BOGOTA_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('tm-h27');
  const [originStop, setOriginStop] = useState<string>('Estación Calle 100');
  const [destinationStop, setDestinationStop] = useState<string>('Portal Usme');
  const [travelState, setTravelState] = useState<TravelActivityState>('inactive');
  const [walkingMinutes, setWalkingMinutes] = useState<number>(5);
  const [bufferMinutes, setBufferMinutes] = useState<number>(1);
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<FavoriteDestination[]>(INITIAL_FAVORITES);
  const [checklist, setChecklist] = useState<ExitChecklistItem[]>(INITIAL_CHECKLIST);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(true);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [isConsulting, setIsConsulting] = useState(false);

  const [tullaveCards, setTullaveCards] = useState<TuLlaveCard[]>(() => getStoredCards());
  const [tullaveTransactions, setTullaveTransactions] = useState<TuLlaveTransaction[]>(() => getStoredTransactions());
  const [isTuLlaveModalOpen, setIsTuLlaveModalOpen] = useState(false);
  const [tuLlaveInitialTab, setTuLlaveInitialTab] = useState<TuLlaveTab | 'totems'>('saldo');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  const departureCalculation = useMemo(() => {
    if (!currentRoute) return null;
    return calculateDeparture(currentRoute, originStop || currentRoute.popularStop, walkingMinutes, bufferMinutes, currentTimeMs);
  }, [currentRoute, originStop, walkingMinutes, bufferMinutes, currentTimeMs]);

  const handleCalculate = async () => {
    setIsConsulting(true);
    setHasCalculated(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsConsulting(false);
  };

  const activeTuLlaveCard = useMemo(() => {
    return tullaveCards.find((c) => c.cityId === selectedCityId) || tullaveCards[0];
  }, [tullaveCards, selectedCityId]);

  const handleUpdateCards = (updated: TuLlaveCard[]) => {
    setTullaveCards(updated);
    saveStoredCards(updated);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleResetChecklist = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const handleAddChecklistItem = (label: string) => {
    const newItem: ExitChecklistItem = {
      id: `custom-${Date.now()}`,
      label,
      checked: false,
    };
    setChecklist((prev) => [...prev, newItem]);
  };

  const checkedCount = useMemo(() => checklist.filter((i) => i.checked).length, [checklist]);

  const isAlertTab = activeTab === 'noticias' || activeTab === 'alertas';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--canvas-bg)] text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      <Header
        onOpenChecklist={() => setIsChecklistOpen(true)}
        checklistCount={{ checked: checkedCount, total: checklist.length }}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 flex-1 pb-24 md:pb-10">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-[var(--surface-bg)] border border-[var(--border-color)] p-5 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0060EA] dark:text-cyan-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentCitySystem.name}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Pasaje ${currentCitySystem.fare.toLocaleString('es-CO')} · Transbordo $0</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Movilidad inteligente{' '}
                <span className="bg-gradient-to-r from-[#0060EA] to-emerald-500 dark:from-blue-400 dark:to-[#00E5A8] bg-clip-text text-transparent">
                  puerta a andén
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-[#0060EA] dark:text-cyan-400" />
                  <span>Caminata: <strong>{walkingMinutes} min</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Sincronización GPS activa</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsRadarOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] dark:from-blue-600 dark:to-cyan-500 hover:opacity-95 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer"
              >
                <Radar className="w-4 h-4" />
                <span>Radar Vial en Vivo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pestaña 1: Planear */}
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
                  onAddIntermediateStop={(stop) => setIntermediateStops((prev) => [...prev, stop])}
                  onRemoveIntermediateStop={(idx) =>
                    setIntermediateStops((prev) => prev.filter((_, i) => i !== idx))
                  }
                  onChangeIntermediateStop={(idx, val) =>
                    setIntermediateStops((prev) => prev.map((s, i) => (i === idx ? val : s)))
                  }
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
                    onOpenModal={(tab) => {
                      if (tab) setTuLlaveInitialTab(tab);
                      setIsTuLlaveModalOpen(true);
                    }}
                    onQuickRefresh={async () => {}}
                    isRefreshing={false}
                  />
                )}

                <FavoritesList
                  favorites={favorites}
                  routes={routes}
                  onSelectFavorite={(fav) => {
                    setSelectedRouteId(fav.routeId);
                    setOriginStop(fav.originStop);
                    setDestinationStop(fav.destinationStop);
                    handleCalculate();
                  }}
                  onRemoveFavorite={(id) =>
                    setFavorites((prev) => prev.filter((f) => f.id !== id))
                  }
                />
              </section>

              <section className="lg:col-span-6 space-y-5">
                {hasCalculated && departureCalculation && (
                  <div id="resultadoCard">
                    <DepartureResultCard
                      calculation={departureCalculation}
                      isAlarmActive={isAlarmActive && travelState === 'monitoring'}
                      onToggleAlarm={() => {
                        setIsAlarmActive(!isAlarmActive);
                        setTravelState((prev) => (prev === 'monitoring' ? 'inactive' : 'monitoring'));
                      }}
                      onTestChime={() => playDepartureChime('gentle')}
                      onOpenFocusMode={() => setIsFocusModeOpen(true)}
                      isFavorite={favorites.some(
                        (f) => f.routeId === selectedRouteId && f.destinationStop === destinationStop
                      )}
                      onToggleFavorite={() => {
                        const exists = favorites.some(
                          (f) => f.routeId === selectedRouteId && f.destinationStop === destinationStop
                        );
                        if (exists) {
                          setFavorites((prev) =>
                            prev.filter(
                              (f) => !(f.routeId === selectedRouteId && f.destinationStop === destinationStop)
                            )
                          );
                        } else {
                          setFavorites((prev) => [
                            ...prev,
                            {
                              id: `fav-${Date.now()}`,
                              label: destinationStop,
                              routeId: selectedRouteId,
                              originStop,
                              destinationStop,
                            },
                          ]);
                        }
                      }}
                      isConsulting={isConsulting}
                      currentTimeMs={currentTimeMs}
                      destinationStop={destinationStop}
                      cityName={currentCitySystem.name}
                      isWakeUpAlarmActive={false}
                      onToggleWakeUpAlarm={() => {}}
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
                  }}
                  onOpenMapForRoute={() => setIsRadarOpen(true)}
                />
              </section>
            </div>
          </div>
        )}

        {/* Pestaña 2: Transbordo */}
        {activeTab === 'transbordo' && (
          <TransferWindowWidget
            citySystem={currentCitySystem}
            onOpenCardManager={() => setIsTuLlaveModalOpen(true)}
          />
        )}

        {/* Pestaña 3: Ciudades */}
        {activeTab === 'ciudades' && (
          <CitiesExplorerTab
            selectedCityId={selectedCityId}
            onSelectCity={(cId) => {
              setSelectedCityId(cId);
              setActiveTab('planear');
            }}
            onOpenCardManager={() => setIsTuLlaveModalOpen(true)}
            onOpenFullScreenMap={() => setIsRadarOpen(true)}
          />
        )}

        {/* Pestaña 4: Alertas / Noticias */}
        {isAlertTab && (
          <BogotaNewsSection citySystem={currentCitySystem} />
        )}

        {/* Secciones Inferiores de Apoyo y Compartir */}
        <div className="pt-4 space-y-6">
          <SubscriptionFooterSection />
          <SocialShareFooter />
        </div>
      </main>

      <BottomNavDock
        activeTab={activeTab as any}
        onSelectTab={(tab) => {
          if (tab === 'tarjetas') {
            setIsTuLlaveModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        cardBalance={activeTuLlaveCard?.balance}
      />

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

      <AppSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        walkingMinutes={walkingMinutes}
        onChangeWalkingMinutes={setWalkingMinutes}
        bufferMinutes={bufferMinutes}
        onChangeBufferMinutes={setBufferMinutes}
      />

      {departureCalculation && isFocusModeOpen && (
        <FocusDepartureMode
          isOpen={isFocusModeOpen}
          onClose={() => setIsFocusModeOpen(false)}
          calculation={departureCalculation}
          currentTimeMs={currentTimeMs}
          destinationStop={destinationStop}
        />
      )}

      <TuLlaveManagerModal
        isOpen={isTuLlaveModalOpen}
        onClose={() => setIsTuLlaveModalOpen(false)}
        cards={tullaveCards}
        onUpdateCards={handleUpdateCards}
        transactions={tullaveTransactions}
        onUpdateTransactions={setTullaveTransactions}
        initialTab={tuLlaveInitialTab}
        activeCityId={selectedCityId}
      />
    </div>
  );
}
