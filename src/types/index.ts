import { GeoLocatable } from './geo';

// Este archivo sirve para exportar tipos compartidos
export interface Report {
  id: string;
  created_at: string;
  category: 'human' | 'pet';
  status: 'searching' | 'found' | 'spotted' | 'resolved';
  title: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
  image_url?: string;
  edit_token: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export interface PlaceOfInterest {
  id: string;
  name: string;
  category: "shelter" | "temp_home" | "donation" | "vet";
  department: string;
  municipality: string;
  address: string;
  latitude: number;
  longitude: number;
  business_hours?: string;
  contact_info?: string;
  created_at: string;
}