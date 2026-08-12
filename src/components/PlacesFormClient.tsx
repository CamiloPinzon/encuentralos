'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPlaceOfInterest } from '@/actions/places-actions';
import { getMunicipalities } from '@/actions/location-actions';
import { DynamicLocationPickerMap } from '@/components/DynamicLocationPickerMap';
import { Loader2, Save, MapPin } from 'lucide-react';
import { GeoLocation } from '@/types/geo';

interface PlacesFormClientProps {
  departments: string[];
}

export function PlacesFormClient({ departments }: PlacesFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);

  useEffect(() => {
    if (selectedDept) {
      getMunicipalities(selectedDept).then(setMunicipalities);
    } else {
      setMunicipalities([]);
      setSelectedMuni('');
    }
  }, [selectedDept]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!location) {
      setError('Debes seleccionar la ubicación en el mapa.');
      return;
    }
    
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());

    try {
      const result = await createPlaceOfInterest(formData);
      if (!result.success) {
        setError(result.error || 'Ocurrió un error inesperado');
      } else {
        router.push('/lugares');
        router.refresh();
      }
    } catch (err: any) {
      setError('Ocurrió un error al guardar el lugar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 glass p-8 rounded-3xl border border-white/10">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white block">Nombre del Lugar</label>
          <input
            name="name"
            required
            maxLength={100}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            placeholder="Ej: Fundación Patitas"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white block">Categoría</label>
          <select
            name="category"
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          >
            <option value="">Selecciona una categoría</option>
            <option value="shelter">Refugio</option>
            <option value="temp_home">Hogar Temporal</option>
            <option value="donation">Centro de Acopio</option>
            <option value="vet">Veterinaria Solidaria</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white block">Departamento</label>
          <select
            name="department"
            required
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          >
            <option value="">Selecciona un departamento</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white block">Municipio</label>
          <select
            name="municipality"
            required
            value={selectedMuni}
            onChange={(e) => setSelectedMuni(e.target.value)}
            disabled={!selectedDept}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
          >
            <option value="">Selecciona un municipio</option>
            {municipalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-white block">Dirección Física</label>
          <input
            name="address"
            required
            maxLength={200}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            placeholder="Ej: Calle 123 # 45 - 67"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white block">Horarios de Atención (Opcional)</label>
          <input
            name="business_hours"
            maxLength={100}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            placeholder="Ej: Lunes a Viernes 8am - 5pm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white block">Información de Contacto (Opcional)</label>
          <input
            name="contact_info"
            maxLength={100}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            placeholder="Teléfono o Email"
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/10">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Ubicación Exacta en el Mapa (Requerido)
        </label>
        <p className="text-xs text-muted">Arrastra el marcador rojo a la ubicación exacta del lugar. Esto ayudará a que la gente lo encuentre cerca de ellos.</p>
        <div className="w-full rounded-2xl overflow-hidden border border-white/10">
          <DynamicLocationPickerMap
            onLocationSelect={setLocation}
            initialCenter={{ latitude: 4.6097, longitude: -74.0817 }} // Bogota fallback
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
        {loading ? 'Publicando...' : 'Publicar Lugar de Interés'}
      </button>
    </form>
  );
}
