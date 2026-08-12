'use server';

import { unstable_cache } from 'next/cache';

export interface DaneLocation {
  region: string;
  c_digo_dane_del_departamento: string;
  departamento: string;
  c_digo_dane_del_municipio: string;
  municipio: string;
}

/**
 * Fetch all locations from DANE.
 * Cached indefinitely by Next.js until revalidated.
 */
export const getDaneLocations = unstable_cache(
  async (): Promise<DaneLocation[]> => {
    try {
      const res = await fetch('https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=2000', {
        next: { revalidate: 86400 } // Cache for 24 hours
      });
      if (!res.ok) throw new Error('Failed to fetch from DANE API');
      const data = await res.json();
      
      // Mapear el nuevo formato al formato antiguo (o usar el nuevo si prefieres)
      return data.map((item: any) => ({
        region: '', // no longer provided
        c_digo_dane_del_departamento: item.cod_dpto,
        departamento: item.dpto,
        c_digo_dane_del_municipio: item.cod_mpio,
        municipio: item.nom_mpio
      }));
    } catch (error) {
      console.error('Error fetching DANE locations:', error);
      return [];
    }
  },
  ['dane-locations-cache'],
  { revalidate: 86400, tags: ['dane'] }
);

/**
 * Get unique departments sorted alphabetically.
 */
export async function getDepartments(): Promise<string[]> {
  const locations = await getDaneLocations();
  const depts = new Set(locations.map(loc => loc.departamento));
  return Array.from(depts).sort();
}

/**
 * Get municipalities for a given department, sorted alphabetically.
 */
export async function getMunicipalities(department: string): Promise<string[]> {
  const locations = await getDaneLocations();
  const munis = locations
    .filter(loc => loc.departamento === department)
    .map(loc => loc.municipio);
  return Array.from(new Set(munis)).sort();
}
