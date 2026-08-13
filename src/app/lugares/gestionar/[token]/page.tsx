'use client';

import { useState, use, useEffect } from 'react';
import { getPlaceByToken, deletePlaceOfInterest } from '@/actions/places-actions';
import { PlaceOfInterest } from '@/types';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Trash2, Home, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

export default function GestionarLugarPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  
  const [place, setPlace] = useState<PlaceOfInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlaceByToken(token).then(data => {
      setPlace(data as PlaceOfInterest);
      setLoading(false);
    });
  }, [token]);

  const handleDelete = async () => {
    if (!confirm('¿Estás SEGURO de querer ELIMINAR definitivamente este lugar/centro de acopio? Esta acción no se puede deshacer.')) return;
    setActionLoading(true);
    try {
      const result = await deletePlaceOfInterest(token);
      if (result.success) {
        alert('Lugar eliminado correctamente');
        router.push('/lugares');
      } else {
        setError(result.error || 'Error desconocido');
        setActionLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </main>
    );
  }

  if (!place) {
    return (
      <main className="min-h-screen py-20 px-4 text-center flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-3xl font-bold">Token Inválido</h1>
        <p className="text-muted">Este enlace de gestión no es válido o el lugar ya fue eliminado.</p>
        <Link href="/lugares" className="text-brand hover:underline mt-4 inline-block">
          Volver a lugares
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Gestión de Lugar</h1>
          <p className="text-muted">Administra tu lugar o centro de acopio.</p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-sm text-left flex gap-3 items-start">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p><strong>Guarda este enlace:</strong> Es la única forma de administrar o eliminar este lugar en el futuro. Cópialo y guárdalo en un lugar seguro.</p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200 space-y-6 text-left shadow-2xl">
          <div className="space-y-2 pb-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold">{place.name}</h2>
            <p className="text-muted text-sm">{place.address}, {place.municipality}, {place.department}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                {place.category === 'donation' ? 'Centro de Acopio' : 
                 place.category === 'shelter' ? 'Refugio' : 
                 place.category === 'vet' ? 'Veterinaria' : 'Hogar Temporal'}
              </span>
              {place.is_temporary && (
                <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  Temporal
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Eliminar Definitivamente
              </span>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                Cerrar o borrar este lugar
              </span>
            </button>
          </div>
          
          <div className="pt-4 flex justify-center">
             <Link href={`/lugares`} className="text-sm text-brand hover:underline">
               Ver mapa de lugares
             </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
