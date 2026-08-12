'use client';

import { useState } from 'react';
import { createReport } from '@/actions/report-actions';
import { Camera, MapPin, Search, AlertCircle, Info, ChevronRight, User, PawPrint, Loader2, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserLocation } from '@/hooks/useUserLocation';
import { DynamicLocationPickerMap } from '@/components/DynamicLocationPickerMap';
import { GeoLocation } from '@/types/geo';

export default function PublicarPage() {
  const router = useRouter();
  const [category, setCategory] = useState<'human' | 'pet' | null>(null);
  const [status, setStatus] = useState<'searching' | 'found' | 'spotted' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  
  const { location, loading: locLoading, requestLocation } = useUserLocation();
  
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category || !status) {
      setError('Por favor selecciona una categoría y un estado.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      form.append('category', category);
      form.append('status', status);
      
      const finalLocation = selectedLocation || location;
      if (finalLocation) {
        form.append('latitude', finalLocation.latitude.toString());
        form.append('longitude', finalLocation.longitude.toString());
      }

      // Llamada al Server Action
      const result = await createReport(form);
      if (result.success) {
        // Redirigir al panel de gestión
        router.push(result.manageUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Crear un <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Reporte</span>
          </h1>
          <p className="text-muted text-lg">Ayúdanos a reunir familias. Completa los datos a continuación.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="glass rounded-2xl p-6 md:p-10 shadow-2xl space-y-8">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Sección 1: ¿A quién reportas? */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-brand/20 text-brand rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              ¿A quién estás reportando?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCategory('human')}
                className={`p-6 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 ${
                  category === 'human' 
                    ? 'glass-active scale-[1.02]' 
                    : 'glass hover:bg-white/5 border-white/5 text-muted hover:text-foreground'
                }`}
              >
                <User className={`w-8 h-8 ${category === 'human' ? 'text-brand-light' : ''}`} />
                <span className="font-medium">Persona</span>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory('pet')}
                className={`p-6 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 ${
                  category === 'pet' 
                    ? 'glass-active scale-[1.02]' 
                    : 'glass hover:bg-white/5 border-white/5 text-muted hover:text-foreground'
                }`}
              >
                <PawPrint className={`w-8 h-8 ${category === 'pet' ? 'text-brand-light' : ''}`} />
                <span className="font-medium">Mascota</span>
              </button>
            </div>
          </section>

          {/* Sección 2: Estado */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-brand/20 text-brand rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              ¿Cuál es la situación?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'searching', label: 'Buscando', icon: Search, color: 'text-amber-400' },
                { id: 'found', label: 'Encontrado', icon: MapPin, color: 'text-emerald-400' },
                { id: 'spotted', label: 'Avistamiento', icon: Info, color: 'text-blue-400' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id as any)}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                    status === s.id 
                      ? 'glass-active scale-[1.02]' 
                      : 'glass hover:bg-white/5 border-white/5 text-muted hover:text-foreground'
                  }`}
                >
                  <s.icon className={`w-6 h-6 ${status === s.id ? s.color : ''}`} />
                  <span className="font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Sección 3: Detalles */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-brand/20 text-brand rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Detalles e Información
            </h2>
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted">Título del reporte</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  placeholder="Ej: Perrito mestizo negro con collar rojo"
                  className="w-full px-4 py-3 rounded-xl input-glass text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted">Descripción y ubicación</label>
                <textarea 
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe las características, lugar donde se vio por última vez, fecha, etc."
                  className="w-full px-4 py-3 rounded-xl input-glass text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Correo electrónico (Obligatorio)</label>
                  <input 
                    type="email" 
                    name="contact_email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-xl input-glass text-foreground"
                  />
                  <p className="text-xs text-muted mt-1">Aquí te enviaremos el enlace para gestionar el reporte.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Teléfono / WhatsApp (Opcional)</label>
                  <input 
                    type="tel" 
                    name="contact_phone"
                    placeholder="+54 9 11 1234 5678"
                    className="w-full px-4 py-3 rounded-xl input-glass text-foreground"
                  />
                  <p className="text-xs text-muted mt-1">Se mostrará públicamente para que te contacten.</p>
                </div>
              </div>

              {/* Upload de Foto */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted">Fotografía (Opcional, pero recomendada)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl bg-black/20 hover:bg-black/40 transition-colors group cursor-pointer relative">
                  <div className="space-y-2 text-center">
                    <Camera className="mx-auto h-12 w-12 text-muted group-hover:text-brand-light transition-colors" />
                    <div className="flex text-sm">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-brand hover:text-brand-light focus-within:outline-none">
                        <span>Sube un archivo</span>
                        <input id="file-upload" name="image" type="file" accept="image/*" className="sr-only" />
                      </label>
                      <p className="pl-1 text-muted">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-muted">PNG, JPG, GIF hasta 10MB</p>
                  </div>
                </div>
              </div>

              {/* Location Picker */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <label className="block text-sm font-medium text-muted">
                  Ubicación Exacta (Haz clic o arrastra el pin en el mapa)
                </label>

                <DynamicLocationPickerMap 
                  initialCenter={location || undefined} 
                  onLocationSelect={setSelectedLocation} 
                />

                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={locLoading}
                    className="flex items-center gap-2 text-sm text-brand hover:text-brand-light transition-colors disabled:opacity-50"
                  >
                    {locLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                    Centrar en mi ubicación actual
                  </button>

                  {selectedLocation && (
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                      Coordenadas seleccionadas
                    </span>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Sección 4: Legal y Submit */}
          <section className="pt-4 border-t border-white/10 space-y-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  required
                  className="w-5 h-5 rounded border-white/20 bg-black/50 text-brand focus:ring-brand focus:ring-offset-background"
                />
              </div>
              <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                Entiendo y acepto que la información e imágenes proporcionadas serán públicas. Exonero a los desarrolladores de esta plataforma de cualquier responsabilidad por el uso de estos datos.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  Publicar Reporte
                  <ChevronRight className="w-6 h-6" />
                </>
              )}
            </button>
          </section>

        </form>
      </div>
    </main>
  );
}
