import React, { useState, useEffect } from 'react';
import {
  TuLlaveCard,
  TuLlaveTransaction,
  PaymentMethod,
  TULLAVE_FARES,
  TuLlaveCardType,
  CicloparqueaderoInfo,
  LostItemReport,
} from '../types/tullave';
import {
  formatCopCurrency,
  formatCardNumber,
  calculateTrips,
  processRecharge,
  activatePendingRecharges,
  simulateTripSwipe,
  POPULAR_TOTEM_STATIONS,
  BOGOTA_CICLOPARQUEADEROS,
  OFFICIAL_LOST_ITEMS,
  registerTransMiBiciValidation,
  renewOrActivateTransMiPass,
  useTransMiPassValidation,
  saveStoredCards,
  saveStoredTransactions,
} from '../utils/tullaveStorage';
import { TuLlaveCardGraphic } from './TuLlaveCardGraphic';
import { CardCameraScannerModal } from './CardCameraScannerModal';
import {
  X,
  CreditCard,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Landmark,
  Building2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  Radio,
  Camera,
  Bike,
  Ticket,
  QrCode,
  Search,
  Sparkles,
  HelpCircle,
  Check,
  PackageCheck,
  Lock,
  Layers,
  MapPin,
  FileText,
  Copy,
} from 'lucide-react';
import { COLOMBIA_SYSTEMS } from '../data/colombiaTransit';

export type TuLlaveTab = 'saldo' | 'transmipass' | 'transmibici' | 'recargar' | 'servicios' | 'historial';

interface TuLlaveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: TuLlaveCard[];
  onUpdateCards: (cards: TuLlaveCard[]) => void;
  transactions: TuLlaveTransaction[];
  onUpdateTransactions: (txs: TuLlaveTransaction[]) => void;
  initialTab?: TuLlaveTab | 'totems';
  activeCityId?: string;
}

const PRESET_AMOUNTS = [10000, 20000, 30000, 50000];

const COLOMBIA_BANKS = [
  'Bancolombia',
  'Davivienda',
  'Nequi (PSE)',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco de Occidente',
  'Scotiabank Colpatria',
  'Banco Falabella',
  'Banco AV Villas',
  'Nu Colombia',
  'Lulo Bank',
  'RappiPay',
];

export const TuLlaveManagerModal: React.FC<TuLlaveManagerModalProps> = ({
  isOpen,
  onClose,
  cards,
  onUpdateCards,
  transactions,
  onUpdateTransactions,
  initialTab = 'saldo',
  activeCityId = 'bogota',
}) => {
  // Normalize initialTab
  const normalizedInitialTab: TuLlaveTab = initialTab === 'totems' ? 'servicios' : initialTab;
  const [activeTab, setActiveTab] = useState<TuLlaveTab>(normalizedInitialTab);

  const [selectedCardId, setSelectedCardId] = useState<string>(() => {
    const matchingCityCard = cards.find((c) => c.cityId === activeCityId);
    if (matchingCityCard) return matchingCityCard.id;
    const defaultCard = cards.find((c) => c.isDefault) || cards[0];
    return defaultCard?.id || '';
  });

  // Recharge Form State
  const [rechargeAmount, setRechargeAmount] = useState<number>(20000);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nequi');
  const [nequiPhone, setNequiPhone] = useState<string>('310 847 9201');
  const [selectedBank, setSelectedBank] = useState<string>('Bancolombia');
  const [instantNfcActivation, setInstantNfcActivation] = useState<boolean>(true);

  // Status / Simulation States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [lastApprovalCode, setLastApprovalCode] = useState<string | null>(null);

  // New Card Registration State
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardCity, setNewCardCity] = useState<string>(activeCityId || 'bogota');
  const [newCardSerial, setNewCardSerial] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardType, setNewCardType] = useState<TuLlaveCardType>('personalizada');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // TuLlave Virtual QR State (Dynamic token with countdown)
  const [isVirtualQrOpen, setIsVirtualQrOpen] = useState(false);
  const [qrCountdownSeconds, setQrCountdownSeconds] = useState(60);

  // TransMiBici State
  const [biciSearchFilter, setBiciSearchFilter] = useState('');
  const [selectedBiciStation, setSelectedBiciStation] = useState<string>('Portal Américas');

  // Lost items filter
  const [lostItemsFilter, setLostItemsFilter] = useState<'all' | 'documentos' | 'llaves' | 'tarjetas' | 'bolsos'>('all');
  const [lostSearchTerm, setLostSearchTerm] = useState('');
  const [isReportingLostItem, setIsReportingLostItem] = useState(false);
  const [lostItemTitleInput, setLostItemTitleInput] = useState('');
  const [lostItemStationInput, setLostItemStationInput] = useState('');
  const [lostItemContactInput, setLostItemContactInput] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVirtualQrOpen) {
      setQrCountdownSeconds(60);
      interval = setInterval(() => {
        setQrCountdownSeconds((prev) => (prev > 1 ? prev - 1 : 60));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVirtualQrOpen]);

  if (!isOpen) return null;

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const currentCardCity = currentCard?.cityId || activeCityId || 'bogota';
  const currentSystem = COLOMBIA_SYSTEMS[currentCardCity] || COLOMBIA_SYSTEMS.bogota;
  const currentCardFare = currentSystem.fare || 3550;
  const cardBrand = currentCard?.systemBrand || currentSystem.cardBrand;

  const handleScanCard = (scannedSerial: string, detectedType?: TuLlaveCardType) => {
    setIsAddingCard(true);
    setNewCardSerial(scannedSerial);
    if (detectedType) setNewCardType(detectedType);
    setStatusMessage({
      type: 'success',
      text: `Tarjeta escaneada con éxito: ${scannedSerial}. Completa el nombre o presiona vincular.`,
    });
    setIsScannerOpen(false);
  };

  const handleRefreshBalance = async () => {
    if (!currentCard) return;
    setIsRefreshing(true);
    setStatusMessage({ type: 'info', text: `Conectando con el sistema central de ${currentSystem.name}...` });

    await new Promise((r) => setTimeout(r, 800));

    const updated = cards.map((c) =>
      c.id === currentCard.id ? { ...c, lastCheckedAt: Date.now() } : c
    );
    onUpdateCards(updated);
    saveStoredCards(updated);
    setIsRefreshing(false);
    setStatusMessage({
      type: 'success',
      text: `Saldo verificado: ${formatCopCurrency(currentCard.balance)} (${calculateTrips(currentCard.balance, currentCardFare)} viajes disponibles a ${formatCopCurrency(currentCardFare)})`,
    });
  };

  const handleSimulateSwipe = (tripType: 'transmilenio' | 'sitp' | 'transbordo' | 'metro') => {
    if (!currentCard) return;
    const res = simulateTripSwipe(
      currentCard.id,
      tripType,
      currentCardFare,
      `Ingreso ${currentSystem.name} (${cardBrand})`
    );
    if (res.success) {
      const updated = cards.map((c) => (c.id === currentCard.id ? res.card : c));
      onUpdateCards(updated);
      saveStoredCards(updated);
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleActivateTotem = (stationName = 'Tótem de estación') => {
    if (!currentCard || currentCard.pendingWebRecharge <= 0) {
      setStatusMessage({
        type: 'info',
        text: 'No tienes recargas web pendientes por activar en esta tarjeta.',
      });
      return;
    }
    const activated = activatePendingRecharges(currentCard.id, stationName);
    const updated = cards.map((c) => (c.id === currentCard.id ? activated : c));
    onUpdateCards(updated);
    saveStoredCards(updated);
    setStatusMessage({
      type: 'success',
      text: `¡Recarga activada en ${stationName}! Se acreditaron ${formatCopCurrency(currentCard.pendingWebRecharge)}. Nuevo saldo: ${formatCopCurrency(activated.balance)}.`,
    });
  };

  const handleExecuteRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard) return;

    const finalAmount = customAmountText ? Number(customAmountText.replace(/\D/g, '')) : rechargeAmount;

    if (!finalAmount || finalAmount < 2000) {
      setStatusMessage({ type: 'error', text: 'El monto mínimo de recarga es $2.000 COP' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: 'Procesando pago seguro con la pasarela financiera...' });

    await new Promise((r) => setTimeout(r, 1200));

    const result = processRecharge(currentCard.id, finalAmount, paymentMethod, {
      instantActivation: instantNfcActivation,
      phoneNumber: nequiPhone,
      bankName: selectedBank,
    });

    const updatedCards = cards.map((c) => (c.id === currentCard.id ? result.card : c));
    onUpdateCards(updatedCards);
    saveStoredCards(updatedCards);

    const updatedTxs = [result.transaction, ...transactions];
    onUpdateTransactions(updatedTxs);
    saveStoredTransactions(updatedTxs);

    setIsProcessing(false);
    setLastApprovalCode(result.approvalCode);

    if (instantNfcActivation) {
      setStatusMessage({
        type: 'success',
        text: `¡Recarga de ${formatCopCurrency(finalAmount)} aprobada y activada exitosamente con NFC! Referencia: ${result.approvalCode}`,
      });
    } else {
      setStatusMessage({
        type: 'info',
        text: `¡Pago de ${formatCopCurrency(finalAmount)} aprobado! Recuerda acercar la tarjeta a un tótem en estación o portal para activar el saldo antes de ingresar.`,
      });
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSerial = newCardSerial.replace(/\D/g, '');
    if (cleanSerial.length < 10) {
      setStatusMessage({ type: 'error', text: 'Ingresa un número de tarjeta válido (mínimo 10 a 16 dígitos)' });
      return;
    }

    const systemForNewCard = COLOMBIA_SYSTEMS[newCardCity] || COLOMBIA_SYSTEMS.bogota;
    const newCard: TuLlaveCard = {
      id: `card-${Date.now()}`,
      serialNumber: cleanSerial.padEnd(16, '0').slice(0, 16),
      alias: newCardName.trim() || `Tarjeta ${systemForNewCard.cardBrand}`,
      cardholderName: newCardType === 'personalizada' ? 'USUARIO REGISTRADO' : 'AL PORTADOR',
      documentNumber: '',
      type: newCardType,
      cityId: newCardCity,
      systemBrand: systemForNewCard.cardBrand,
      balance: systemForNewCard.fare ? systemForNewCard.fare * 2 : 7100,
      pendingWebRecharge: 0,
      lastCheckedAt: Date.now(),
      creditTripsRemaining: newCardType === 'personalizada' ? 2 : 0,
      isDefault: false,
    };

    const updated = [...cards, newCard];
    onUpdateCards(updated);
    saveStoredCards(updated);
    setSelectedCardId(newCard.id);
    setIsAddingCard(false);
    setNewCardSerial('');
    setNewCardName('');
    setStatusMessage({
      type: 'success',
      text: `¡Tarjeta ${newCard.alias} vinculada exitosamente con cifrado local!`,
    });
  };

  // TransMiPass Actions
  const handleUseTransMiPass = () => {
    if (!currentCard) return;
    const res = useTransMiPassValidation(currentCard.id, 'Torniquete TransMilenio');
    if (res.success) {
      const updated = cards.map((c) => (c.id === currentCard.id ? res.card : c));
      onUpdateCards(updated);
      saveStoredCards(updated);
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleRenewTransMiPass = () => {
    if (!currentCard) return;
    const res = renewOrActivateTransMiPass(currentCard.id);
    if (res.success) {
      const updated = cards.map((c) => (c.id === currentCard.id ? res.card : c));
      onUpdateCards(updated);
      saveStoredCards(updated);
      setStatusMessage({ type: 'success', text: res.message });
    }
  };

  // TransMiBici Actions
  const handleRegisterBiciSwipe = () => {
    if (!currentCard) return;
    const res = registerTransMiBiciValidation(currentCard.id, selectedBiciStation);
    if (res.success) {
      const updated = cards.map((c) => (c.id === currentCard.id ? res.card : c));
      onUpdateCards(updated);
      saveStoredCards(updated);
      setStatusMessage({
        type: res.earnedReward ? 'success' : 'info',
        text: res.message,
      });
    }
  };

  // Filtered Cicloparqueaderos
  const filteredCicloparqueaderos = BOGOTA_CICLOPARQUEADEROS.filter((b) =>
    b.name.toLowerCase().includes(biciSearchFilter.toLowerCase()) ||
    b.portalOrStation.toLowerCase().includes(biciSearchFilter.toLowerCase())
  );

  // Filtered Lost Items
  const filteredLostItems = OFFICIAL_LOST_ITEMS.filter((item) => {
    const matchesCategory = lostItemsFilter === 'all' || item.category === lostItemsFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(lostSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(lostSearchTerm.toLowerCase()) ||
      item.stationOrLine.toLowerCase().includes(lostSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReportLostItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostItemTitleInput.trim()) return;
    setIsReportingLostItem(false);
    setStatusMessage({
      type: 'success',
      text: `Reporte preventivo radicado: "${lostItemTitleInput}". El personal de estación en ${lostItemStationInput || 'el sistema'} fue notificado.`,
    });
    setLostItemTitleInput('');
    setLostItemStationInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-left max-h-[92vh] transition-colors">
        {/* Header Row */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-3 shrink-0 bg-slate-50/80 dark:bg-[#070D18]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#0070F3]/20 border border-blue-200 dark:border-[#0070F3]/30 text-[#0060EA] dark:text-[#38BDF8]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Gestión de Tarjeta & Servicios TransMilenio</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Saldos, TransMiPass, TransMiBici, tótems y objetos extraviados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#15233A] transition cursor-pointer"
            aria-label="Cerrar modal de tarjeta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Deck - Subpestañas en Azul Eléctrico y Letras Blancas */}
        <div className="flex items-center gap-1.5 p-3 border-b border-slate-200 dark:border-[#1C2A3E] overflow-x-auto no-scrollbar shrink-0 bg-slate-50/70 dark:bg-[#070D18]/80 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('saldo');
              setStatusMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saldo'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] hover:bg-slate-100 dark:hover:bg-[#15233A]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Mi Tarjeta</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('transmipass');
              setStatusMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transmipass'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] hover:bg-slate-100 dark:hover:bg-[#15233A]'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>TransMiPass</span>
            {currentCard?.transMiPassPlan?.isActive && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('transmibici');
              setStatusMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transmibici'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] hover:bg-slate-100 dark:hover:bg-[#15233A]'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>TransMiBici</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('recargar');
              setStatusMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'recargar'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] hover:bg-slate-100 dark:hover:bg-[#15233A]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Recargas Web</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('servicios');
              setStatusMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'servicios'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] hover:bg-slate-100 dark:hover:bg-[#15233A]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Servicios & Tótems</span>
            {currentCard?.pendingWebRecharge > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('historial');
              setStatusMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'historial'
                ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] hover:bg-slate-100 dark:hover:bg-[#15233A]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Movimientos</span>
          </button>
        </div>

        {/* Status Notification Toast inside Modal */}
        {statusMessage && (
          <div
            className={`mx-5 mt-4 p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-2.5 shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#BFDBFE] dark:border-[#0080FF]/40 text-[#0060EA] dark:text-[#38BDF8]'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-100'
                : 'bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-500/40 text-sky-900 dark:text-sky-100'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8] shrink-0 mt-0.5" strokeWidth={2} />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" strokeWidth={2} />}
              {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-sky-500 shrink-0 animate-spin mt-0.5" strokeWidth={2} />}
              <span className="min-w-0 flex-1 break-words leading-snug font-medium">{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: MI TARJETA & SALDO */}
          {activeTab === 'saldo' && (
            <div className="space-y-5">
              {/* Card Switcher if multiple cards */}
              {cards.length > 1 && (
                <div className="flex items-center justify-between gap-2 bg-[#F8FAFC] dark:bg-[#070D18] p-2 rounded-2xl border border-slate-200 dark:border-[#1C2A3E]">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-2">Tarjeta:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {cards.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCardId(c.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                          c.id === selectedCardId
                            ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-xs'
                            : 'bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E]'
                        }`}
                      >
                        {c.alias}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(!isAddingCard)}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0E1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C2A3E] transition cursor-pointer flex items-center gap-1 font-bold whitespace-nowrap hover:border-[#0080FF]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Graphic Card Visualizer */}
              {currentCard && (
                <TuLlaveCardGraphic
                  card={currentCard}
                  fare={currentCardFare}
                  onRefresh={handleRefreshBalance}
                  isRefreshing={isRefreshing}
                />
              )}

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSimulateSwipe('transmilenio')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold transition flex flex-col items-center gap-1.5 cursor-pointer text-center"
                >
                  <Building2 className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />
                  <span>Ingreso Troncal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSwipe('sitp')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold transition flex flex-col items-center gap-1.5 cursor-pointer text-center"
                >
                  <Radio className="w-4 h-4 text-blue-500" />
                  <span>Ingreso SITP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSwipe('transbordo')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold transition flex flex-col items-center gap-1.5 cursor-pointer text-center"
                >
                  <Clock className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />
                  <span>Transbordo $0</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVirtualQrOpen(!isVirtualQrOpen)}
                  className="p-3 rounded-2xl bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-blue-100 dark:hover:bg-[#15233A] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] font-bold transition flex flex-col items-center gap-1.5 cursor-pointer text-center"
                >
                  <QrCode className="w-4 h-4" />
                  <span>TuLlave QR</span>
                </button>
              </div>

              {/* TuLlave Virtual QR Section (If Toggled) */}
              {isVirtualQrOpen && (
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-[#0070F3]/40 rounded-3xl text-center space-y-3 animate-in fade-in text-white shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-[#38BDF8]">
                      <QrCode className="w-4 h-4" />
                      Acceso Digital TuLlave QR
                    </span>
                    <span className="text-[10px] font-mono bg-blue-950 text-[#38BDF8] px-2 py-0.5 rounded border border-blue-800">
                      Expira en {qrCountdownSeconds}s
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Acerca este código al lector de barras 2D del torniquete para ingresar sin sacar el plástico físico.
                  </p>

                  <div className="w-48 h-48 bg-white rounded-2xl p-3 mx-auto shadow-md flex items-center justify-center">
                    {/* Simulated SVG QR Barcode with Animated Scan Line */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-90">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              (i % 2 === 0 && i % 3 === 0) || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                                ? 'bg-slate-950'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-x-0 h-1 bg-[#0070F3] shadow-[0_0_8px_#0070F3] animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Cédula: {currentCard?.documentNumber || '1020789456'}</span>
                    <button
                      type="button"
                      onClick={() => setQrCountdownSeconds(60)}
                      className="text-[#38BDF8] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSMIPASS (Abono Mensual Frecuente 65 Viajes) */}
          {activeTab === 'transmipass' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent border border-cyan-400/40 dark:border-cyan-500/30 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 shrink-0">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          TransMiPass Oficial TransMilenio
                        </h3>
                        <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">
                          65 Ingresos / Mes
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        El paquete mensual oficial para usuarios frecuentes. Válido por 30 días calendario a partir del primer uso.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar of 65 passes */}
                {currentCard?.transMiPassPlan?.isActive ? (
                  <div className="p-4 bg-white/90 dark:bg-slate-950/70 border border-cyan-200 dark:border-cyan-900/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Viajes restantes de tu abono mensual:
                      </span>
                      <span className="font-mono font-black text-cyan-600 dark:text-cyan-300 text-sm">
                        {currentCard.transMiPassPlan.totalPasses - currentCard.transMiPassPlan.usedPasses} de 65 viajes
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{
                          width: `${Math.round(
                            ((currentCard.transMiPassPlan.totalPasses - currentCard.transMiPassPlan.usedPasses) /
                              currentCard.transMiPassPlan.totalPasses) *
                              100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>Vigencia: 30 días calendario (máx. 6 usos/día)</span>
                      <span className="font-bold text-[#0060EA] dark:text-[#38BDF8]">
                        Ahorro estimado: ~$70.750 COP (Tarifa plana $160.000)
                      </span>
                    </div>

                    {/* Action button to simulate passing the turnstile with TransMiPass */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleUseTransMiPass}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Validar Paso con TransMiPass ($0 Saldo)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRenewTransMiPass}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        Renovar 65 Viajes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
                    <p className="text-slate-600 dark:text-slate-300">
                      Esta tarjeta aún no tiene un plan TransMiPass vinculado. Actívalo para disfrutar de una tarifa plana con 65 ingresos mensuales.
                    </p>
                    <button
                      type="button"
                      onClick={handleRenewTransMiPass}
                      className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Activar TransMiPass en esta Tarjeta</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Guía Oficial de Adquisición y Reclamación de Tarjeta Física */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  ¿Cómo funciona el proceso oficial de TransMiPass?
                </span>
                <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
                  <li>
                    <strong>Gestión Digital & Costo:</strong> El abono cuesta <strong>$160.000 COP</strong> por 65 viajes (cada pasaje sale a solo <strong>$2.461 COP</strong>). Se adquiere a través de los canales digitales y taquillas oficiales autorizadas.
                  </li>
                  <li>
                    <strong>Tarjeta física con nueva tecnología ($8.000 COP):</strong> Al ser una tecnología inteligente diferente a TuLlave básica, se adquiere un plástico nuevo por única vez (total primera compra: $168.000 COP).
                  </li>
                  <li>
                    <strong>Puntos de entrega:</strong> Se reclama en taquillas peatonales autorizadas de Portales (Portal Norte, Américas, Suba, Calle 80, 20 de Julio, Sur y El Dorado) con tu cédula original.
                  </li>
                  <li>
                    <strong>Condiciones:</strong> Válido 30 días calendario (no acumulables) y permite hasta 6 usos diarios.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSMIBICI (Cicloparqueaderos & Recompensa de Viajes) */}
          {activeTab === 'transmibici' && (
            <div className="space-y-5">
              {/* Beneficio de 30 viajes = 1 pasaje gratis */}
              <div className="bg-gradient-to-br from-[#0080FF]/15 via-[#0060EA]/5 to-transparent border border-[#0070F3]/40 dark:border-[#0080FF]/30 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0070F3] dark:text-[#38BDF8] shrink-0">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        TransMiBici · Red de Cicloparqueaderos
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        Incentivo Oficial
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Por cada <strong>30 validaciones acumuladas</strong> guardando tu bicicleta y usando el transporte masivo, recibes <strong>1 pasaje 100% gratis</strong> abonado a tu tarjeta TuLlave personalizada.
                    </p>
                  </div>
                </div>

                {/* Progress bar towards 30 trips */}
                <div className="p-4 bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-[#1C2A3E] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Validaciones acumuladas hacia tu pasaje gratis:
                    </span>
                    <span className="font-mono font-black text-[#0060EA] dark:text-[#38BDF8] text-sm">
                      {currentCard?.transMiBici?.tripsTowardsFreePass || 0} / 30 viajes
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0080FF] to-[#0060EA] transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((currentCard?.transMiBici?.tripsTowardsFreePass || 0) / 30) * 100)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      Faltan {30 - (currentCard?.transMiBici?.tripsTowardsFreePass || 0)} viajes para ganar 1 pasaje ($3.550 COP)
                    </span>
                    <span className="font-bold text-[#0060EA] dark:text-[#38BDF8]">
                      Premios reclamados: {currentCard?.transMiBici?.rewardPassesClaimed || 0}
                    </span>
                  </div>

                  {/* Simulator action button to register bike swipe */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <select
                        value={selectedBiciStation}
                        onChange={(e) => setSelectedBiciStation(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white font-medium cursor-pointer focus:border-[#0070F3]"
                      >
                        {BOGOTA_CICLOPARQUEADEROS.map((b) => (
                          <option key={b.id} value={b.portalOrStation}>
                            {b.name} ({b.availableSpots} cupos)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterBiciSwipe}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 whitespace-nowrap active:scale-95"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Registrar Bici + Bus Hoy (+1)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Directorio de Cicloparqueaderos de TransMilenio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Directorio de Cicloparqueaderos ({BOGOTA_CICLOPARQUEADEROS.length} Puntos)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Servicio gratuito y cubierto de 05:00 a 00:00 con vigilancia 24h
                    </p>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={biciSearchFilter}
                      onChange={(e) => setBiciSearchFilter(e.target.value)}
                      placeholder="Buscar portal..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto no-scrollbar">
                  {filteredCicloparqueaderos.map((cp) => (
                    <div
                      key={cp.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {cp.portalOrStation}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            cp.category === 'Oro'
                              ? 'bg-blue-100 dark:bg-blue-950 text-[#0060EA] dark:text-[#38BDF8] border border-blue-300 dark:border-blue-800'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Cat. {cp.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Cupos libres ahora:</span>
                        <span className="font-mono font-bold text-[#0060EA] dark:text-[#38BDF8]">
                          {cp.availableSpots} / {cp.capacityTotal}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60">
                        <span>Horario: {cp.operatingHours}</span>
                        <span className="text-[#0060EA] dark:text-[#38BDF8] font-semibold">Gratis con TuLlave</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECARGAS WEB */}
          {activeTab === 'recargar' && (
            <div className="space-y-5">
              <form onSubmit={handleExecuteRecharge} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Selecciona el monto a recargar:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setRechargeAmount(amt);
                          setCustomAmountText('');
                        }}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                          rechargeAmount === amt && !customAmountText
                            ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0080FF] shadow-xs'
                            : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#BFDBFE] dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 hover:bg-[#DBEAFE] dark:hover:bg-[#15233A]'
                        }`}
                      >
                        {formatCopCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Gateway Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Método de pago financiero:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'nequi', label: 'Nequi', sub: 'Celular directo' },
                      { id: 'daviplata', label: 'Daviplata', sub: 'Davivienda' },
                      { id: 'breb', label: 'Bre-B', sub: 'Interoperable' },
                      { id: 'pse', label: 'PSE', sub: 'Bancos' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          paymentMethod === m.id
                            ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0080FF] shadow-xs ring-1 ring-[#0080FF]/40'
                            : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#BFDBFE] dark:border-[#1C2A3E] text-slate-700 dark:text-slate-300 hover:bg-[#DBEAFE] dark:hover:bg-[#15233A]'
                        }`}
                      >
                        <span className={`font-bold block ${paymentMethod === m.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{m.label}</span>
                        <span className={`text-[10px] ${paymentMethod === m.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{m.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant NFC Activation Toggle */}
                <div className="p-3.5 bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Activación Instantánea NFC
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Acredita el saldo inmediatamente sin necesidad de pasar por un tótem
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={instantNfcActivation}
                    onChange={(e) => setInstantNfcActivation(e.target.checked)}
                    className="w-4 h-4 accent-[#0070F3] cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-black text-sm rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando pago seguro...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Recargar {formatCopCurrency(rechargeAmount)} COP</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SERVICIOS OFICIALES DE TRANSMILENIO & TÓTEMS */}
          {activeTab === 'servicios' && (
            <div className="space-y-5">
              {/* 1. TÓTEMS DE ACTIVACIÓN DE SALDO WEB */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Tótems de Activación de Saldo Web
                    </span>
                  </div>
                  {currentCard?.pendingWebRecharge > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                      {formatCopCurrency(currentCard.pendingWebRecharge)} por activar
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Si recargas por PSE o Nequi tradicional, debes acercar tu tarjeta física a cualquiera de los tótems automáticos en estaciones para activar el saldo en el chip.
                </p>

                {currentCard?.pendingWebRecharge > 0 && (
                  <button
                    type="button"
                    onClick={() => handleActivateTotem('Tótem Portal')}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simular Activación en Tótem Ahora</span>
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {POPULAR_TOTEM_STATIONS.slice(0, 6).map((totem, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5"
                    >
                      <strong className="text-slate-900 dark:text-white block font-bold text-[11px]">
                        {totem.name}
                      </strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {totem.line} · {totem.devices}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. OFICINA VIRTUAL DE OBJETOS EXTRAVIADOS */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Oficina Virtual de Objetos Extraviados
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReportingLostItem(!isReportingLostItem)}
                    className="text-[11px] font-bold text-[#0060EA] dark:text-[#38BDF8] hover:underline cursor-pointer"
                  >
                    {isReportingLostItem ? 'Ver listado' : '+ Reportar extravío'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consulta pertenencias y documentos encontrados en buses o estaciones en custodia oficial. Para reclamar, preséntate con tu documento de identidad original.
                </p>

                {isReportingLostItem ? (
                  <form onSubmit={handleReportLostItemSubmit} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Radicar reporte preventivo de extravío:
                    </span>
                    <input
                      type="text"
                      value={lostItemTitleInput}
                      onChange={(e) => setLostItemTitleInput(e.target.value)}
                      placeholder="Descripción del objeto (ej. Billetera café, llaves)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      value={lostItemStationInput}
                      onChange={(e) => setLostItemStationInput(e.target.value)}
                      placeholder="Estación, portal o ruta donde se extravió"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
                    >
                      Enviar Reporte Preventivo
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {filteredLostItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-bold text-[#0060EA] dark:text-[#38BDF8] bg-blue-50 dark:bg-[#0E1B2E] px-1.5 py-0.5 rounded border border-blue-200 dark:border-[#0080FF]/30">
                              En custodia
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="text-[9px] text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                            Reclamo: {item.pickupLocation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. CRÉDITO DE RESPALDO (2 VIAJES FIAOS) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0070F3] dark:text-[#38BDF8]" />
                  Beneficio de 2 Viajes a Crédito de Respaldo
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Con tu tarjeta personalizada nunca te quedas varado. Si tu saldo se agota en hora pico, el sistema te presta hasta <strong>2 pasajes</strong> (permitiendo viajar hasta con -$7.100 COP). El valor fiado se descuenta automáticamente en tu próxima recarga.
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                  <span>Cupos a crédito restantes en esta tarjeta:</span>
                  <span className="font-mono font-bold text-[#0060EA] dark:text-[#38BDF8]">
                    {currentCard?.creditTripsRemaining ?? 2} de 2 viajes disponibles
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HISTORIAL DE MOVIMIENTOS */}
          {activeTab === 'historial' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Movimientos Recientes ({transactions.length})
                </span>
              </div>

              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          tx.amount > 0
                            ? 'bg-[#EFF6FF] text-[#0060EA] dark:bg-[#0E1B2E] dark:text-[#38BDF8] border border-blue-200 dark:border-[#0070F3]/30'
                            : tx.amount === 0
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : tx.amount === 0 ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {tx.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {tx.stationOrChannel} · {new Date(tx.dateMs).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono font-bold shrink-0 ${
                        tx.amount > 0
                          ? 'text-[#0060EA] dark:text-[#38BDF8]'
                          : tx.amount === 0
                          ? 'text-blue-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.amount === 0 ? '$0' : `${tx.amount > 0 ? '+' : ''}${formatCopCurrency(tx.amount)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Camera Scanner Modal */}
        {isScannerOpen && (
          <CardCameraScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onScanComplete={handleScanCard}
          />
        )}
      </div>
    </div>
  );
};
