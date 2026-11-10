export type TransitType =
  | 'transmilenio'
  | 'sitp'
  | 'alimentador'
  | 'metro'
  | 'tranvia'
  | 'cable'
  | 'brt';

export interface Route {
  id: string;
  code: string;
  type: TransitType;
  name: string;
  origin: string;
  destination: string;
  popularStop: string;
  zone: string;
  headwayMinutes: number;
  accentColor: string;
  corridor?: string;
  cityId?: string;
  transitMinutes?: number; // estimated ride duration on vehicle
  stationsList?: string[]; // stations along line
}

export type TravelActivityState = 'inactive' | 'monitoring' | 'arrived';

export interface FavoriteDestination {
  id: string;
  routeId: string;
  customTitle: string;
  stopName: string;
  walkingMinutes: number;
  bufferMinutes: number;
}

export type UrgencyLevel = 'safe' | 'get-ready' | 'leave-now' | 'just-missed';

export interface DepartureCalculation {
  route: Route;
  stopName: string;
  walkingMinutes: number;
  bufferMinutes: number;
  targetBusArrivalMs: number;
  nextBusArrivalMs: number;
  mustLeaveAtMs: number;
  totalSecondsRemaining: number;
  urgency: UrgencyLevel;
  distanceSummary?: string;
  trafficReport?: string;
  isLiveGps?: boolean;
}

export interface SuggestedTripTimeline {
  originStop: string;
  destinationStop: string;
  walkingMinutes: number;
  bufferMinutes: number;
  waitMinutes: number;
  rideMinutes: number;
  totalDurationMinutes: number;
  departureTimeFormatted: string;
  boardTimeFormatted: string;
  arrivalTimeFormatted: string;
  route: Route;
  fare: number;
  corridor: string;
  trafficStatus: 'fluido' | 'moderado' | 'congestionado';
  weatherCondition: string;
  temperatureC: number;
  rainProbability: number;
  weatherAdvisory: string;
  activeAlerts: string[];
}

export interface ExitChecklistItem {
  id: string;
  label: string;
  sublabel: string;
  checked: boolean;
  iconName: string;
}

export interface ScheduledWeeklyRoute {
  id: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  originStop: string;
  destinationStop: string;
  targetDepartureTime: string; // "HH:MM" e.g. "06:45"
  daysOfWeek: number[]; // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado, 0 = Domingo
  autoReminderEnabled: boolean;
  label?: string;
  color?: string;
}

