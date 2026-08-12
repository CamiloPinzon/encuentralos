import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Report } from '@/types';
import { MapPin, Clock } from 'lucide-react';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  // Formatear la fecha "hace 2 días", etc.
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es });

  return (
    <div className="glass rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col group border border-white/5">
      {/* Imagen (1:1 Cuadrada) */}
      <div className="relative aspect-square w-full bg-black/40 overflow-hidden">
        {report.image_url ? (
          <Image
            src={report.image_url}
            alt={report.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <span>Sin imagen</span>
          </div>
        )}
        
        {/* Etiqueta de estado visual (opcional) */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/10">
          {report.status === 'searching' && <span className="text-amber-400">Buscando</span>}
          {report.status === 'found' && <span className="text-emerald-400">Encontrado</span>}
          {report.status === 'spotted' && <span className="text-blue-400">Visto</span>}
          {report.status === 'resolved' && <span className="text-brand-light">Resuelto</span>}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        <h3 className="font-bold text-lg text-foreground line-clamp-1">{report.title}</h3>
        
        <p className="text-sm text-muted line-clamp-2">
          {report.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{timeAgo}</span>
          </div>
          {report.distanceKm !== undefined && (
            <div className="flex items-center gap-1.5 text-brand-light font-medium">
              <MapPin className="w-4 h-4" />
              <span>A {report.distanceKm.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Botón de acción */}
      <Link 
        href={`/${report.category}/${report.status}/${report.id}`}
        className="w-full bg-white/5 hover:bg-brand hover:text-white transition-colors py-3 text-center font-medium text-sm text-brand-light border-t border-white/5"
      >
        Ver detalles
      </Link>
    </div>
  );
}
