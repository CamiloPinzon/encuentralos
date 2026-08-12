'use client';

import { useState, useEffect } from 'react';
import { GeoLocation } from '@/types/geo';

interface UseUserLocationResult {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocalización no soportada por tu navegador');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // Fallback silencioso/elegante: Permitimos que la app siga funcionando
        console.warn('Usuario denegó o falló la geolocalización', err.message);
        setError('No pudimos acceder a tu ubicación. Mostrando resultados globales.');
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // Privacy First: No necesitamos precisión milimétrica
        timeout: 10000,
        maximumAge: 300000 // Cachear 5 minutos
      }
    );
  };

  useEffect(() => {
    // Intentar obtener la ubicación automáticamente al montar
    requestLocation();
  }, []);

  return { location, loading, error, requestLocation };
}
