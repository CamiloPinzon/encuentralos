'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ReportCard } from '@/components/ReportCard';
import { DynamicLocationMap } from '@/components/DynamicLocationMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { filterByRadius } from '@/utils/geo-distance';
import { Report } from '@/types';
import { Map, List, Loader2 } from 'lucide-react';
import { getReports } from '@/actions/report-actions';
import Link from 'next/link';

interface FeedClientProps {
  initialReports: Report[];
  category: string;
  status: string;
}

export function FeedClient({ initialReports, category, status }: FeedClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterNearby, setFilterNearby] = useState(false);
  const { location, loading: locLoading, requestLocation } = useUserLocation();

  // Estado para Infinite Scroll
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialReports.length === 10);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    try {
      const newReports = await getReports(category, status, page, 10);
      if (newReports.length < 10) {
        setHasMore(false);
      }
      setReports(prev => [...prev, ...newReports as Report[]]);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [category, status, page, hasMore, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  // Extraemos la ubicación real de la Base de Datos o descartamos si no tiene
  const reportsWithLocation = useMemo(() => {
    return reports.map(report => ({
      ...report,
      location: report.latitude && report.longitude ? {
        latitude: report.latitude,
        longitude: report.longitude
      } : undefined
    }));
  }, [reports]);

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

        <div className="flex items-center gap-3 text-sm text-muted">
          {locLoading ? (
             <span className="flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /> Buscando tu ubicación...
             </span>
          ) : location ? (
             <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
               <input 
                 type="checkbox" 
                 checked={filterNearby} 
                 onChange={(e) => setFilterNearby(e.target.checked)} 
                 className="rounded border-white/20 bg-black/40 text-brand focus:ring-brand accent-brand w-4 h-4"
               />
               <span>Mostrar solo casos cerca de mí (50km)</span>
             </label>
          ) : (
             <button onClick={requestLocation} className="text-brand hover:underline">
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

      {/* Target for Infinite Scroll observer */}
      {viewMode === 'list' && displayedReports.length > 0 && hasMore && (
        <div ref={observerTarget} className="w-full flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      )}
      
      {viewMode === 'list' && displayedReports.length > 0 && !hasMore && (
        <div className="text-center text-muted py-8">
          Has llegado al final de la lista.
        </div>
      )}
    </div>
  );
}
