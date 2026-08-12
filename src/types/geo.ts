export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Interfaz genérica para elementos que tienen ubicación (Mascotas, Ads, Reportes)
export interface GeoLocatable {
  location?: GeoLocation;
  distanceKm?: number; // Calculada en runtime respecto al usuario
}
