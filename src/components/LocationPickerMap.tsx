'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Loader2 } from 'lucide-react';
import { GeoLocation } from '@/types/geo';

// Bug de iconos de Leaflet
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

interface LocationPickerMapProps {
  initialCenter?: GeoLocation;
  onLocationSelect: (location: GeoLocation) => void;
  darkMode?: boolean;
}

// Componente para manejar clics en el mapa
function ClickHandler({ setMarker }: { setMarker: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setMarker([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Componente para actualizar el centro del mapa dinámicamente si cambia
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);
  return null;
}

export default function LocationPickerMap({ 
  initialCenter, 
  onLocationSelect,
  darkMode = true 
}: LocationPickerMapProps) {
  
  // Por defecto Bogotá, si no hay initialCenter
  const defaultCenter: [number, number] = initialCenter 
    ? [initialCenter.latitude, initialCenter.longitude] 
    : [4.6097, -74.0817];

  const [position, setPosition] = useState<[number, number] | null>(initialCenter ? defaultCenter : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const markerRef = useRef<L.Marker>(null);

  const tileUrl = darkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Sincronizar posición seleccionada hacia el componente padre
  useEffect(() => {
    if (position) {
      onLocationSelect({
        latitude: position[0],
        longitude: position[1]
      });
    }
  }, [position, onLocationSelect]);

  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      // Usamos Nominatim con filtros para Colombia (countrycodes=co) y limitamos a 5 opciones
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=co&accept-language=es`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition([lat, lon]);
    setSearchCenter([lat, lon]);
    setSearchResults([]);
    setSearchQuery(result.name || result.display_name.split(',')[0]);
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="Buscar ciudad, barrio o dirección..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="bg-brand hover:bg-brand-light text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {/* Menú desplegable de sugerencias */}
      {searchResults.length > 0 && (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10 animate-fade-in relative">
          <ul className="max-h-60 overflow-y-auto divide-y divide-white/5">
            {searchResults.map((result, idx) => (
              <li key={result.place_id || idx}>
                <button
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex flex-col gap-1 focus:bg-white/10 focus:outline-none"
                >
                  <span className="font-semibold text-white text-sm">{result.name || result.display_name.split(',')[0]}</span>
                  <span className="text-xs text-muted truncate">{result.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-0 mt-2">
        <MapContainer 
          center={defaultCenter} 
          zoom={position ? 15 : 12} 
          scrollWheelZoom={true}
          className="h-full w-full"
        >
        <TileLayer
          url={tileUrl}
          attribution={attribution}
        />
        
        <ClickHandler setMarker={setPosition} />
        {initialCenter && <MapCenterUpdater center={defaultCenter} />}
        {searchCenter && <MapCenterUpdater center={searchCenter} />}

        {position === null ? (
          <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
            <div className="bg-brand/90 backdrop-blur-md text-white font-medium px-4 py-2 rounded-full shadow-lg pointer-events-auto">
              Haz clic en el mapa para ubicar el reporte
            </div>
          </div>
        ) : (
          <Marker 
            position={position}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          >
            <Popup className="font-sans text-sm font-semibold">
              Ubicación seleccionada.<br/>Puedes arrastrar el marcador.
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
    </div>
  );
}
