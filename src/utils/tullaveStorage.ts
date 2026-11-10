import { TuLlaveCard, TuLlaveTransaction, PaymentMethod, TULLAVE_FARES } from '../types/tullave';
import { encryptedLocalStorageGet, encryptedLocalStorageSet } from './cryptoStorage';

const CARDS_STORAGE_KEY = 'ontime_tullave_cards_v1';
const TXS_STORAGE_KEY = 'ontime_tullave_transactions_v1';

export const INITIAL_CARDS: TuLlaveCard[] = [
  {
    id: 'card-default-1',
    serialNumber: '1010000048291583',
    alias: 'Mi TuLlave Personal',
    cardholderName: 'CAMILO ANDRÉS MEJÍA',
    documentNumber: '1020789456',
    type: 'personalizada',
    cityId: 'bogota',
    systemBrand: 'TuLlave',
    balance: 17750, // exactamente 5 pasajes a $3.550 COP
    pendingWebRecharge: 0,
    lastCheckedAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    creditTripsRemaining: 2,
    isDefault: true,
    transMiPassPlan: {
      isActive: true,
      totalPasses: 65,
      usedPasses: 23,
      expiresAtMs: Date.now() + 1000 * 60 * 60 * 24 * 18, // 18 días restantes
      costMonthlyCop: 160000,
      planTitle: 'TransMiPass Frecuente (65 Ingresos)',
      savingsEstimateCop: 70750,
    },
    transMiBici: {
      isRegistered: true,
      bicycleSerial: 'BICI-BOG-2026-98124',
      totalBikeTrips: 44,
      tripsTowardsFreePass: 14, // 14 de 30 para el pasaje gratis
      rewardPassesClaimed: 1,
      lastValidationStation: 'Portal Américas',
      preferredStation: 'Portal Américas',
    },
  },
  {
    id: 'card-civica-med',
    serialNumber: '2020000078129401',
    alias: 'Cívica Metro Medellín',
    cardholderName: 'CAMILO ANDRÉS MEJÍA',
    documentNumber: '1020789456',
    type: 'personalizada',
    cityId: 'medellin',
    systemBrand: 'Cívica',
    balance: 18250, // 5 pasajes a $3.650 COP
    pendingWebRecharge: 0,
    lastCheckedAt: Date.now() - 1000 * 60 * 120,
    creditTripsRemaining: 2,
    isDefault: false,
  },
  {
    id: 'card-mio-cali',
    serialNumber: '3030000051940283',
    alias: 'Tarjeta MÍO Cali',
    cardholderName: 'CAMILO ANDRÉS MEJÍA',
    documentNumber: '1020789456',
    type: 'personalizada',
    cityId: 'cali',
    systemBrand: 'MÍO',
    balance: 13600, // 4 pasajes a $3.400 COP
    pendingWebRecharge: 0,
    lastCheckedAt: Date.now() - 1000 * 60 * 360,
    creditTripsRemaining: 1,
    isDefault: false,
  },
  {
    id: 'card-backup-2',
    serialNumber: '1010000089204412',
    alias: 'Tarjeta de Respaldo Bogotá',
    cardholderName: 'AL PORTADOR',
    documentNumber: '',
    type: 'basica',
    cityId: 'bogota',
    systemBrand: 'TuLlave',
    balance: 7100, // 2 pasajes a $3.550 COP
    pendingWebRecharge: 0,
    lastCheckedAt: Date.now() - 1000 * 60 * 180,
    creditTripsRemaining: 0,
    isDefault: false,
  },
];

export const INITIAL_TRANSACTIONS: TuLlaveTransaction[] = [
  {
    id: 'tx-1',
    cardId: 'card-default-1',
    dateMs: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    type: 'trip_transmilenio',
    amount: -TULLAVE_FARES.TRANSMILENIO,
    title: 'Viaje Troncal TransMilenio',
    stationOrChannel: 'Estación Calle 100 - Carril Sur',
    status: 'completed',
  },
  {
    id: 'tx-2',
    cardId: 'card-default-1',
    dateMs: Date.now() - 1000 * 60 * 60 * 4,
    type: 'trip_transfer',
    amount: 0,
    title: 'Transbordo SITP ($0)',
    stationOrChannel: 'Ruta Z8 - Usaquén (Ventana 110m)',
    status: 'completed',
  },
  {
    id: 'tx-3',
    cardId: 'card-default-1',
    dateMs: Date.now() - 1000 * 60 * 60 * 28, // yesterday
    type: 'recharge_nequi',
    amount: 20000,
    title: 'Recarga Nequi',
    stationOrChannel: 'Recarga Digital PSE/Nequi',
    referenceCode: 'NEQ-83921049',
    status: 'completed',
  },
  {
    id: 'tx-4',
    cardId: 'card-default-1',
    dateMs: Date.now() - 1000 * 60 * 60 * 27,
    type: 'web_activation',
    amount: 0,
    title: 'Activación en Tótem',
    stationOrChannel: 'Tótem Portal Norte - Módulo 2',
    status: 'completed',
  },
];

export function getStoredCards(): TuLlaveCard[] {
  const cards = encryptedLocalStorageGet<TuLlaveCard[]>(CARDS_STORAGE_KEY, INITIAL_CARDS);
  return Array.isArray(cards) && cards.length > 0 ? cards : INITIAL_CARDS;
}

export function saveStoredCards(cards: TuLlaveCard[]): void {
  encryptedLocalStorageSet(CARDS_STORAGE_KEY, cards);
}

export function getStoredTransactions(): TuLlaveTransaction[] {
  const txs = encryptedLocalStorageGet<TuLlaveTransaction[]>(TXS_STORAGE_KEY, INITIAL_TRANSACTIONS);
  return Array.isArray(txs) ? txs : INITIAL_TRANSACTIONS;
}

export function saveStoredTransactions(txs: TuLlaveTransaction[]): void {
  encryptedLocalStorageSet(TXS_STORAGE_KEY, txs);
}

export function formatCopCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(abs);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatCardNumber(num: string, masked = true): string {
  const clean = num.replace(/\D/g, '').padEnd(16, '0').slice(0, 16);
  if (masked) {
    return `${clean.slice(0, 4)} •••• •••• ${clean.slice(12, 16)}`;
  }
  return clean.replace(/(\d{4})/g, '$1 ').trim();
}

export function calculateTrips(balance: number, fare: number = TULLAVE_FARES.TRANSMILENIO): number {
  if (balance <= 0 || fare <= 0) return 0;
  return Math.floor(balance / fare);
}

export interface RechargeResult {
  card: TuLlaveCard;
  transaction: TuLlaveTransaction;
  approvalCode: string;
}

export function processRecharge(
  cardId: string,
  amount: number,
  method: PaymentMethod,
  options?: { instantActivation?: boolean; phoneNumber?: string; bankName?: string }
): RechargeResult {
  const cards = getStoredCards();
  const txs = getStoredTransactions();

  const cardIndex = cards.findIndex((c) => c.id === cardId);
  const targetCard = cardIndex >= 0 ? cards[cardIndex] : cards[0];

  const approvalCode = `CUS-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const now = Date.now();

  const methodTitles: Record<PaymentMethod, { title: string; channel: string }> = {
    nequi: { title: 'Recarga Nequi', channel: `Nequi (${options?.phoneNumber || '310 ••• 8820'})` },
    pse: { title: 'Recarga PSE', channel: options?.bankName || 'Bancolombia PSE' },
    daviplata: { title: 'Recarga Daviplata', channel: 'Daviplata App' },
    breb: { title: 'Recarga Bre-B', channel: 'Llave Bre-B Interoperable' },
    bancolombia: { title: 'Bancolombia A la mano', channel: 'App A la mano' },
  };

  const channelInfo = methodTitles[method];

  // In real life Bogotá, user can choose instant activation if device has NFC or activate at station
  const isInstant = Boolean(options?.instantActivation);

  let updatedCard: TuLlaveCard;
  if (isInstant) {
    updatedCard = {
      ...targetCard,
      balance: targetCard.balance + amount,
      pendingWebRecharge: 0,
      lastCheckedAt: now,
    };
  } else {
    updatedCard = {
      ...targetCard,
      pendingWebRecharge: targetCard.pendingWebRecharge + amount,
      lastCheckedAt: now,
    };
  }

  const newTx: TuLlaveTransaction = {
    id: `tx-${now}`,
    cardId: targetCard.id,
    dateMs: now,
    type: `recharge_${method}` as any,
    amount: amount,
    title: channelInfo.title,
    stationOrChannel: channelInfo.channel,
    referenceCode: approvalCode,
    status: isInstant ? 'approved' : 'pending_activation',
  };

  // If instant, also log the activation
  const newTxsList = [newTx, ...txs];
  if (isInstant) {
    newTxsList.unshift({
      id: `tx-act-${now + 1}`,
      cardId: targetCard.id,
      dateMs: now + 500,
      type: 'web_activation',
      amount: 0,
      title: 'Activación NFC Inmediata',
      stationOrChannel: 'Lector NFC Dispositivo Móvil',
      status: 'completed',
    });
  }

  const updatedCards = cards.map((c) => (c.id === targetCard.id ? updatedCard : c));
  saveStoredCards(updatedCards);
  saveStoredTransactions(newTxsList);

  return {
    card: updatedCard,
    transaction: newTx,
    approvalCode,
  };
}

export function activatePendingRecharges(cardId: string, totemLocation = 'Tótem Portal / Estación'): TuLlaveCard {
  const cards = getStoredCards();
  const txs = getStoredTransactions();

  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex < 0) return cards[0];

  const card = cards[cardIndex];
  if (card.pendingWebRecharge <= 0) return card;

  const activatedAmount = card.pendingWebRecharge;
  const now = Date.now();

  const updatedCard: TuLlaveCard = {
    ...card,
    balance: card.balance + activatedAmount,
    pendingWebRecharge: 0,
    lastCheckedAt: now,
  };

  const activationTx: TuLlaveTransaction = {
    id: `tx-act-${now}`,
    cardId: card.id,
    dateMs: now,
    type: 'web_activation',
    amount: 0,
    title: `Activación de Saldo (+${formatCopCurrency(activatedAmount)})`,
    stationOrChannel: totemLocation,
    status: 'completed',
  };

  // Update pending tx statuses to completed
  const updatedTxs = txs.map((t) => {
    if (t.cardId === cardId && t.status === 'pending_activation') {
      return { ...t, status: 'completed' as const };
    }
    return t;
  });

  const finalCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveStoredCards(finalCards);
  saveStoredTransactions([activationTx, ...updatedTxs]);

  return updatedCard;
}

export function simulateTripSwipe(
  cardId: string,
  tripType: 'transmilenio' | 'sitp' | 'transbordo' | 'metro',
  customFare?: number,
  customTitle?: string
): { success: boolean; card: TuLlaveCard; message: string } {
  const cards = getStoredCards();
  const txs = getStoredTransactions();

  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex < 0) return { success: false, card: cards[0], message: 'Tarjeta no encontrada' };

  const card = cards[cardIndex];
  const now = Date.now();

  let fare = customFare || TULLAVE_FARES.TRANSMILENIO;
  let title = customTitle || (card.systemBrand === 'Cívica' ? 'Viaje Metro de Medellín' : card.systemBrand === 'MÍO' ? 'Viaje Troncal MÍO' : 'Viaje Troncal TransMilenio');
  let station = 'Validador / Torniquete Estación';

  if (tripType === 'sitp') {
    fare = customFare || TULLAVE_FARES.SITP_ZONAL;
    title = customTitle || 'Viaje Zonal SITP';
    station = 'Validador Bus Urbano';
  } else if (tripType === 'transbordo') {
    fare = card.type === 'personalizada' ? TULLAVE_FARES.TRANSFER_COST_PERSONALIZADA : TULLAVE_FARES.TRANSFER_COST_BASICA;
    title = `Transbordo (${fare === 0 ? '$0' : formatCopCurrency(fare)})`;
    station = 'Validador Transbordo';
  } else if (tripType === 'metro') {
    fare = customFare || 3650;
    title = customTitle || 'Ingreso Torniquete Metro';
    station = 'Torniquete Estación Metro';
  }

  // Check if balance allows
  const newBalance = card.balance - fare;
  let newCredit = card.creditTripsRemaining;

  if (newBalance < 0) {
    if (card.type === 'personalizada' && newCredit > 0) {
      newCredit -= 1;
    } else {
      return {
        success: false,
        card,
        message: 'Saldo insuficiente. Recarga tu tarjeta para poder ingresar.',
      };
    }
  }

  const updatedCard: TuLlaveCard = {
    ...card,
    balance: newBalance,
    creditTripsRemaining: newCredit,
    lastCheckedAt: now,
  };

  const newTx: TuLlaveTransaction = {
    id: `tx-swipe-${now}`,
    cardId: card.id,
    dateMs: now,
    type: tripType === 'transmilenio' ? 'trip_transmilenio' : tripType === 'sitp' ? 'trip_sitp' : 'trip_transfer',
    amount: -fare,
    title,
    stationOrChannel: station,
    status: 'completed',
  };

  const finalCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveStoredCards(finalCards);
  saveStoredTransactions([newTx, ...txs]);

  return {
    success: true,
    card: updatedCard,
    message: fare === 0 ? '¡Transbordo exitoso a $0!' : `Ingreso autorizado. Se descontaron ${formatCopCurrency(fare)}.`,
  };
}

export const POPULAR_TOTEM_STATIONS = [
  { name: 'Portal Norte', line: 'Autopista Norte', devices: '6 tótems en plazoleta central' },
  { name: 'Calle 100 - Market', line: 'Troncal Autonorte', devices: '2 tótems en acceso peatonal' },
  { name: 'Portal Usme', line: 'Caracas Sur', devices: '4 tótems en taquilla oriente' },
  { name: 'Portal del 20 de Julio', line: 'Carrera 10', devices: '3 tótems en acceso principal' },
  { name: 'Banderas', line: 'Américas', devices: '5 tótems distribuidos en pasarelas' },
  { name: 'Portal El Dorado', line: 'Calle 26', devices: '4 tótems y máquinas automáticas' },
  { name: 'Ricaurte', line: 'Intercambiador NQS / Cll 13', devices: '4 tótems en túnel de conexión' },
  { name: 'Portal Suba', line: 'Avenida Suba', devices: '4 tótems en pasillo peatonal' },
  { name: 'Portal Sur - JFK', line: 'Autopista Sur', devices: '3 tótems en acceso norte' },
  { name: 'Portal Tunal', line: 'Troncal Tunal', devices: '3 tótems en taquilla central' },
];

export const BOGOTA_CICLOPARQUEADEROS = [
  {
    id: 'bici-americas',
    name: 'Cicloparqueadero Portal Américas',
    portalOrStation: 'Portal Américas',
    capacityTotal: 785,
    availableSpots: 142,
    category: 'Oro' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-20julio',
    name: 'Cicloparqueadero Portal 20 de Julio',
    portalOrStation: 'Portal 20 de Julio',
    capacityTotal: 778,
    availableSpots: 195,
    category: 'Oro' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-suba',
    name: 'Cicloparqueadero Portal Suba',
    portalOrStation: 'Portal Suba',
    capacityTotal: 648,
    availableSpots: 88,
    category: 'Oro' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-eldorado',
    name: 'Cicloparqueadero Portal Eldorado',
    portalOrStation: 'Portal Eldorado',
    capacityTotal: 532,
    availableSpots: 110,
    category: 'Oro' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-sur',
    name: 'Cicloparqueadero Portal Sur',
    portalOrStation: 'Portal Sur',
    capacityTotal: 495,
    availableSpots: 73,
    category: 'Plata' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-banderas',
    name: 'Cicloparqueadero Estación Banderas',
    portalOrStation: 'Estación Banderas',
    capacityTotal: 340,
    availableSpots: 45,
    category: 'Oro' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-norte',
    name: 'Cicloparqueadero Portal Norte',
    portalOrStation: 'Portal Norte',
    capacityTotal: 320,
    availableSpots: 64,
    category: 'Plata' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-tunal',
    name: 'Cicloparqueadero Portal Tunal',
    portalOrStation: 'Portal Tunal',
    capacityTotal: 310,
    availableSpots: 82,
    category: 'Plata' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00 (Lunes a Domingo)',
  },
  {
    id: 'bici-pradera',
    name: 'Cicloparqueadero Estación Pradera',
    portalOrStation: 'Estación Pradera (Américas)',
    capacityTotal: 156,
    availableSpots: 38,
    category: 'Estándar' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 23:00',
  },
  {
    id: 'bici-sanmateo',
    name: 'Cicloparqueadero Estación San Mateo (Soacha)',
    portalOrStation: 'Estación San Mateo',
    capacityTotal: 650,
    availableSpots: 91,
    category: 'Oro' as const,
    covered: true,
    surveillance24h: true,
    operatingHours: '05:00 - 00:00',
  },
];

export const OFFICIAL_LOST_ITEMS = [
  {
    id: 'lost-1',
    category: 'documentos' as const,
    title: 'Cédula de Ciudadanía a nombre de Laura Sofía Gómez',
    description: 'Encontrada en bus articulado H27 vagón central al llegar a Portal Usme.',
    stationOrLine: 'Portal Usme / Ruta H27',
    dateReported: 'Ayer, 04:30 PM',
    status: 'en_custodia' as const,
    pickupLocation: 'Punto de Atención al Usuario Portal Usme (Módulo 3)',
  },
  {
    id: 'lost-2',
    category: 'llaves' as const,
    title: 'Juego de 3 llaves con llavero metálico de TransMilenio',
    description: 'Dejadas en banca de espera de Estación Calle 100 costado sur.',
    stationOrLine: 'Estación Calle 100',
    dateReported: 'Hoy, 08:15 AM',
    status: 'en_custodia' as const,
    pickupLocation: 'Taquilla Peatonal Calle 100',
  },
  {
    id: 'lost-3',
    category: 'tarjetas' as const,
    title: 'Tarjeta TuLlave personalizada a nombre de Carlos Mora',
    description: 'Recuperada en torniquete 4 de Portal Américas tras validación.',
    stationOrLine: 'Portal Américas',
    dateReported: 'Hoy, 09:40 AM',
    status: 'en_custodia' as const,
    pickupLocation: 'Oficina de Atención Portal Américas',
  },
  {
    id: 'lost-4',
    category: 'bolsos' as const,
    title: 'Morral escolar negro con cartuchera y cuadernos',
    description: 'Olvidado en asiento preferencial de ruta SITP B924.',
    stationOrLine: 'SITP Zonal B924',
    dateReported: 'Hace 2 días',
    status: 'en_custodia' as const,
    pickupLocation: 'Oficina Central de Objetos Extraviados (Portal Suba)',
  },
];

/**
 * Simulates bike parking validation (TransMiBici).
 * Accumulates towards 30 trips; grants 1 free ride credit upon completing 30 trips.
 */
export function registerTransMiBiciValidation(
  cardId: string,
  stationName: string = 'Portal Américas'
): { success: boolean; card: TuLlaveCard; message: string; earnedReward: boolean } {
  const cards = getStoredCards();
  const txs = getStoredTransactions();
  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex < 0) return { success: false, card: cards[0], message: 'Tarjeta no encontrada', earnedReward: false };

  const card = cards[cardIndex];
  const now = Date.now();
  const currentBici = card.transMiBici || {
    isRegistered: true,
    totalBikeTrips: 0,
    tripsTowardsFreePass: 0,
    rewardPassesClaimed: 0,
  };

  const nextTripsTowards = currentBici.tripsTowardsFreePass + 1;
  const earnedReward = nextTripsTowards >= 30;

  const updatedBici = {
    ...currentBici,
    totalBikeTrips: currentBici.totalBikeTrips + 1,
    tripsTowardsFreePass: earnedReward ? 0 : nextTripsTowards,
    rewardPassesClaimed: earnedReward ? currentBici.rewardPassesClaimed + 1 : currentBici.rewardPassesClaimed,
    lastValidationStation: stationName,
  };

  // If reward earned, add $3.550 COP bonus ride to balance
  const bonusBalance = earnedReward ? TULLAVE_FARES.TRANSMILENIO : 0;
  const updatedCard: TuLlaveCard = {
    ...card,
    balance: card.balance + bonusBalance,
    transMiBici: updatedBici,
    lastCheckedAt: now,
  };

  const newTx: TuLlaveTransaction = {
    id: `tx-bici-${now}`,
    cardId: card.id,
    dateMs: now,
    type: earnedReward ? 'transmibici_reward' : 'trip_transfer',
    amount: bonusBalance,
    title: earnedReward ? '¡Pasaje Gratis TransMiBici (+30 viajes)!' : `Validación TransMiBici (${updatedBici.tripsTowardsFreePass}/30)`,
    stationOrChannel: stationName,
    status: 'completed',
  };

  const finalCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveStoredCards(finalCards);
  saveStoredTransactions([newTx, ...txs]);

  return {
    success: true,
    card: updatedCard,
    earnedReward,
    message: earnedReward
      ? '¡Felicitaciones! Completaste 30 validaciones en TransMiBici. Se abonó 1 pasaje 100% gratis a tu tarjeta.'
      : `Validación registrada en ${stationName}. Llevas ${updatedBici.tripsTowardsFreePass} de 30 para tu próximo pasaje gratis.`,
  };
}

/**
 * Activates or Renews the TransMiPass plan (65 trips valid for 30 calendar days).
 */
export function renewOrActivateTransMiPass(
  cardId: string
): { success: boolean; card: TuLlaveCard; message: string } {
  const cards = getStoredCards();
  const txs = getStoredTransactions();
  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex < 0) return { success: false, card: cards[0], message: 'Tarjeta no encontrada' };

  const card = cards[cardIndex];
  const now = Date.now();

  const newPlan = {
    isActive: true,
    totalPasses: 65,
    usedPasses: 0,
    expiresAtMs: now + 1000 * 60 * 60 * 24 * 30, // 30 días calendario
    costMonthlyCop: TULLAVE_FARES.TRANSMIPASS_MONTHLY_COST,
    planTitle: 'TransMiPass Mensual (65 Ingresos)',
    savingsEstimateCop: 70750, // 65 * 3550 = 230750 menos 160000 (Ahorro de $70.750 COP)
  };

  const updatedCard: TuLlaveCard = {
    ...card,
    type: 'transmipass',
    transMiPassPlan: newPlan,
    lastCheckedAt: now,
  };

  const newTx: TuLlaveTransaction = {
    id: `tx-tmpass-${now}`,
    cardId: card.id,
    dateMs: now,
    type: 'transmipass_activation',
    amount: -TULLAVE_FARES.TRANSMIPASS_MONTHLY_COST,
    title: 'Activación TransMiPass (65 Ingresos / 30 Días)',
    stationOrChannel: 'Taquilla Portal / Canal Digital',
    status: 'completed',
  };

  const finalCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveStoredCards(finalCards);
  saveStoredTransactions([newTx, ...txs]);

  return {
    success: true,
    card: updatedCard,
    message: 'TransMiPass activado exitosamente con 65 ingresos válidos por 30 días calendario.',
  };
}

/**
 * Uses one TransMiPass voucher entry without deducting cash balance.
 */
export function useTransMiPassValidation(
  cardId: string,
  stationName: string = 'Torniquete TransMilenio'
): { success: boolean; card: TuLlaveCard; message: string } {
  const cards = getStoredCards();
  const txs = getStoredTransactions();
  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex < 0) return { success: false, card: cards[0], message: 'Tarjeta no encontrada' };

  const card = cards[cardIndex];
  const now = Date.now();

  if (!card.transMiPassPlan || !card.transMiPassPlan.isActive) {
    return { success: false, card, message: 'La tarjeta no cuenta con un plan TransMiPass activo.' };
  }

  const remaining = card.transMiPassPlan.totalPasses - card.transMiPassPlan.usedPasses;
  if (remaining <= 0) {
    return { success: false, card, message: 'Has agotado los 65 viajes de tu plan TransMiPass mensual.' };
  }

  const updatedPlan = {
    ...card.transMiPassPlan,
    usedPasses: card.transMiPassPlan.usedPasses + 1,
  };

  const updatedCard: TuLlaveCard = {
    ...card,
    transMiPassPlan: updatedPlan,
    lastCheckedAt: now,
  };

  const newTx: TuLlaveTransaction = {
    id: `tx-pass-use-${now}`,
    cardId: card.id,
    dateMs: now,
    type: 'transmipass_trip',
    amount: 0,
    title: `Paso TransMiPass (${remaining - 1} viajes restantes)`,
    stationOrChannel: stationName,
    status: 'completed',
  };

  const finalCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveStoredCards(finalCards);
  saveStoredTransactions([newTx, ...txs]);

  return {
    success: true,
    card: updatedCard,
    message: `¡Ingreso autorizado con TransMiPass! Te quedan ${remaining - 1} viajes en tu mensualidad.`,
  };
}

