'use client';

import { useState, useEffect, useMemo } from 'react';
import { PlaceOfInterest } from '@/types';
import { getMunicipalities } from '@/actions/location-actions';
import { getPlacesOfInterest } from '@/actions/places-actions';
import { DynamicLocationMap } from '@/components/DynamicLocationMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { calculateDistance } from '@/utils/geo-distance';
import { Map, List, Loader2, Building2, MapPin, Clock, Phone } from 'lucide-react';

interface PlacesClientProps {
  initialPlaces: PlaceOfInterest[];
  departments: string[];
}

export function PlacesClient({ initialPlaces, departments }: PlacesClientProps) {
  const [places, setPlaces] = useState<PlaceOfInterest[]>(initialPlaces);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { location, loading: locLoading } = useUserLocation();

  // Update municipalities when department changes
  useEffect(() => {
    if (selectedDept) {
      getMunicipalities(selectedDept).then(setMunicipalities);
    } else {
      setMunicipalities([]);
      setSelectedMuni('');
    }
  }, [selectedDept]);

  // Apply filters
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      const filtered = await getPlacesOfInterest({
        department: selectedDept || undefined,
        municipality: selectedMuni || undefined,
        category: selectedCategory || undefined
      });
      setPlaces(filtered);
      setLoading(false);
    };

    fetchPlaces();
  }, [selectedDept, selectedMuni, selectedCategory]);

  const sortedPlaces = useMemo(() => {
    if (!location) {
      return [...places].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return places.map((p: PlaceOfInterest) => ({
      ...p,
      distanceKm: calculateDistance(location.latitude, location.longitude, p.latitude, p.longitude)
    })).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [places, location]);

  const mapMarkers = sortedPlaces.map((p: any) => ({
    id: p.id,
    location: { latitude: p.latitude, longitude: p.longitude },
    title: `${p.name} (${p.category})`
  }));

  const centerLocation = sortedPlaces.length > 0 
    ? { latitude: sortedPlaces[0].latitude, longitude: sortedPlaces[0].longitude }
    : { latitude: 4.6097, longitude: -74.0817 }; // Fallback to Bogota

  const categoryLabels: Record<string, string> = {
    shelter: 'Refugio',
    temp_home: 'Hogar Temporal',
    donation: 'Centro de Acopio',
    vet: 'Veterinaria',
  };

  const categoryColors: Record<string, string> = {
    shelter: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    temp_home: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    donation: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    vet: 'text-brand-light bg-brand/10 border-brand/20',
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        
        {/* Toggle View */}
        <div className="flex bg-white/90 rounded-xl p-1 border border-slate-200 shrink-0 h-11">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 h-full rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 h-full rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" /> Mapa
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-11 bg-white/90 border border-slate-200 rounded-xl px-4 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value="all">Todas las categorías</option>
            <option value="shelter">Refugio</option>
            <option value="temp_home">Hogar Temporal</option>
            <option value="donation">Centro de Acopio</option>
            <option value="vet">Veterinaria</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full h-11 bg-white/90 border border-slate-200 rounded-xl px-4 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value="">Todo el país</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedMuni}
            onChange={(e) => setSelectedMuni(e.target.value)}
            disabled={!selectedDept}
            className="w-full h-11 bg-white/90 border border-slate-200 rounded-xl px-4 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
          >
            <option value="">Cualquier ciudad</option>
            {municipalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {(loading || locLoading) ? (
        <div className="w-full flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPlaces.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted glass rounded-2xl">
              No se encontraron lugares con estos filtros.
            </div>
          ) : (
            sortedPlaces.map((place: any) => (
              <div key={place.id} className="glass rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex flex-col border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[place.category]}`}>
                      {categoryLabels[place.category]}
                    </div>
                    {place.is_temporary && (
                      <div className="px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20 text-orange-400 bg-orange-500/10">
                        Temporal
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">{place.name}</h3>
                
                <div className="space-y-2 mt-auto pt-2 text-sm text-muted">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{place.address}, {place.municipality}, {place.department}</span>
                  </div>
                  {place.business_hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{place.business_hours}</span>
                    </div>
                  )}
                  {place.contact_info && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{place.contact_info}</span>
                    </div>
                  )}
                  {place.is_temporary && place.start_date && place.end_date && (
                    <div className="flex items-start gap-2 text-orange-400/90">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Desde {new Date(place.start_date).toLocaleDateString()} hasta {new Date(place.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {place.donation_types && place.donation_types.length > 0 && (
                    <div className="pt-2">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Reciben:</div>
                      <div className="flex flex-wrap gap-1">
                        {place.donation_types.map((type: string) => (
                          <span key={type} className="text-[10px] px-2 py-0.5 rounded bg-slate-50/80 border border-slate-200 text-slate-700">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {'distanceKm' in place && place.distanceKm !== undefined && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 text-emerald-400 font-medium">
                      <MapPin className="w-4 h-4" />
                      A {(place.distanceKm as number).toFixed(1)} km de ti
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="w-full h-[600px] animate-fade-in border border-slate-200 rounded-2xl overflow-hidden">
          <DynamicLocationMap 
            center={centerLocation}
            markers={mapMarkers}
            zoom={selectedDept ? (selectedMuni ? 13 : 8) : 6}
          />
        </div>
      )}
    </div>
  );
}
