import React, { useState, useEffect, useMemo } from 'react';
import { Route, FavoriteDestination, ExitChecklistItem, TravelActivityState } from './types/transit';
import { INITIAL_BOGOTA_ROUTES, INITIAL_FAVORITES, INITIAL_CHECKLIST } from './data/bogotaRoutes';
import { calculateDeparture } from './utils/transitCalculator';
import { playDepartureChime } from './utils/audioAlert';
import { Header } from './components/Header';
import { RouteSelector } from './components/RouteSelector';
import { DepartureResultCard } from './components/DepartureResultCard';
import { CitiesExplorerTab } from './components/CitiesExplorerTab';
import { FavoritesList } from './components/FavoritesList';
import { ChecklistDrawer } from './components/ChecklistDrawer';
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
  const [selectedCityId, setSelectedCityId] = useState<string>('bogota');
  const currentCitySystem: TransitCitySystem = useMemo(() => {
    return COLOMBIA_SYSTEMS[selectedCityId] || COLOMBIA_SYSTEMS.bogota;
  }, [selectedCityId]);

  const [activeTab, setActiveTab] = useState<'planear' | 'transbordo' | 'ciudades' | 'noticias'>('planear');
  const [isRadarOpen, setIsRadarOpen] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070D18] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <Header
        onOpenChecklist={() => setIsChecklistOpen(true)}
        checklistCount={{ checked: 0, total: checklist.length }}
        themeMode="dark"
        onToggleTheme={() => {}}
        onOpenSettings={() => {}}
      />

      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 flex-1 pb-24 md:pb-8">
        <section className="relative overflow-hidden rounded-3xl bg-[#0C1424] border border-slate-800 p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentCitySystem.name}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800 text-xs font-bold text-emerald-300">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Pasaje ${currentCitySystem.fare.toLocaleString('es-CO')} · Transbordo $0</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Movilidad inteligente{' '}
                <span className="bg-gradient-to-r from-blue-400 to-[#00E5A8] bg-clip-text text-transparent">
                  puerta a andén
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-cyan-400" />
                  <span>Caminata: <strong>{walkingMinutes} min</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span>Sincronización GPS activa</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsRadarOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer"
              >
                <Radar className="w-4 h-4" />
                <span>Radar Vial en Vivo</span>
              </button>
            </div>
          </div>
        </section>

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
                  onAddIntermediateStop={() => {}}
                  onRemoveIntermediateStop={() => {}}
                  onChangeIntermediateStop={() => {}}
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
                    onOpenModal={() => setIsTuLlaveModalOpen(true)}
                    onQuickRefresh={async () => {}}
                    isRefreshing={false}
                  />
                )}
              </section>

              <section className="lg:col-span-6 space-y-5">
                {hasCalculated && departureCalculation && (
                  <div id="resultadoCard">
                    <DepartureResultCard
                      calculation={departureCalculation}
                      isAlarmActive={isAlarmActive && travelState === 'monitoring'}
                      onToggleAlarm={() => setIsAlarmActive(!isAlarmActive)}
                      onTestChime={() => playDepartureChime('gentle')}
                      onOpenFocusMode={() => setIsFocusModeOpen(true)}
                      isFavorite={false}
                      onToggleFavorite={() => {}}
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

        {activeTab === 'transbordo' && (
          <TransferWindowWidget
            citySystem={currentCitySystem}
            onOpenCardManager={() => setIsTuLlaveModalOpen(true)}
          />
        )}

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
      </main>

      <BottomNavDock
        activeTab={activeTab === 'noticias' ? 'planear' : activeTab}
        onSelectTab={(tab) => {
          if (tab === 'tarjetas') {
            setIsTuLlaveModalOpen(true);
          } else {
            setActiveTab(tab as any);
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
        onToggleItem={() => {}}
        onResetItems={() => {}}
        onAddItem={() => {}}
      />

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
    </div>
  );
}
