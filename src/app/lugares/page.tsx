import { getPlacesOfInterest } from '@/actions/places-actions';
import { getDepartments } from '@/actions/location-actions';
import { PlacesClient } from '@/components/PlacesClient';
import Link from 'next/link';
import { PlusCircle, Building2 } from 'lucide-react';

export default async function LugaresPage() {
  const initialPlaces = await getPlacesOfInterest();
  const departments = await getDepartments();

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 flex items-center gap-3">
              <Building2 className="w-10 h-10 text-emerald-400" />
              Lugares de Interés
            </h1>
            <p className="text-muted mt-2">
              Encuentra refugios, hogares temporales, centros de acopio y veterinarias.
            </p>
          </div>

          <Link 
            href="/lugares/publicar" 
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <PlusCircle className="w-5 h-5" />
            Agregar Lugar
          </Link>
        </div>

        <PlacesClient 
          initialPlaces={initialPlaces} 
          departments={departments}
        />
        
      </div>
    </main>
  );
}
