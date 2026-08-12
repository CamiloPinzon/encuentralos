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
  const [filterNearby, setFilterNearby] = useState(false);
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

  // Filtramos por radio solo si el usuario tiene ubicación Y eligió filtrar
  const displayedReports = useMemo(() => {
    if (location && filterNearby) {
      return filterByRadius(reportsWithLocation, location, 50); // 50 km de radio
    }
    return reportsWithLocation;
  }, [reportsWithLocation, location, filterNearby]);

  const mapMarkers = displayedReports.filter(r => r.location).map(r => ({
    id: r.id,
    location: r.location!,
    title: r.title
  }));

  const centerLocation = location || { latitude: 4.6097, longitude: -74.0817 }; // Fallback

  return (
    <div className="space-y-6">
      
      {/* Controles del Feed */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-b border-powder-blue mb-8">
        <div className="flex items-center gap-4">
          <div className="flex bg-paper-white rounded-sm p-1 border border-powder-blue">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                viewMode === 'list' ? 'bg-slate-bloom text-white' : 'text-mist-gray hover:text-warm-ink'
              }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                viewMode === 'map' ? 'bg-slate-bloom text-white' : 'text-mist-gray hover:text-warm-ink'
              }`}
            >
              <Map className="w-4 h-4" /> Mapa
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-mist-gray font-light">
          {locLoading ? (
             <span className="flex items-center gap-2 text-warm-ink">
               <Loader2 className="w-4 h-4 animate-spin" /> Buscando tu ubicación...
             </span>
          ) : location ? (
             <label className="flex items-center gap-2 cursor-pointer hover:text-warm-ink transition-colors">
               <input 
                 type="checkbox" 
                 checked={filterNearby} 
                 onChange={(e) => setFilterNearby(e.target.checked)} 
                 className="rounded-sm border-warm-ink bg-paper-white text-slate-bloom focus:ring-slate-bloom accent-slate-bloom w-4 h-4"
               />
               <span>Mostrar solo casos cerca de mí (50km)</span>
             </label>
          ) : (
             <button onClick={requestLocation} className="text-slate-bloom hover:underline">
               Activar ubicación para filtrar cerca de ti
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
