export interface TransitNewsItem {
  id: string;
  category: 'trancon' | 'marcha' | 'obra' | 'desvio' | 'interes';
  categoryLabel: string;
  title: string;
  description: string;
  affectedCorridor: string;
  timeAgo: string;
  severity: 'alta' | 'media' | 'informativa';
  isCriticalAlert?: boolean; // Only true for alerts that warrant a push notification
}

export interface BogotaWeather {
  temperatureC: number;
  condition: string;
  rainProbability: number;
  advisory: string;
  windSpeedKmH: number;
  uvIndex: number;
}

export const CURRENT_BOGOTA_WEATHER: BogotaWeather = {
  temperatureC: 16,
  condition: 'Parcialmente nublado con lloviznas en cerros',
  rainProbability: 65,
  advisory: 'Probabilidad de lluvias aisladas esta tarde. Lleva sombrilla o chaqueta impermeable.',
  windSpeedKmH: 14,
  uvIndex: 5,
};

export const INITIAL_BOGOTA_NEWS: TransitNewsItem[] = [
  {
    id: 'news-1',
    category: 'trancon',
    categoryLabel: 'Trancón / Congestión',
    title: 'Fuerte congestión en Autopista Norte con Calle 127',
    description: 'Alto flujo vehicular y reducción a dos carriles por vehículo varado sentido norte-sur. Agentes civiles en el punto regulando el paso.',
    affectedCorridor: 'Autonorte (Calle 116 a 134)',
    timeAgo: 'Hace 8 min',
    severity: 'alta',
    isCriticalAlert: true,
  },
  {
    id: 'news-6',
    category: 'marcha',
    categoryLabel: 'Bloqueo Troncal',
    title: 'Bloqueo temporal en carril exclusivo Portal Américas',
    description: 'Manifestación en la intersección de Av. Ciudad de Cali con Av. Villavicencio. Retrasos de 20 min en rutas troncales y alimentadoras hacia el sur.',
    affectedCorridor: 'Troncal Américas / Av. Cali',
    timeAgo: 'Hace 15 min',
    severity: 'alta',
    isCriticalAlert: true,
  },
  {
    id: 'news-2',
    category: 'obra',
    categoryLabel: 'Obras Metro Línea 1',
    title: 'Cierre de calzada mixta en Av. Caracas entre Calles 45 y 72',
    description: 'Avanza el hincado de pilotes del viaducto Metro. Carril exclusivo de TransMilenio opera continuo sin interrupción; desvío para vehículos particulares por Cra 13 y Cra 7.',
    affectedCorridor: 'Troncal Caracas Centro / Chapinero',
    timeAgo: 'Hace 25 min',
    severity: 'media',
    isCriticalAlert: false,
  },
  {
    id: 'news-3',
    category: 'marcha',
    categoryLabel: 'Movilización / Marcha',
    title: 'Concentración en Carrera 7 con Calle 40 (Univ. Distrital)',
    description: 'Aforo de manifestantes en carril norte-sur. Rutas zonales del SITP desvían temporalmente por Carrera 13 hacia el sur.',
    affectedCorridor: 'Carrera 7 / Carrera 13',
    timeAgo: 'Hace 40 min',
    severity: 'media',
    isCriticalAlert: false,
  },
  {
    id: 'news-4',
    category: 'desvio',
    categoryLabel: 'Desviación Operativa',
    title: 'Rutas B18 y H27 omiten temporalmente vagón 1 en Calle 76',
    description: 'Por sustitución de vidrios y mantenimiento de puertas automáticas anti-colados. Ascenso y descenso habilitado en vagón 2.',
    affectedCorridor: 'Estación Calle 76 (Caracas)',
    timeAgo: 'Hace 1 hora',
    severity: 'informativa',
    isCriticalAlert: false,
  },
  {
    id: 'news-5',
    category: 'interes',
    categoryLabel: 'Noticia de Interés',
    title: 'Recarga web de Tarjeta TuLlave sin filas ni costos',
    description: 'Recuerda que puedes recargar saldo por PSE y activarlo apoyando la tarjeta en validadores de buses SITP y torniquetes con lector NFC.',
    affectedCorridor: 'Todo el Sistema Integrado',
    timeAgo: 'Hoy',
    severity: 'informativa',
    isCriticalAlert: false,
  },
];
