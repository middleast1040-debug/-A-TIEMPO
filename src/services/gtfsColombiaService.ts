/**
 * Colombian Transit GTFS Service Layer
 * Simulates standard lightweight GTFS feeds based on public datasets from datos.gov.co:
 * - Bogotá: TransMilenio S.A. & SITP (Alcaldía Mayor de Bogotá)
 * - Medellín: Metro de Medellín Ltda. & Metroplús
 * - Cali: Metrocali S.A. (Masivo Integrado de Occidente - MÍO)
 * - Barranquilla: Transmetro S.A.S.
 * - Bucaramanga: Metrolínea S.A.
 *
 * Indexed for sub-millisecond in-memory response (< 1ms) without network overhead.
 */

export interface GtfsAgency {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang: string;
  fare_cop: number;
}

export interface GtfsRoute {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string;
  route_type: number; // 3 = Bus, 1 = Metro/Subway, 0 = Tram
  route_color: string;
  route_text_color: string;
  headway_secs: number;
  corridor: string;
  stops_count: number;
  wheelchair_accessible: boolean;
}

export interface GtfsStop {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  zone_id: string;
  platform_code: string; // e.g. "Vagón 1 · Puerta 2"
  wheelchair_boarding: number; // 1 = accessible, 0 = no
  city_id: string;
}

export interface GtfsArrivalEstimate {
  route_id: string;
  route_code: string;
  destination: string;
  arrival_minutes: number;
  headway_minutes: number;
  platform_code: string;
  is_realtime_gps: boolean;
  gps_confidence_pct: number;
}

export interface GtfsAlert {
  id: string;
  city_id: string;
  route_id?: string;
  header_text: string;
  description_text: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp_ms: number;
}

// 1. AGENCIES (datos.gov.co)
export const GTFS_AGENCIES: Record<string, GtfsAgency> = {
  bogota: {
    agency_id: 'TMSA',
    agency_name: 'TransMilenio S.A. / SITP',
    agency_url: 'https://www.transmilenio.gov.co',
    agency_timezone: 'America/Bogota',
    agency_lang: 'es',
    fare_cop: 3550,
  },
  medellin: {
    agency_id: 'METROMED',
    agency_name: 'Metro de Medellín Ltda.',
    agency_url: 'https://www.metrodemedellin.gov.co',
    agency_timezone: 'America/Bogota',
    agency_lang: 'es',
    fare_cop: 3650,
  },
  cali: {
    agency_id: 'METROCALI',
    agency_name: 'Metrocali S.A. (MÍO)',
    agency_url: 'https://www.metrocali.gov.co',
    agency_timezone: 'America/Bogota',
    agency_lang: 'es',
    fare_cop: 3200,
  },
  barranquilla: {
    agency_id: 'TRANSMETRO',
    agency_name: 'Transmetro S.A.S.',
    agency_url: 'https://www.transmetro.gov.co',
    agency_timezone: 'America/Bogota',
    agency_lang: 'es',
    fare_cop: 3300,
  },
  bucaramanga: {
    agency_id: 'METROLINEA',
    agency_name: 'Metrolínea S.A.',
    agency_url: 'https://www.metrolinea.gov.co',
    agency_timezone: 'America/Bogota',
    agency_lang: 'es',
    fare_cop: 3100,
  },
};

// 2. GTFS ROUTES
export const GTFS_ROUTES: Record<string, GtfsRoute[]> = {
  bogota: [
    {
      route_id: 'tm-h27',
      agency_id: 'TMSA',
      route_short_name: 'H27',
      route_long_name: 'Portal Norte ↔ Portal Usme',
      route_desc: 'Expreso Troncal Caracas y Autopista Norte',
      route_type: 3,
      route_color: '#DC2626',
      route_text_color: '#FFFFFF',
      headway_secs: 360,
      corridor: 'Caracas / Autonorte',
      stops_count: 14,
      wheelchair_accessible: true,
    },
    {
      route_id: 'tm-c15',
      agency_id: 'TMSA',
      route_short_name: 'C15',
      route_long_name: 'Portal Tunal ↔ Portal Suba',
      route_desc: 'Expreso Troncal Suba y Caracas Sur',
      route_type: 3,
      route_color: '#DC2626',
      route_text_color: '#FFFFFF',
      headway_secs: 360,
      corridor: 'Troncal Suba',
      stops_count: 16,
      wheelchair_accessible: true,
    },
    {
      route_id: 'tm-k43',
      agency_id: 'TMSA',
      route_short_name: 'K43',
      route_long_name: 'San Mateo (Soacha) ↔ Portal Eldorado',
      route_desc: 'Troncal Calle 26 y NQS Sur',
      route_type: 3,
      route_color: '#DC2626',
      route_text_color: '#FFFFFF',
      headway_secs: 300,
      corridor: 'Calle 26 / NQS Sur',
      stops_count: 18,
      wheelchair_accessible: true,
    },
    {
      route_id: 'tm-b18',
      agency_id: 'TMSA',
      route_short_name: 'B18',
      route_long_name: 'Portal 20 de Julio ↔ Portal Norte',
      route_desc: 'Expreso Carrera 10 y Caracas',
      route_type: 3,
      route_color: '#DC2626',
      route_text_color: '#FFFFFF',
      headway_secs: 420,
      corridor: 'Carrera 10 / Caracas',
      stops_count: 15,
      wheelchair_accessible: true,
    },
    {
      route_id: 'tm-m86',
      agency_id: 'TMSA',
      route_short_name: 'M86',
      route_long_name: 'Aeropuerto Eldorado ↔ Hacienda Santa Bárbara',
      route_desc: 'Ruta Dual Carrera 7 y Calle 26',
      route_type: 3,
      route_color: '#0070F3',
      route_text_color: '#FFFFFF',
      headway_secs: 480,
      corridor: 'Carrera 7 / Calle 26',
      stops_count: 22,
      wheelchair_accessible: true,
    },
    {
      route_id: 'sitp-330',
      agency_id: 'TMSA',
      route_short_name: '330',
      route_long_name: 'La Estrellita ↔ El Uval',
      route_desc: 'Urbano Avenida Boyacá',
      route_type: 3,
      route_color: '#2563EB',
      route_text_color: '#FFFFFF',
      headway_secs: 600,
      corridor: 'Avenida Boyacá',
      stops_count: 34,
      wheelchair_accessible: true,
    },
    {
      route_id: 'ali-21',
      agency_id: 'TMSA',
      route_short_name: '2-1',
      route_long_name: 'Portal Norte ↔ Mirandela',
      route_desc: 'Alimentador Zona Norte',
      route_type: 3,
      route_color: '#16A34A',
      route_text_color: '#FFFFFF',
      headway_secs: 300,
      corridor: 'Autonorte / Mirandela',
      stops_count: 8,
      wheelchair_accessible: true,
    },
  ],
  medellin: [
    {
      route_id: 'med-linea-a',
      agency_id: 'METROMED',
      route_short_name: 'Línea A',
      route_long_name: 'Niquía ↔ La Estrella',
      route_desc: 'Línea férrea principal del Valle de Aburrá',
      route_type: 1,
      route_color: '#00875A',
      route_text_color: '#FFFFFF',
      headway_secs: 210,
      corridor: 'Eje Río Medellín',
      stops_count: 21,
      wheelchair_accessible: true,
    },
    {
      route_id: 'med-linea-b',
      agency_id: 'METROMED',
      route_short_name: 'Línea B',
      route_long_name: 'San Antonio ↔ San Javier',
      route_desc: 'Línea férrea de enlace a Comuna 13',
      route_type: 1,
      route_color: '#F59E0B',
      route_text_color: '#000000',
      headway_secs: 270,
      corridor: 'San Juan / San Javier',
      stops_count: 7,
      wheelchair_accessible: true,
    },
    {
      route_id: 'med-metroplus-l1',
      agency_id: 'METROMED',
      route_short_name: 'Línea 1',
      route_long_name: 'Universidad de Medellín ↔ Parque Aranjuez',
      route_desc: 'Troncal Metroplús Carril Exclusivo',
      route_type: 3,
      route_color: '#0070F3',
      route_text_color: '#FFFFFF',
      headway_secs: 300,
      corridor: 'Calle 30 / Belén',
      stops_count: 20,
      wheelchair_accessible: true,
    },
  ],
  cali: [
    {
      route_id: 'cali-t31',
      agency_id: 'METROCALI',
      route_short_name: 'T31',
      route_long_name: 'Paso del Comercio ↔ Universidades',
      route_desc: 'Troncal eje norte-sur de Cali',
      route_type: 3,
      route_color: '#1D4ED8',
      route_text_color: '#FFFFFF',
      headway_secs: 300,
      corridor: 'Calle 5a / Carrera 1a',
      stops_count: 24,
      wheelchair_accessible: true,
    },
    {
      route_id: 'cali-e21',
      agency_id: 'METROCALI',
      route_short_name: 'E21',
      route_long_name: 'Terminal Menga ↔ Universidades',
      route_desc: 'Expreso Troncal Avenida 3N',
      route_type: 3,
      route_color: '#EA580C',
      route_text_color: '#FFFFFF',
      headway_secs: 360,
      corridor: 'Avenida 3N / Calle 5a',
      stops_count: 18,
      wheelchair_accessible: true,
    },
  ],
  barranquilla: [
    {
      route_id: 'baq-r1',
      agency_id: 'TRANSMETRO',
      route_short_name: 'R1',
      route_long_name: 'Portal Soledad ↔ Retorno Romelio Martínez',
      route_desc: 'Troncal Murillo - Olaya Herrera',
      route_type: 3,
      route_color: '#EA580C',
      route_text_color: '#FFFFFF',
      headway_secs: 360,
      corridor: 'Calle 45 (Murillo)',
      stops_count: 16,
      wheelchair_accessible: true,
    },
  ],
  bucaramanga: [
    {
      route_id: 'bga-t3',
      agency_id: 'METROLINEA',
      route_short_name: 'T3',
      route_long_name: 'Portal Piedecuesta ↔ Quebradaseca',
      route_desc: 'Troncal Autopista Floridablanca',
      route_type: 3,
      route_color: '#10B981',
      route_text_color: '#FFFFFF',
      headway_secs: 420,
      corridor: 'Autopista Floridablanca',
      stops_count: 15,
      wheelchair_accessible: true,
    },
  ],
};

// 3. GTFS STOPS & PLATFORMS
export const GTFS_STOPS: Record<string, GtfsStop[]> = {
  bogota: [
    { stop_id: 'BOG-01', stop_code: 'CL100', stop_name: 'Estación Calle 100', stop_lat: 4.6853, stop_lon: -74.0572, zone_id: 'Z_NORTE', platform_code: 'Vagón 2 · Puerta 4', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-02', stop_code: 'HER', stop_name: 'Estación Héroes', stop_lat: 4.6672, stop_lon: -74.0601, zone_id: 'Z_CENTRAL', platform_code: 'Vagón 1 · Puerta 2', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-03', stop_code: 'CL72', stop_name: 'Estación Calle 72', stop_lat: 4.6612, stop_lon: -74.0613, zone_id: 'Z_CENTRAL', platform_code: 'Vagón 2 · Puerta 3', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-04', stop_code: 'CL45', stop_name: 'Estación Calle 45', stop_lat: 4.6294, stop_lon: -74.0682, zone_id: 'Z_CENTRAL', platform_code: 'Vagón 1 · Puerta 1', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-05', stop_code: 'PUSM', stop_name: 'Portal Usme', stop_lat: 4.5721, stop_lon: -74.1224, zone_id: 'Z_SUR', platform_code: 'Plataforma 1', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-06', stop_code: 'PNOR', stop_name: 'Portal Norte', stop_lat: 4.7571, stop_lon: -74.0453, zone_id: 'Z_NORTE', platform_code: 'Plataforma 2', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-07', stop_code: 'PELD', stop_name: 'Portal Eldorado', stop_lat: 4.6854, stop_lon: -74.1352, zone_id: 'Z_OESTE', platform_code: 'Plataforma 1', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-08', stop_code: 'PSUB', stop_name: 'Portal Suba', stop_lat: 4.7492, stop_lon: -74.0984, zone_id: 'Z_SUBA', platform_code: 'Plataforma 3', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-09', stop_code: 'PAME', stop_name: 'Portal Américas', stop_lat: 4.6295, stop_lon: -74.1672, zone_id: 'Z_SUR', platform_code: 'Plataforma 2', wheelchair_boarding: 1, city_id: 'bogota' },
    { stop_id: 'BOG-10', stop_code: 'AERO', stop_name: 'Aeropuerto El Dorado T1', stop_lat: 4.6982, stop_lon: -74.1415, zone_id: 'Z_OESTE', platform_code: 'Bahía Puerta 4', wheelchair_boarding: 1, city_id: 'bogota' },
  ],
  medellin: [
    { stop_id: 'MED-01', stop_code: 'SA', stop_name: 'Estación San Antonio', stop_lat: 6.2514, stop_lon: -75.5682, zone_id: 'Z_CENTRO', platform_code: 'Plataforma Central', wheelchair_boarding: 1, city_id: 'medellin' },
    { stop_id: 'MED-02', stop_code: 'POB', stop_name: 'Estación Poblado', stop_lat: 6.2081, stop_lon: -75.5864, zone_id: 'Z_SUR', platform_code: 'Vía 1 Sur', wheelchair_boarding: 1, city_id: 'medellin' },
    { stop_id: 'MED-03', stop_code: 'NIQ', stop_name: 'Estación Niquía', stop_lat: 6.3352, stop_lon: -75.5481, zone_id: 'Z_NORTE', platform_code: 'Plataforma Norte', wheelchair_boarding: 1, city_id: 'medellin' },
    { stop_id: 'MED-04', stop_code: 'EST', stop_name: 'Estación La Estrella', stop_lat: 6.1751, stop_lon: -75.6023, zone_id: 'Z_SUR', platform_code: 'Vía 2', wheelchair_boarding: 1, city_id: 'medellin' },
    { stop_id: 'MED-05', stop_code: 'ACE', stop_name: 'Estación Acevedo (Metrocable)', stop_lat: 6.2982, stop_lon: -75.5563, zone_id: 'Z_NORTE', platform_code: 'Plataforma Intercambio', wheelchair_boarding: 1, city_id: 'medellin' },
  ],
  cali: [
    { stop_id: 'CAL-01', stop_code: 'UNI', stop_name: 'Terminal Universidades', stop_lat: 3.3752, stop_lon: -76.5451, zone_id: 'Z_SUR', platform_code: 'Plataforma A', wheelchair_boarding: 1, city_id: 'cali' },
    { stop_id: 'CAL-02', stop_code: 'PASO', stop_name: 'Terminal Paso del Comercio', stop_lat: 3.4784, stop_lon: -76.5052, zone_id: 'Z_NORTE', platform_code: 'Plataforma B', wheelchair_boarding: 1, city_id: 'cali' },
    { stop_id: 'CAL-03', stop_code: 'SPED', stop_name: 'Estación San Pedro', stop_lat: 3.4521, stop_lon: -76.5284, zone_id: 'Z_CENTRO', platform_code: 'Vagón 1', wheelchair_boarding: 1, city_id: 'cali' },
  ],
  barranquilla: [
    { stop_id: 'BAQ-01', stop_code: 'PSOL', stop_name: 'Portal de Soledad', stop_lat: 10.9251, stop_lon: -74.7782, zone_id: 'Z_SUR', platform_code: 'Plataforma 1', wheelchair_boarding: 1, city_id: 'barranquilla' },
    { stop_id: 'BAQ-02', stop_code: 'RMAR', stop_name: 'Retorno Romelio Martínez', stop_lat: 10.9982, stop_lon: -74.8051, zone_id: 'Z_NORTE', platform_code: 'Vagón Central', wheelchair_boarding: 1, city_id: 'barranquilla' },
  ],
  bucaramanga: [
    { stop_id: 'BGA-01', stop_code: 'PPIED', stop_name: 'Portal Piedecuesta', stop_lat: 6.9921, stop_lon: -73.0514, zone_id: 'Z_SUR', platform_code: 'Plataforma 1', wheelchair_boarding: 1, city_id: 'bucaramanga' },
    { stop_id: 'BGA-02', stop_code: 'QUEB', stop_name: 'Estación Quebradaseca', stop_lat: 7.1284, stop_lon: -73.1251, zone_id: 'Z_CENTRO', platform_code: 'Vagón 2', wheelchair_boarding: 1, city_id: 'bucaramanga' },
  ],
};

// 4. GTFS REALTIME ALERTS SIMULATION
export const GTFS_ALERTS: GtfsAlert[] = [
  {
    id: 'alt-01',
    city_id: 'bogota',
    route_id: 'tm-h27',
    header_text: 'Operación normal en Troncal Caracas',
    description_text: 'Frecuencias sincronizadas con intervalo regular de 6 min.',
    severity: 'info',
    timestamp_ms: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'alt-02',
    city_id: 'bogota',
    header_text: 'Mantenimiento preventivo en carril Calle 26',
    description_text: 'Paso a carril mixto entre Carrera 33 y Centro Memoria.',
    severity: 'warning',
    timestamp_ms: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'alt-03',
    city_id: 'medellin',
    route_id: 'med-linea-a',
    header_text: 'Línea A al 100% de capacidad',
    description_text: 'Servicio continuo cada 3.5 minutos entre Niquía y La Estrella.',
    severity: 'info',
    timestamp_ms: Date.now() - 1000 * 60 * 10,
  },
];

/**
 * Query GTFS routes for a city with fast search
 */
export function queryGtfsRoutes(cityId: string, search = ''): GtfsRoute[] {
  const allRoutes = GTFS_ROUTES[cityId] || GTFS_ROUTES.bogota;
  if (!search.trim()) return allRoutes;

  const term = search.toLowerCase().trim();
  return allRoutes.filter(
    (r) =>
      r.route_short_name.toLowerCase().includes(term) ||
      r.route_long_name.toLowerCase().includes(term) ||
      r.corridor.toLowerCase().includes(term)
  );
}

/**
 * Query GTFS stops for a city
 */
export function queryGtfsStops(cityId: string): GtfsStop[] {
  return GTFS_STOPS[cityId] || GTFS_STOPS.bogota;
}

/**
 * Query next simulated real-time arrivals based on GTFS headway
 */
export function queryGtfsNextArrivals(
  cityId: string,
  stopId?: string,
  routeId?: string
): GtfsArrivalEstimate[] {
  const routes = GTFS_ROUTES[cityId] || GTFS_ROUTES.bogota;
  const targetRoutes = routeId ? routes.filter((r) => r.route_id === routeId) : routes.slice(0, 4);

  return targetRoutes.map((r, i) => {
    const headwayMins = Math.round(r.headway_secs / 60);
    const arrivalMins = Math.max(2, (headwayMins * (0.4 + i * 0.3)) | 0);

    return {
      route_id: r.route_id,
      route_code: r.route_short_name,
      destination: r.route_long_name.split('↔')[1]?.trim() || r.route_long_name,
      arrival_minutes: arrivalMins,
      headway_minutes: headwayMins,
      platform_code: `Vagón ${(i % 3) + 1} · Puerta ${(i % 4) + 1}`,
      is_realtime_gps: true,
      gps_confidence_pct: 96 + (i % 4),
    };
  });
}

/**
 * Haversine formula to find nearest stops to user's real GPS coordinates
 */
export function findNearestGtfsStops(
  userLat: number,
  userLon: number,
  cityId: string,
  maxDistanceKm = 5
): Array<{ stop: GtfsStop; distanceKm: number }> {
  const stops = queryGtfsStops(cityId);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return stops
    .map((stop) => ({
      stop,
      distanceKm: Math.round(calculateDistance(userLat, userLon, stop.stop_lat, stop.stop_lon) * 10) / 10,
    }))
    .filter((item) => item.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
