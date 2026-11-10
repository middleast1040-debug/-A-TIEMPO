import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Crosshair,
  ZoomIn,
  ZoomOut,
  Navigation,
  MapPin,
  Radio,
  Layers,
  Sparkles,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import { queryGtfsStops, queryGtfsRoutes, GtfsStop } from '../services/gtfsColombiaService';

interface TransitLeafletMapContainerProps {
  cityId?: string;
  cityName?: string;
  originStop?: string;
  destinationStop?: string;
  height?: string;
  showControls?: boolean;
  onOpenFullScreen?: () => void;
  selectedRouteId?: string;
}

// Major corridor coordinates for Colombian transit systems
const CITY_CORRIDORS: Record<string, { name: string; color: string; path: [number, number][] }[]> = {
  bogota: [
    {
      name: 'Troncal Caracas',
      color: '#ef4444',
      path: [
        [4.5721, -74.1224], // Portal Usme
        [4.5882, -74.0953], // Molinos
        [4.6151, -74.0752], // Tercer Milenio
        [4.6294, -74.0682], // Calle 45
        [4.6612, -74.0613], // Calle 72
        [4.6672, -74.0601], // Héroes
      ],
    },
    {
      name: 'Troncal Autonorte',
      color: '#10b981',
      path: [
        [4.6672, -74.0601], // Héroes
        [4.6853, -74.0572], // Calle 100
        [4.7121, -74.0532], // Calle 127
        [4.7332, -74.0491], // Toberín
        [4.7571, -74.0453], // Portal Norte
      ],
    },
    {
      name: 'Troncal Calle 26',
      color: '#06b6d4',
      path: [
        [4.6062, -74.0712], // Centro Memoria
        [4.6284, -74.0883], // CAN
        [4.6462, -74.1031], // Salitre el Greco
        [4.6663, -74.1162], // Modelia
        [4.6854, -74.1352], // Portal Eldorado
      ],
    },
    {
      name: 'Troncal NQS',
      color: '#8b5cf6',
      path: [
        [4.5952, -74.1391], // Portal Sur
        [4.6153, -74.1052], // General Santander
        [4.6362, -74.0841], // Ricaurte
        [4.6621, -74.0753], // Campín
        [4.6881, -74.0622], // Castellana
      ],
    },
  ],
  medellin: [
    {
      name: 'Línea A Metro',
      color: '#00875A',
      path: [
        [6.3352, -75.5481], // Niquía
        [6.2982, -75.5563], // Acevedo
        [6.2514, -75.5682], // San Antonio
        [6.2081, -75.5864], // Poblado
        [6.1751, -75.6023], // La Estrella
      ],
    },
    {
      name: 'Línea 1 Metroplús',
      color: '#0070F3',
      path: [
        [6.2312, -75.6012], // U de Medellín
        [6.2412, -75.5812], // Rosales
        [6.2514, -75.5682], // San Antonio
        [6.2782, -75.5582], // Aranjuez
      ],
    },
  ],
  cali: [
    {
      name: 'Troncal MÍO T31',
      color: '#1D4ED8',
      path: [
        [3.4784, -76.5052], // Paso del Comercio
        [3.4521, -76.5284], // San Pedro
        [3.4352, -76.5321], // Tequendama
        [3.4121, -76.5383], // Capri
        [3.3752, -76.5451], // Universidades
      ],
    },
  ],
  barranquilla: [
    {
      name: 'Troncal Transmetro R1',
      color: '#EA580C',
      path: [
        [10.9251, -74.7782], // Portal Soledad
        [10.9582, -74.7912], // La 21
        [10.9982, -74.8051], // Romelio Martínez
      ],
    },
  ],
  bucaramanga: [
    {
      name: 'Troncal Metrolínea T3',
      color: '#10B981',
      path: [
        [6.9921, -73.0514], // Portal Piedecuesta
        [7.0682, -73.0952], // Cañaveral
        [7.1284, -73.1251], // Quebradaseca
      ],
    },
  ],
};

const CITY_DEFAULT_COORDS: Record<string, [number, number]> = {
  bogota: [4.660, -74.075],
  medellin: [6.251, -75.568],
  cali: [3.435, -76.532],
  barranquilla: [10.987, -74.788],
  bucaramanga: [7.119, -73.122],
  cartagena: [10.406, -75.514],
  pereira: [4.813, -75.694],
};

export const TransitLeafletMapContainer: React.FC<TransitLeafletMapContainerProps> = ({
  cityId = 'bogota',
  cityName = 'Bogotá',
  originStop,
  destinationStop,
  height = '360px',
  showControls = true,
  onOpenFullScreen,
  selectedRouteId,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Check if dark theme is currently active
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // GTFS stops for this city
  const cityStops = useMemo(() => queryGtfsStops(cityId), [cityId]);
  const corridors = CITY_CORRIDORS[cityId] || CITY_CORRIDORS.bogota;
  const initialCenter = CITY_DEFAULT_COORDS[cityId] || CITY_DEFAULT_COORDS.bogota;

  // Initialize or re-render map
  useEffect(() => {
    if (!mapElementRef.current) return;

    // Clean previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapElementRef.current, {
      center: initialCenter,
      zoom: cityId === 'bogota' ? 12 : 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Tiles: CartoDB Dark Matter (Dark) or CartoDB Positron (Light)
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Draw Transit Corridors
    corridors.forEach((corr) => {
      L.polyline(corr.path, {
        color: corr.color,
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      })
        .addTo(map)
        .bindPopup(`<b>Corredor:</b> ${corr.name}`);
    });

    // Render GTFS Stations as subtle high-tech pins
    cityStops.forEach((stop) => {
      const isOrigin = originStop && stop.stop_name.toLowerCase().includes(originStop.toLowerCase());
      const isDestination = destinationStop && stop.stop_name.toLowerCase().includes(destinationStop.toLowerCase());

      const pinColor = isOrigin ? '#10b981' : isDestination ? '#f43f5e' : '#0070F3';
      const pinSize = isOrigin || isDestination ? 14 : 9;

      const stationIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div style="
            width: ${pinSize}px;
            height: ${pinSize}px;
            background-color: ${pinColor};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 8px ${pinColor};
          "></div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2],
      });

      L.marker([stop.stop_lat, stop.stop_lon], { icon: stationIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; line-height: 1.4;">
            <strong style="color: #0070F3; font-size: 13px;">${stop.stop_name}</strong><br/>
            <span style="color: #64748b; font-size: 11px;">Código: ${stop.stop_code}</span><br/>
            <span style="color: #059669; font-weight: bold; font-size: 11px;">${stop.platform_code}</span><br/>
            ${stop.wheelchair_boarding ? '<span style="color: #2563eb; font-size: 10px;">♿ Acceso accesible</span>' : ''}
          </div>
        `);
    });

    // If user coordinates already known, place marker
    if (userCoords) {
      placeUserMarker(map, userCoords[0], userCoords[1]);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [cityId, isDark, corridors, cityStops, originStop, destinationStop]);

  // Place custom pulsing user marker
  const placeUserMarker = (map: L.Map, lat: number, lon: number, accuracy = 20) => {
    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (accuracyCircleRef.current) accuracyCircleRef.current.remove();

    // Radar Wave Pulsing Icon
    const customUserIcon = L.divIcon({
      className: 'custom-user-gps-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(0, 112, 243, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #0070F3; border: 2.5px solid #ffffff; box-shadow: 0 0 10px #0070F3;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([lat, lon], { icon: customUserIcon, zIndexOffset: 1000 }).addTo(map);
    marker.bindPopup(`<b>Tu ubicación actual</b><br/><span style="font-size: 11px; color: #64748b;">GPS en vivo</span>`);
    userMarkerRef.current = marker;

    // Accuracy circle
    const circle = L.circle([lat, lon], {
      radius: Math.min(accuracy, 120),
      color: '#0070F3',
      fillColor: '#0070F3',
      fillOpacity: 0.1,
      weight: 1,
    }).addTo(map);
    accuracyCircleRef.current = circle;
  };

  // Browser Geolocation API Handler
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocalización no soportada en este navegador.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserCoords(coords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 15, { animate: true });
          placeUserMarker(mapInstanceRef.current, latitude, longitude, accuracy);
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError('Activa los permisos de ubicación en tu navegador para ver tu posición.');
        setTimeout(() => setGeoError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenterCorridor = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(initialCenter, cityId === 'bogota' ? 12 : 13, { animate: true });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1C2A3E] bg-[#070D18] shadow-md transition-all">
      {/* Map Target Canvas */}
      <div
        ref={mapElementRef}
        style={{ height }}
        className="w-full z-10 outline-none"
        aria-label={`Mapa interactivo de transporte de ${cityName}`}
      />

      {/* Map Floating HUD Overlay */}
      {showControls && (
        <>
          {/* Top Left: Tiles & System Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
            <div className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-[#0E1726]/90 backdrop-blur-md border border-slate-200 dark:border-[#1C2A3E] text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0070F3] animate-pulse" />
              <span>CartoDB {isDark ? 'Dark Matter' : 'Positron'}</span>
              <span className="text-[10px] text-slate-400 font-mono">· OSM</span>
            </div>
          </div>

          {/* Top Right: Actions (Locate, Fullscreen, Recenter) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className={`p-2 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-200 hover:text-[#0070F3] dark:hover:text-[#38BDF8] shadow-md transition cursor-pointer active:scale-95 ${
                isLocating ? 'animate-pulse text-[#0070F3]' : ''
              }`}
              title="Mi ubicación actual (GPS)"
              aria-label="Localizar mi ubicación actual"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>

            {onOpenFullScreen && (
              <button
                type="button"
                onClick={onOpenFullScreen}
                className="p-2 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-200 hover:text-[#0070F3] dark:hover:text-[#38BDF8] shadow-md transition cursor-pointer active:scale-95"
                title="Abrir en pantalla completa"
                aria-label="Pantalla completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom Right: Zoom Controls */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-200 hover:text-[#0070F3] shadow-md transition cursor-pointer active:scale-95"
              aria-label="Acercar mapa"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-200 hover:text-[#0070F3] shadow-md transition cursor-pointer active:scale-95"
              aria-label="Alejar mapa"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Left: Corridors Legend */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 flex-wrap pointer-events-none">
            {corridors.slice(0, 3).map((c) => (
              <span
                key={c.name}
                className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white flex items-center gap-1 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {/* Geolocation Toast Notification if permission denied */}
      {geoError && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{geoError}</span>
        </div>
      )}
    </div>
  );
};
