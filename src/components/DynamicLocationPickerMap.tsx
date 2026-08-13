'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DynamicLocationPickerMap = dynamic(
  () => import('./LocationPickerMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[350px] w-full rounded-2xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center text-muted gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p>Cargando mapa interactivo...</p>
      </div>
    )
  }
);

export { DynamicLocationPickerMap };
