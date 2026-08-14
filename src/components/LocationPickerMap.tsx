'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, MarkerF, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';
import { Search, Loader2 } from 'lucide-react';
import { GeoLocation } from '@/types/geo';

interface LocationPickerMapProps {
  initialCenter?: GeoLocation;
  onLocationSelect: (location: GeoLocation) => void;
  darkMode?: boolean;
}

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

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function LocationPickerMap({ 
  initialCenter, 
  onLocationSelect,
  darkMode = true 
}: LocationPickerMapProps) {
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const defaultCenter = useMemo(() => {
    return initialCenter 
      ? { lat: initialCenter.latitude, lng: initialCenter.longitude }
      : { lat: 4.6097, lng: -74.0817 }; // Bogotá por defecto
  }, [initialCenter]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(initialCenter ? defaultCenter : null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    clickableIcons: false,
    scrollwheel: true,
    styles: darkMode ? darkMapStyle : undefined,
  }), [darkMode]);

  // Emitir cambios de posición al padre
  useEffect(() => {
    if (position) {
      onLocationSelect({
        latitude: position.lat,
        longitude: position.lng
      });
    }
  }, [position, onLocationSelect]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setPosition({ lat, lng });
          map?.panTo({ lat, lng });
          map?.setZoom(15);
        }
      }
    }
  }, [map]);

  if (loadError) {
    return (
      <div className="h-[350px] w-full rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 p-4 text-center mt-2">
        Error al cargar Google Maps. Verifica tu API Key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[350px] w-full rounded-2xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center text-muted gap-3 mt-2">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p>Cargando mapa interactivo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input using StandaloneSearchBox */}
      <StandaloneSearchBox
        onLoad={onSearchBoxLoad}
        onPlacesChanged={onPlacesChanged}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Buscar ciudad, barrio o dirección..."
            className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </div>
      </StandaloneSearchBox>

      {/* Map Container */}
      <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-slate-200 relative z-0 mt-2">
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={position || defaultCenter}
          zoom={position ? 15 : 12}
          options={mapOptions}
          onLoad={onMapLoad}
          onClick={onMapClick}
        >
          {position === null ? (
            <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
              <div className="bg-brand/90 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg pointer-events-auto">
                Haz clic en el mapa para ubicar el marcador
              </div>
            </div>
          ) : (
            <MarkerF
              position={position}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
