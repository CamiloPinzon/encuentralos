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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Usamos Nominatim de OpenStreetMap (Gratuito, no requiere API key)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        setSearchCenter([lat, lon]);
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
    } finally {
      setIsSearching(false);
    }
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
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad, barrio o dirección..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="bg-brand hover:bg-brand-light text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </button>
      </form>

      <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
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
