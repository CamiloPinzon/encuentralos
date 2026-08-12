import { getDepartments } from '@/actions/location-actions';
import { PlacesFormClient } from '@/components/PlacesFormClient';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

export default async function PublicarLugarPage() {
  const departments = await getDepartments();

  return (
    <main className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link 
              href="/lugares"
              className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-4 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Lugares
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-400" />
              Registrar Lugar de Interés
            </h1>
            <p className="text-muted mt-2">
              Ayuda a la comunidad añadiendo puntos clave como veterinarias, refugios o centros de donación.
            </p>
          </div>
        </div>

        <PlacesFormClient departments={departments} />
        
      </div>
    </main>
  );
}
