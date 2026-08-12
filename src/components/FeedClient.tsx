'use client';

import { useState, useMemo } from 'react';
import { ReportCard } from '@/components/ReportCard';
import { DynamicLocationMap } from '@/components/DynamicLocationMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { filterByRadius } from '@/utils/geo-distance';
import { Report } from '@/types';
import { Map, List, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FeedClientProps {
  initialReports: Report[];
}

export function FeedClient({ initialReports }: FeedClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { location, loading: locLoading, requestLocation } = useUserLocation();

  // Extraemos la ubicación real de la Base de Datos o descartamos si no tiene
  const reportsWithLocation = useMemo(() => {
    return initialReports.map(report => ({
      ...report,
      location: report.latitude && report.longitude ? {
        latitude: report.latitude,
        longitude: report.longitude
      } : undefined
    }));
  }, [initialReports]);

  // Si tenemos la ubicación del usuario, filtramos por radio de 50km
  const displayedReports = useMemo(() => {
    if (location) {
      return filterByRadius(reportsWithLocation, location, 50); // 50 km de radio
    }
    return reportsWithLocation;
  }, [reportsWithLocation, location]);

  const mapMarkers = displayedReports.filter(r => r.location).map(r => ({
    id: r.id,
    location: r.location!,
    title: r.title
  }));

  const centerLocation = location || { latitude: 4.6097, longitude: -74.0817 }; // Fallback

  return (
    <div className="space-y-6">
      
      {/* Controles del Feed */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list' ? 'bg-brand text-white shadow-lg' : 'text-muted hover:text-white'
              }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'map' ? 'bg-brand text-white shadow-lg' : 'text-muted hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" /> Mapa
            </button>
          </div>
        </div>

        <div className="text-sm text-muted">
          {locLoading ? (
             <span className="flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /> Buscando tu ubicación...
             </span>
          ) : location ? (
             <span className="text-emerald-400">Mostrando casos a menos de 50km</span>
          ) : (
             <button onClick={requestLocation} className="text-brand hover:underline">
               Activar ubicación para filtrar
             </button>
          )}
        </div>
      </div>

      {/* Vistas */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedReports.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted">
              No hay reportes cerca de tu ubicación actual.
            </div>
          ) : (
            displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      ) : (
        <div className="w-full h-[600px] animate-fade-in">
          <DynamicLocationMap 
            center={centerLocation}
            markers={mapMarkers}
            zoom={12}
          />
        </div>
      )}
    </div>
  );
}
