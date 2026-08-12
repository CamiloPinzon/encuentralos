'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoLocation } from '@/types/geo';

// Solución para el bug clásico de los iconos de Leaflet en React
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

interface LocationMapProps {
  center: GeoLocation;
  markers?: Array<{
    id: string;
    location: GeoLocation;
    title: string;
  }>;
  zoom?: number;
  darkMode?: boolean;
}

// Componente para actualizar el centro del mapa dinámicamente
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function LocationMap({ 
  center, 
  markers = [], 
  zoom = 13,
  darkMode = true 
}: LocationMapProps) {
  
  // URLs de tiles (CartoDB Positron para claro, Dark Matter para oscuro)
  const tileUrl = darkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer 
        center={[center.latitude, center.longitude]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url={tileUrl}
          attribution={attribution}
        />
        
        {/* Marcador del Usuario (Centro) */}
        <Marker position={[center.latitude, center.longitude]}>
          <Popup>Tu ubicación aproximada</Popup>
        </Marker>

        {/* Marcadores Dinámicos (Mascotas, Ads, Fundaciones) */}
        {markers.map((marker) => (
          <Marker 
            key={marker.id}
            position={[marker.location.latitude, marker.location.longitude]}
          >
            <Popup className="font-sans text-sm font-semibold">
              {marker.title}
            </Popup>
          </Marker>
        ))}
        
        <MapUpdater center={[center.latitude, center.longitude]} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
