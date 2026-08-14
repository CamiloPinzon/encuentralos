'use client';

import { useMemo } from 'react';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { GeoLocation } from '@/types/geo';

interface LocationMapProps {
  center: GeoLocation;
  markers?: Array<{
    id: string;
    location: GeoLocation;
    title: string;
  }>;
  zoom?: number;
  darkMode?: boolean;
  centerPopupText?: string;
}

// Estilos dark mode para Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

// Bibliotecas a cargar. Es importante declararlo fuera del componente para evitar re-renders.
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function LocationMap({ 
  center, 
  markers = [], 
  zoom = 13,
  darkMode = true,
  centerPopupText = "Tu ubicación aproximada"
}: LocationMapProps) {
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const mapCenter = useMemo(() => ({ lat: center.latitude, lng: center.longitude }), [center]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    clickableIcons: false,
    scrollwheel: true,
    styles: darkMode ? darkMapStyle : undefined,
  }), [darkMode]);

  if (loadError) {
    return (
      <div className="h-[400px] w-full rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 p-4 text-center">
        Error al cargar Google Maps. Verifica tu API Key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full rounded-2xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center text-muted gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p>Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 relative z-0">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
      >
        {/* Marcador Principal */}
        <MarkerF 
          position={mapCenter} 
          title={centerPopupText}
        />

        {/* Marcadores Secundarios */}
        {markers.map((marker) => (
          <MarkerF 
            key={marker.id}
            position={{ lat: marker.location.latitude, lng: marker.location.longitude }}
            title={marker.title}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
