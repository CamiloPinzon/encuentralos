'use client';

import { useState } from 'react';
import { createReport } from '@/actions/report-actions';
import { Camera, MapPin, Search, AlertCircle, Info, ChevronRight, User, PawPrint, Loader2, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserLocation } from '@/hooks/useUserLocation';
import { DynamicLocationPickerMap } from '@/components/DynamicLocationPickerMap';
import { GeoLocation } from '@/types/geo';
import { compressImage } from '@/utils/image-optimizer';

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
      
      // Optimizar imagen si es mayor a 2MB
      const imageFile = form.get('image') as File | null;
      if (imageFile && imageFile.size > 2 * 1024 * 1024) {
        try {
          const compressedFile = await compressImage(imageFile, 1920, 1920, 0.8);
          form.set('image', compressedFile);
        } catch (compressErr) {
          console.warn('No se pudo comprimir la imagen, intentando enviar original:', compressErr);
          // Si falla la compresión, dejamos la imagen original y que el servidor decida
        }
      }

      // Llamada al Server Action
      const result = await createReport(form);
      if (result.success && result.manageUrl) {
        // Redirigir al panel de gestión
        router.push(result.manageUrl);
      } else {
        setError(result.error || 'Error desconocido al crear el reporte');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 bg-paper-white text-warm-ink">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Encabezado */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            Crear un <span className="text-warm-ink font-medium">Reporte</span>
          </h1>
          <p className="text-mist-gray text-lg font-light">Ayúdanos a reunir familias. Completa los datos a continuación.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="bg-paper-white border border-powder-blue rounded-sm p-6 md:p-10 space-y-12">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Sección 1: ¿A quién reportas? */}
          <section className="space-y-6">
            <h2 className="text-xl font-light flex items-center gap-3">
              <span className="border border-powder-blue text-warm-ink rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">1</span>
              ¿A quién estás reportando?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCategory('human')}
                className={`p-6 rounded-sm border transition-all duration-300 flex flex-col items-center gap-3 ${
                  category === 'human' 
                    ? 'border-slate-bloom bg-powder-blue/10 text-slate-bloom' 
                    : 'border-powder-blue bg-transparent text-mist-gray hover:text-warm-ink'
                }`}
              >
                <User className={`w-8 h-8 ${category === 'human' ? 'text-slate-bloom' : ''}`} />
                <span className="font-light">Persona</span>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory('pet')}
                className={`p-6 rounded-sm border transition-all duration-300 flex flex-col items-center gap-3 ${
                  category === 'pet' 
                    ? 'border-slate-bloom bg-powder-blue/10 text-slate-bloom' 
                    : 'border-powder-blue bg-transparent text-mist-gray hover:text-warm-ink'
                }`}
              >
                <PawPrint className={`w-8 h-8 ${category === 'pet' ? 'text-slate-bloom' : ''}`} />
                <span className="font-light">Mascota</span>
              </button>
            </div>
          </section>

          {/* Sección 2: Estado */}
          <section className="space-y-6">
            <h2 className="text-xl font-light flex items-center gap-3">
              <span className="border border-powder-blue text-warm-ink rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">2</span>
              ¿Cuál es la situación?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'searching', label: 'Buscando', icon: Search },
                { id: 'found', label: 'Encontrado', icon: MapPin },
                { id: 'spotted', label: 'Avistamiento', icon: Info },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id as any)}
                  className={`p-4 rounded-sm border transition-all duration-300 flex flex-col items-center gap-2 ${
                    status === s.id 
                      ? 'border-slate-bloom bg-powder-blue/10 text-slate-bloom' 
                      : 'border-powder-blue bg-transparent text-mist-gray hover:text-warm-ink'
                  }`}
                >
                  <s.icon className="w-6 h-6" />
                  <span className="font-light">{s.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Sección 3: Detalles */}
          <section className="space-y-6">
            <h2 className="text-xl font-light flex items-center gap-3">
              <span className="border border-powder-blue text-warm-ink rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">3</span>
              Detalles e Información
            </h2>
            <div className="space-y-8">
              
              <div>
                <label className="block text-sm font-light mb-1.5 text-mist-gray">Título del reporte</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  placeholder="Ej: Perrito mestizo negro con collar rojo"
                  className="w-full py-3 bg-transparent text-warm-ink"
                />
              </div>

              <div>
                <label className="block text-sm font-light mb-1.5 text-mist-gray">Descripción y ubicación</label>
                <textarea 
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe las características, lugar donde se vio por última vez, fecha, etc."
                  className="w-full py-3 bg-transparent text-warm-ink resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-light mb-1.5 text-mist-gray">Correo electrónico (Obligatorio)</label>
                  <input 
                    type="email" 
                    name="contact_email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full py-3 bg-transparent text-warm-ink"
                  />
                  <p className="text-xs text-mist-gray mt-1">Aquí te enviaremos el enlace para gestionar el reporte.</p>
                </div>
                <div>
                  <label className="block text-sm font-light mb-1.5 text-mist-gray">Teléfono / WhatsApp (Opcional)</label>
                  <input 
                    type="tel" 
                    name="contact_phone"
                    placeholder="+54 9 11 1234 5678"
                    className="w-full py-3 bg-transparent text-warm-ink"
                  />
                  <p className="text-xs text-mist-gray mt-1">Se mostrará públicamente para que te contacten.</p>
                </div>
              </div>

              {/* Upload de Foto */}
              <div>
                <label className="block text-sm font-light mb-1.5 text-mist-gray">Fotografía (Opcional, pero recomendada)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-powder-blue rounded-sm bg-powder-blue/5 hover:bg-powder-blue/10 transition-colors group cursor-pointer relative">
                  <div className="space-y-2 text-center">
                    <Camera className="mx-auto h-12 w-12 text-mist-gray group-hover:text-slate-bloom transition-colors" />
                    <div className="flex text-sm">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-sm font-light text-slate-bloom focus-within:outline-none">
                        <span>Sube un archivo</span>
                        <input id="file-upload" name="image" type="file" accept="image/*" className="sr-only" />
                      </label>
                      <p className="pl-1 text-mist-gray">o arrastra y suelta</p>
                    </div>
                    <p className="text-[10px] text-mist-gray uppercase tracking-widest">PNG, JPG hasta 10MB</p>
                  </div>
                </div>
              </div>

              {/* Location Picker */}
              <div className="pt-8 border-t border-powder-blue space-y-4">
                <label className="block text-sm font-light text-mist-gray">
                  Ubicación Exacta (Haz clic o arrastra el pin en el mapa)
                </label>

                <div className="border border-warm-ink rounded-sm overflow-hidden">
                  <DynamicLocationPickerMap 
                    initialCenter={location || undefined} 
                    onLocationSelect={setSelectedLocation} 
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={locLoading}
                    className="flex items-center gap-2 text-sm text-slate-bloom transition-colors disabled:opacity-50 font-light"
                  >
                    {locLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                    Centrar en mi ubicación actual
                  </button>

                  {selectedLocation && (
                    <span className="text-[10px] text-warm-ink font-light uppercase tracking-widest bg-powder-blue px-3 py-1.5 rounded-sm">
                      Coordenadas guardadas
                    </span>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Sección 4: Legal y Submit */}
          <section className="pt-8 border-t border-powder-blue space-y-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  required
                  className="w-4 h-4 rounded-sm border-warm-ink bg-transparent text-slate-bloom focus:ring-slate-bloom"
                />
              </div>
              <span className="text-sm font-light text-mist-gray group-hover:text-warm-ink transition-colors leading-relaxed">
                Entiendo y acepto que la información e imágenes proporcionadas serán públicas. Exonero a los desarrolladores de esta plataforma de cualquier responsabilidad por el uso de estos datos.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-bloom text-white py-4 px-8 rounded-full font-medium text-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
