import { GeoLocation } from '../types/geo';

/**
 * Calcula la distancia en Kilómetros entre dos coordenadas usando la fórmula de Haversine.
 * Muy eficiente para ejecuciones en cliente (O(1)).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km
  
  return distance;
}

/**
 * Helper genérico para filtrar y ordenar un array de objetos (GeoLocatable)
 * por su distancia respecto al usuario, dentro de un radio máximo.
 */
export function filterByRadius<T extends { location?: GeoLocation }>(
  items: T[],
  userLocation: GeoLocation,
  maxRadiusKm: number
): (T & { distanceKm: number })[] {
  return items
    .map(item => {
      if (!item.location) return null;
      
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.location.latitude,
        item.location.longitude
      );
      
      return { ...item, distanceKm: dist };
    })
    .filter((item): item is (T & { distanceKm: number }) => item !== null && item.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
