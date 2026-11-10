export type TuLlaveCardType =
  | 'personalizada'
  | 'basica'
  | 'sisben'
  | 'adulto_mayor'
  | 'estudiantil'
  | 'discapacidad'
  | 'eventual'
  | 'transmipass';

export interface TransMiPassPlan {
  isActive: boolean;
  totalPasses: number; // 65 viajes
  usedPasses: number;  // p.ej. 22
  expiresAtMs: number; // timestamp
  costMonthlyCop: number; // Tarifa plana mensual
  planTitle: string;
  savingsEstimateCop: number;
}

export interface TransMiBiciBenefit {
  isRegistered: boolean;
  bicycleSerial?: string;
  totalBikeTrips: number;
  tripsTowardsFreePass: number; // 0 a 30 (Por cada 30 viajes bici + bus = 1 pasaje gratis)
  rewardPassesClaimed: number;
  lastValidationStation?: string;
  preferredStation?: string;
}

export interface CicloparqueaderoInfo {
  id: string;
  name: string;
  portalOrStation: string;
  capacityTotal: number;
  availableSpots: number;
  category: 'Oro' | 'Plata' | 'Estándar';
  covered: boolean;
  surveillance24h: boolean;
  operatingHours: string;
}

export interface LostItemReport {
  id: string;
  category: 'documentos' | 'llaves' | 'tecnologia' | 'bolsos' | 'tarjetas' | 'otros';
  title: string;
  description: string;
  stationOrLine: string;
  dateReported: string;
  status: 'en_custodia' | 'reclamado';
  pickupLocation: string;
}

export interface TuLlaveCard {
  id: string;
  serialNumber: string; // 16 digits
  alias: string;
  cardholderName: string;
  documentNumber: string;
  type: TuLlaveCardType;
  cityId?: string; // 'bogota' | 'medellin' | 'cali' | 'barranquilla' | 'cartagena' | 'pereira' | 'bucaramanga'
  systemBrand?: string; // 'TuLlave' | 'Cívica' | 'MÍO' | 'Transmetro' | 'Transcaribe' | 'Megabús' | 'Metrolínea'
  balance: number; // in COP
  pendingWebRecharge: number; // pending activation at station totem/NFC
  lastCheckedAt: number; // timestamp ms
  creditTripsRemaining: number; // up to 2 for personalizada
  isDefault: boolean;
  transMiPassPlan?: TransMiPassPlan;
  transMiBici?: TransMiBiciBenefit;
}

export type PaymentMethod = 'nequi' | 'pse' | 'daviplata' | 'breb' | 'bancolombia';

export interface TuLlaveTransaction {
  id: string;
  cardId: string;
  dateMs: number;
  type:
    | 'recharge_pse'
    | 'recharge_nequi'
    | 'recharge_daviplata'
    | 'recharge_bancolombia'
    | 'trip_transmilenio'
    | 'trip_sitp'
    | 'trip_metro'
    | 'trip_transfer'
    | 'web_activation'
    | 'transmibici_reward'
    | 'transmipass_activation'
    | 'transmipass_trip';
  amount: number; // positive for credit, negative for debit
  title: string;
  stationOrChannel: string;
  referenceCode?: string;
  status: 'approved' | 'pending_activation' | 'completed';
}

export const TULLAVE_FARES = {
  TRANSMILENIO: 3550, // Tarifa oficial 2026: $3.550 COP
  SITP_ZONAL: 3550,   // Tarifa unificada 2026: $3.550 COP
  TRANSFER_WINDOW_MINUTES: 125,
  TRANSFER_MAX_COUNT: 2,
  TRANSFER_COST_PERSONALIZADA: 0,
  TRANSFER_COST_BASICA: 200,
  CREDIT_TRIPS_MAX: 2,
  TRANSMIPASS_TOTAL_PASSES: 65,
  TRANSMIPASS_MONTHLY_COST: 160000, // Tarifa oficial del abono mensual TransMilenio: $160.000 COP (ahorro de hasta ~$70.750 frente a 65 pasajes plenos)
  TRANSMIBICI_TRIPS_FOR_REWARD: 30, // 30 validaciones bici + bus = 1 pasaje gratis
};

