import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  X,
  Navigation,
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Route } from '../types/transit';

interface InteractiveTransitMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityId?: string;
  cityName?: string;
  originStop: string;
  destinationStop: string;
  intermediateStops?: string[];
  activeRoute?: Route;
}

// Major corridor coordinates for Colombian transit systems
const CORRIDOR_COORDINATES: Record<string, [number, number][]> = {
  // Bogotá Troncales
  caracas: [
    [4.572, -74.122], // Portal Usme
    [4.588, -74.095], // Molinos
    [4.615, -74.075], // Tercer Milenio
    [4.629, -74.068], // Calle 45
    [4.661, -74.061], // Calle 72
    [4.667, -74.060], // Héroes
  ],
  autonorte: [
    [4.667, -74.060], // Héroes
    [4.685, -74.057], // Calle 100
    [4.712, -74.053], // Calle 127
    [4.733, -74.049], // Toberín
    [4.757, -74.045], // Portal Norte
  ],
  calle26: [
    [4.606, -74.071], // Centro Memoria
    [4.628, -74.088], // CAN
    [4.646, -74.103], // Salitre el Greco
    [4.666, -74.116], // Modelia
    [4.685, -74.135], // Portal Eldorado
  ],
  nqs: [
    [4.595, -74.139], // Portal Sur
    [4.615, -74.105], // General Santander
    [4.636, -74.084], // Ricaurte
    [4.662, -74.075], // Campín
    [4.688, -74.062], // Castellana
  ],
  metroMedellin: [
    [6.175, -75.602], // La Estrella
    [6.208, -75.586], // Poblado
    [6.251, -75.568], // San Antonio
    [6.298, -75.556], // Acevedo
    [6.335, -75.548], // Niquía
  ],
  mioCali: [
    [3.375, -76.545], // Universidades
    [3.412, -76.538], // Capri
    [3.435, -76.532], // Tequendama
    [3.452, -76.528], // San Pedro
    [3.478, -76.505], // Paso del Comercio
  ],
};

// Station approximate anchors for marker positioning
const STATION_COORDINATES: Record<string, [number, number]> = {
  // Bogotá
  'Portal Norte': [4.757, -74.045],
  'Toberín': [4.733, -74.049],
  'Calle 127': [4.712, -74.053],
  'Estación Calle 100': [4.685, -74.057],
  'Calle 100': [4.685, -74.057],
  'Héroes': [4.667, -74.060],
  'Calle 72': [4.661, -74.061],
  'Calle 45': [4.629, -74.068],
  'Profamilia': [4.624, -74.069],
  'Avenida Jiménez': [4.601, -74.076],
  'Tercer Milenio': [4.594, -74.079],
  'Hospital': [4.589, -74.085],
  'Portal Usme': [4.572, -74.122],
  'Portal 20 de Julio': [4.571, -74.095],
  'Portal Eldorado': [4.685, -74.135],
  'CAN': [4.628, -74.088],
  'Portal Suba': [4.749, -74.098],
  'Portal Américas': [4.629, -74.167],
  'Banderas': [4.631, -74.148],
  'Portal Sur': [4.595, -74.139],
  'General Santander': [4.615, -74.105],
  'Ricaurte': [4.636, -74.084],
  'Museo Nacional': [4.616, -74.068],
  // Medellín
  'Niquía': [6.335, -75.548],
  'Acevedo': [6.298, -75.556],
  'San Antonio': [6.251, -75.568],
  'Poblado': [6.208, -75.586],
  'La Estrella': [6.175, -75.602],
  // Cali
  'Universidades': [3.375, -76.545],
  'Capri': [3.412, -76.538],
  'San Pedro': [3.452, -76.528],
  'Paso del Comercio': [3.478, -76.505],
};

export const InteractiveTransitMapModal: React.FC<InteractiveTransitMapModalProps> = ({
  isOpen,
  onClose,
  cityId = 'bogota',
  cityName = 'Bogotá',
  originStop,
  destinationStop,
  intermediateStops = [],
  activeRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Derive center based on active city
  const cityDefaultCoords: Record<string, [number, number]> = {
    bogota: [4.660, -74.075],
    medellin: [6.251, -75.568],
    cali: [3.435, -76.532],
    barranquilla: [10.987, -74.788],
    cartagena: [10.406, -75.514],
    pereira: [4.813, -75.694],
  };

  const centerCoords = cityDefaultCoords[cityId] || [4.660, -74.075];

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map with CartoDB Dark Matter or Positron theme
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: cityId === 'bogota' ? 12 : 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    const isDarkTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const tileUrl = isDarkTheme
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    // CartoDB Vector Tiles (Dark Matter or Positron)
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Glowing Corridor Polylines
    if (cityId === 'bogota') {
      // Caracas Troncal Glow
      L.polyline(CORRIDOR_COORDINATES.caracas, {
        color: '#ef4444',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
      }).addTo(map);

      // Autonorte Troncal Glow
      L.polyline(CORRIDOR_COORDINATES.autonorte, {
        color: '#10b981',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
      }).addTo(map);

      // Calle 26 Glow
      L.polyline(CORRIDOR_COORDINATES.calle26, {
        color: '#06b6d4',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
      }).addTo(map);

      // NQS Glow
      L.polyline(CORRIDOR_COORDINATES.nqs, {
        color: '#8b5cf6',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
      }).addTo(map);
    } else if (cityId === 'medellin') {
      L.polyline(CORRIDOR_COORDINATES.metroMedellin, {
        color: '#00F5B4',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
      }).addTo(map);
    } else if (cityId === 'cali') {
      L.polyline(CORRIDOR_COORDINATES.mioCali, {
        color: '#3b82f6',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
      }).addTo(map);
    }

    // Helper to find coords for station
    const getCoords = (name: string): [number, number] => {
      if (STATION_COORDINATES[name]) return STATION_COORDINATES[name];
      for (const [key, coords] of Object.entries(STATION_COORDINATES)) {
        if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
          return coords;
        }
      }
      // slight jitter around center
      return [
        centerCoords[0] + (Math.random() - 0.5) * 0.04,
        centerCoords[1] + (Math.random() - 0.5) * 0.04,
      ];
    };

    const originLatLng = getCoords(originStop);
    const destLatLng = getCoords(destinationStop);

    // Marker Icons using Leaflet DivIcon
    const createPulsingMarker = (title: string, role: 'origin' | 'dest' | 'inter', color: string) => {
      return L.divIcon({
        className: 'custom-transit-node',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; border-radius: 9999px; background: ${color}; border: 3px solid #0f172a; box-shadow: 0 0 12px ${color}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 10px;">
              ${role === 'origin' ? '●' : role === 'dest' ? '★' : '◆'}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // 1. Origin Marker
    const originMarker = L.marker(originLatLng, {
      icon: createPulsingMarker(originStop, 'origin', '#10b981'),
      title: `Origen: ${originStop}`,
    }).addTo(map);
    originMarker.bindPopup(`<b>Origen:</b> ${originStop}`);

    // 2. Intermediate Markers
    intermediateStops.forEach((inter, idx) => {
      const interLatLng = getCoords(inter);
      const interMarker = L.marker(interLatLng, {
        icon: createPulsingMarker(inter, 'inter', '#f59e0b'),
        title: `Parada #${idx + 1}: ${inter}`,
      }).addTo(map);
      interMarker.bindPopup(`<b>Parada #${idx + 1}:</b> ${inter}`);
    });

    // 3. Destination Marker
    const destMarker = L.marker(destLatLng, {
      icon: createPulsingMarker(destinationStop, 'dest', '#f43f5e'),
      title: `Destino: ${destinationStop}`,
    }).addTo(map);
    destMarker.bindPopup(`<b>Destino:</b> ${destinationStop}`);

    // Draw trip trajectory linking points
    const trajectoryPoints = [
      originLatLng,
      ...intermediateStops.map((st) => getCoords(st)),
      destLatLng,
    ];

    L.polyline(trajectoryPoints, {
      color: '#0070F3',
      weight: 3,
      dashArray: '6, 8',
      opacity: 0.9,
    }).addTo(map);

    // Fit map bounds to show full trip
    try {
      const bounds = L.latLngBounds(trajectoryPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } catch {
      // fallback
    }

    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isOpen, cityId, originStop, destinationStop, intermediateStops]);

  if (!isOpen) return null;

  const handleLocateMe = () => {
    if (!mapInstanceRef.current || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const latLng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(latLng, 15, { animate: true });

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

          L.marker(latLng, { icon: customUserIcon, zIndexOffset: 1000 })
            .addTo(mapInstanceRef.current)
            .bindPopup('<b>Tu ubicación actual</b><br/><span style="font-size: 11px; color: #64748b;">GPS en vivo</span>')
            .openPopup();

          L.circle(latLng, {
            radius: Math.min(pos.coords.accuracy || 25, 100),
            color: '#0070F3',
            fillColor: '#0070F3',
            fillOpacity: 0.1,
            weight: 1,
          }).addTo(mapInstanceRef.current);
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-left transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white dark:bg-[#070D18] border-b border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#0070F3]/15 border border-blue-200 dark:border-[#0070F3]/30 text-[#0060EA] dark:text-[#38BDF8]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                  Mapa de Rutas · {cityName}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Troncales activas, paradas y estaciones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#15233A] transition cursor-pointer"
            aria-label="Cerrar mapa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container Viewport */}
        <div className="relative flex-1 w-full bg-slate-950">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

          {/* Floating Map Action Controls (HUD) */}
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="p-2.5 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 hover:bg-slate-50 dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] text-[#0060EA] dark:text-[#38BDF8] shadow-md backdrop-blur-md cursor-pointer transition"
              title="Mi ubicación por GPS"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2.5 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 hover:bg-slate-50 dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md cursor-pointer transition"
              title="Acercar mapa"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2.5 rounded-xl bg-white/95 dark:bg-[#0E1726]/95 hover:bg-slate-50 dark:hover:bg-[#15233A] border border-slate-200 dark:border-[#1C2A3E] text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md cursor-pointer transition"
              title="Alejar mapa"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Legend / Info Strip Floating at Bottom */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
            <div className="max-w-2xl mx-auto bg-white/95 dark:bg-[#070D18]/95 border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-3 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-4 flex-wrap min-w-0">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0070F3] shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[200px]">{originStop}</span>
                </span>

                {intermediateStops.length > 0 && (
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{intermediateStops.length} parada(s)</span>
                  </span>
                )}

                <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[200px]">{destinationStop}</span>
                </span>
              </div>

              {activeRoute && (
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-white font-mono font-bold text-[10px]"
                    style={{ backgroundColor: activeRoute.accentColor }}
                  >
                    {activeRoute.code}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ~{activeRoute.transitMinutes || 20} min
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
