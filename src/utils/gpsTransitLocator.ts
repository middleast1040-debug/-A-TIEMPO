/**
 * A Tiempo - GPS Transit Locator & Mobility Coordinates Engine
 * Handles geolocation, Haversine proximity calculations, and nearest stop detection
 * for mass transit systems across Colombia (TransMilenio, Metro Medellín, MÍO Cali, etc.)
 */

export interface StationCoordinate {
  name: string;
  system: string;
  cityId: string;
  lat: number;
  lng: number;
}

// Key mass transit stations and terminals with actual geographical coordinates
export const COLOMBIAN_TRANSIT_STATIONS: StationCoordinate[] = [
  // BOGOTÁ (TransMilenio & SITP)
  { name: 'Portal Norte', system: 'TransMilenio', cityId: 'bogota', lat: 4.7554, lng: -74.0458 },
  { name: 'Estación Calle 100', system: 'TransMilenio', cityId: 'bogota', lat: 4.6853, lng: -74.0577 },
  { name: 'Estación Flores', system: 'TransMilenio', cityId: 'bogota', lat: 4.6534, lng: -74.0631 },
  { name: 'Estación Marly', system: 'TransMilenio', cityId: 'bogota', lat: 4.6391, lng: -74.0662 },
  { name: 'Estación Polo', system: 'TransMilenio', cityId: 'bogota', lat: 4.6738, lng: -74.0632 },
  { name: 'Estación Rionegro', system: 'TransMilenio', cityId: 'bogota', lat: 4.6841, lng: -74.0722 },
  { name: 'Estación Gobernación', system: 'TransMilenio', cityId: 'bogota', lat: 4.6477, lng: -74.0954 },
  { name: 'Portal ElDorado', system: 'TransMilenio', cityId: 'bogota', lat: 4.6852, lng: -74.1278 },
  { name: 'Aeropuerto El Dorado', system: 'TransMilenio / Dual', cityId: 'bogota', lat: 4.6976, lng: -74.1415 },
  { name: 'Portal Usme', system: 'TransMilenio', cityId: 'bogota', lat: 4.5342, lng: -74.1165 },
  { name: 'Portal 20 de Julio', system: 'TransMilenio', cityId: 'bogota', lat: 4.5684, lng: -74.0921 },
  { name: 'Portal Américas', system: 'TransMilenio', cityId: 'bogota', lat: 4.6294, lng: -74.1788 },
  { name: 'Portal Suba', system: 'TransMilenio', cityId: 'bogota', lat: 4.7475, lng: -74.0975 },
  { name: 'Portal 80', system: 'TransMilenio', cityId: 'bogota', lat: 4.7099, lng: -74.1118 },
  { name: 'Portal Tunal', system: 'TransMilenio', cityId: 'bogota', lat: 4.5707, lng: -74.1374 },
  { name: 'Portal Sur', system: 'TransMilenio', cityId: 'bogota', lat: 4.5936, lng: -74.1706 },
  { name: 'Ricaurte', system: 'TransMilenio', cityId: 'bogota', lat: 4.6105, lng: -74.0908 },
  { name: 'San Mateo (Soacha)', system: 'TransMilenio', cityId: 'bogota', lat: 4.5804, lng: -74.2256 },
  { name: 'Fundación Santa Fe (Cl 116)', system: 'SITP / Dual', cityId: 'bogota', lat: 4.6948, lng: -74.0325 },
  { name: 'Toberín', system: 'TransMilenio', cityId: 'bogota', lat: 4.7502, lng: -74.0478 },
  { name: 'Usaquén (Cra 15 con Calle 100)', system: 'SITP', cityId: 'bogota', lat: 4.6845, lng: -74.0502 },

  // MEDELLÍN (Metro & Metroplús)
  { name: 'Estación Niquía', system: 'Metro de Medellín', cityId: 'medellin', lat: 6.3376, lng: -75.5451 },
  { name: 'Estación San Antonio', system: 'Metro de Medellín', cityId: 'medellin', lat: 6.2472, lng: -75.5694 },
  { name: 'Estación Poblado', system: 'Metro de Medellín', cityId: 'medellin', lat: 6.2117, lng: -75.5786 },
  { name: 'Estación La Estrella', system: 'Metro de Medellín', cityId: 'medellin', lat: 6.1554, lng: -75.6268 },
  { name: 'Estación San Javier', system: 'Metro & Metrocable', cityId: 'medellin', lat: 6.2524, lng: -75.6175 },
  { name: 'Estación Acevedo', system: 'Metro & Metrocable', cityId: 'medellin', lat: 6.3012, lng: -75.5562 },
  { name: 'Estación Industriales', system: 'Metro & Metroplús', cityId: 'medellin', lat: 6.2289, lng: -75.5744 },

  // CALI (MÍO)
  { name: 'Terminal Menga', system: 'MÍO Cali', cityId: 'cali', lat: 3.4862, lng: -76.5173 },
  { name: 'Estación Unidad Deportiva', system: 'MÍO Cali', cityId: 'cali', lat: 3.4215, lng: -76.5492 },
  { name: 'Terminal Andrés Sanín', system: 'MÍO Cali', cityId: 'cali', lat: 3.4357, lng: -76.4868 },
  { name: 'Estación Universidades', system: 'MÍO Cali', cityId: 'cali', lat: 3.3644, lng: -76.5312 },
  { name: 'Terminal Paso del Comercio', system: 'MÍO Cali', cityId: 'cali', lat: 3.4912, lng: -76.4954 },

  // BARRANQUILLA (Transmetro)
  { name: 'Portal de Soledad', system: 'Transmetro', cityId: 'barranquilla', lat: 10.9252, lng: -74.7812 },
  { name: 'Estación Joe Arroyo', system: 'Transmetro', cityId: 'barranquilla', lat: 10.9996, lng: -74.8087 },
  { name: 'Estación Parque Cultural', system: 'Transmetro', cityId: 'barranquilla', lat: 10.9856, lng: -74.7774 },

  // CARTAGENA (Transcaribe)
  { name: 'Terminal de Integración de Indias', system: 'Transcaribe', cityId: 'cartagena', lat: 10.3789, lng: -75.4674 },
  { name: 'Estación Madre Bernarda', system: 'Transcaribe', cityId: 'cartagena', lat: 10.3921, lng: -75.4795 },
  { name: 'Estación Centro / Bodeguita', system: 'Transcaribe', cityId: 'cartagena', lat: 10.4223, lng: -75.5512 },

  // PEREIRA (Megabús)
  { name: 'Estación El Viajero', system: 'Megabús', cityId: 'pereira', lat: 4.8012, lng: -75.7365 },
  { name: 'Estación Cuba', system: 'Megabús', cityId: 'pereira', lat: 4.8034, lng: -75.7421 },
  { name: 'Estación Central (Parque Olaya)', system: 'Megabús', cityId: 'pereira', lat: 4.8142, lng: -75.6985 },

  // BUCARAMANGA (Metrolínea)
  { name: 'Estación Provenza', system: 'Metrolínea', cityId: 'bucaramanga', lat: 7.0862, lng: -73.1118 },
  { name: 'Estación Quebradaseca', system: 'Metrolínea', cityId: 'bucaramanga', lat: 7.1264, lng: -73.1251 },
];

/**
 * Calculates Haversine distance in meters between two geographical coordinates
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Estimates walking time in minutes based on distance in meters.
 * Assumes urban walking speed of ~1.2 m/s (~72 m/min) plus 1 min safe margin.
 */
export function estimateWalkingMinutes(meters: number): number {
  if (meters <= 80) return 0; // Already inside station
  const baseMinutes = Math.ceil(meters / 75);
  return Math.min(15, Math.max(1, baseMinutes));
}

export interface NearestStationResult {
  station: StationCoordinate;
  distanceMeters: number;
  walkingMinutes: number;
}

/**
 * Finds the nearest mass transit station from user coordinates
 */
export function findNearestStation(
  userLat: number,
  userLng: number,
  cityId?: string
): NearestStationResult | null {
  const candidates = cityId
    ? COLOMBIAN_TRANSIT_STATIONS.filter((s) => s.cityId === cityId)
    : COLOMBIAN_TRANSIT_STATIONS;

  if (candidates.length === 0) return null;

  let bestStation = candidates[0];
  let minDistance = Infinity;

  for (const st of candidates) {
    const dist = calculateHaversineDistanceMeters(userLat, userLng, st.lat, st.lng);
    if (dist < minDistance) {
      minDistance = dist;
      bestStation = st;
    }
  }

  return {
    station: bestStation,
    distanceMeters: minDistance,
    walkingMinutes: estimateWalkingMinutes(minDistance),
  };
}

/**
 * Checks if current GPS coordinates are within proximity (e.g. 900m) of destination
 */
export function isNearDestination(
  userLat: number,
  userLng: number,
  destinationStopName: string,
  thresholdMeters: number = 900
): { isNear: boolean; distanceMeters: number } {
  const target = COLOMBIAN_TRANSIT_STATIONS.find(
    (s) => s.name.toLowerCase().includes(destinationStopName.toLowerCase()) ||
           destinationStopName.toLowerCase().includes(s.name.toLowerCase())
  );

  if (!target) {
    return { isNear: false, distanceMeters: -1 };
  }

  const distanceMeters = calculateHaversineDistanceMeters(userLat, userLng, target.lat, target.lng);
  return {
    isNear: distanceMeters <= thresholdMeters,
    distanceMeters,
  };
}
