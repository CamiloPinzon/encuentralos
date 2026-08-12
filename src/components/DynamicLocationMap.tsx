'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Wrapper para inyectar el mapa de Leaflet solo en cliente (Lazy Loading)
// Esto evita romper el Server Side Rendering (SSR) y no bloquea el FCP.
const DynamicLocationMap = dynamic(
  () => import('./LocationMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[400px] w-full rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-muted gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p>Cargando mapa interactivo...</p>
      </div>
    )
  }
);

export { DynamicLocationMap };
