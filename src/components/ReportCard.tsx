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
    <Link 
      href={`/${report.category}/${report.status}/${report.id}`}
      className="bg-paper-white rounded-sm overflow-hidden transition-opacity hover:opacity-80 flex flex-col group border border-warm-ink"
    >
      {/* Imagen (1:1 Cuadrada) */}
      <div className="relative aspect-square w-full bg-powder-blue/30 overflow-hidden border-b border-warm-ink">
        {report.image_url ? (
          <Image
            src={report.image_url}
            alt={report.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-mist-gray font-light">
            <span>Sin imagen</span>
          </div>
        )}
        
        {/* Badge / Tag (Minimal footprint) */}
        <div className="absolute top-3 right-3 bg-paper-white px-2 py-1.5 rounded-sm text-[10px] uppercase tracking-wider border border-powder-blue text-warm-ink font-light">
          {report.status === 'searching' && <span>Buscando</span>}
          {report.status === 'found' && <span>Encontrado</span>}
          {report.status === 'spotted' && <span>Visto</span>}
          {report.status === 'resolved' && <span>Resuelto</span>}
        </div>
      </div>

      {/* Contenido (16px internal padding) */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        <h3 className="font-light text-base text-warm-ink line-clamp-1">{report.title}</h3>
        
        <p className="text-sm font-light text-mist-gray line-clamp-2">
          {report.description}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-mist-gray uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
          {report.distanceKm !== undefined && (
            <div className="flex items-center gap-1.5 text-warm-ink">
              <MapPin className="w-3 h-3" />
              <span>{report.distanceKm.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
