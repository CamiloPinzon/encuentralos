import { Metadata, ResolvingMetadata } from 'next';
import { getReportById } from '@/actions/report-actions';
import { Report } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/ShareButton';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Phone, MessageCircle, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { DynamicLocationMap } from '@/components/DynamicLocationMap';

interface ReportDetailPageProps {
  params: Promise<{
    category: string;
    status: string;
    id: string;
  }>;
}

// 1. GENERACIÓN DE METADATA DINÁMICA (OPEN GRAPH)
export async function generateMetadata(
  { params }: ReportDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id) as Report;

  if (!report) {
    return {
      title: 'Reporte no encontrado',
    };
  }

  const title = `Ayuda con este reporte: ${report.title}`;
  const description = report.description.substring(0, 150) + '...';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: report.image_url ? [
        {
          url: report.image_url,
          width: 800,
          height: 800,
          alt: report.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: report.image_url ? [report.image_url] : [],
    }
  };
}

// 2. VISTA DE DETALLE
export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { category, status, id } = await params;
  const report = await getReportById(id) as Report;

  if (!report) {
    return (
      <main className="min-h-screen py-20 px-4 text-center flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-3xl font-bold">Reporte no encontrado</h1>
        <p className="text-muted">Es posible que haya sido eliminado o resuelto.</p>
        <Link href="/" className="text-brand hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es });
  
  // Mensaje prellenado para WhatsApp
  const whatsappMessage = encodeURIComponent(`Hola, te escribo por el reporte de Encuéntralos: "${report.title}". ¿Podemos hablar?`);

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación */}
        <Link 
          href={`/${category}/${status}`} 
          className="inline-flex items-center gap-2 text-muted hover:text-brand transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver al listado
        </Link>

        {/* Tarjeta Principal */}
        <article className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row">
            
            {/* Sección de Imagen */}
            <div className="w-full md:w-1/2 relative bg-black/60 min-h-[300px] md:min-h-[500px]">
              {report.image_url ? (
                <Image
                  src={report.image_url}
                  alt={report.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted">
                  <span>Este reporte no incluye fotografía</span>
                </div>
              )}
            </div>

            {/* Sección de Datos */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
              
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-brand/20 text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-brand/20">
                  {status}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                  <Clock className="w-4 h-4" />
                  {timeAgo}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-foreground mb-6 leading-tight">
                {report.title}
              </h1>

              <div className="prose prose-invert prose-p:text-muted max-w-none flex-grow mb-8">
                <p className="whitespace-pre-wrap leading-relaxed">{report.description}</p>
              </div>

              {/* Mapa (si hay coordenadas) */}
              {typeof report.latitude === 'number' && typeof report.longitude === 'number' && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación del reporte
                  </h3>
                  <div className="rounded-xl overflow-hidden shadow-lg shadow-black/20 border border-white/5">
                    <DynamicLocationMap 
                      center={{ latitude: report.latitude, longitude: report.longitude }} 
                      centerPopupText="Ubicación del reporte"
                      zoom={15}
                    />
                  </div>
                </div>
              )}

              {/* Botones de Acción Inmediata */}
              <div className="space-y-4 mt-auto">
                {report.contact_phone && (
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href={`https://wa.me/${report.contact_phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-[#25D366]/20"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <a 
                      href={`tel:${report.contact_phone.replace(/\D/g, '')}`}
                      className="flex items-center justify-center gap-2 glass-active hover:bg-brand text-brand-light hover:text-white py-3 px-4 rounded-xl font-bold transition-all border border-brand/30"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="hidden sm:inline">Llamar</span>
                    </a>
                  </div>
                )}

                <div className="flex gap-4">
                  {!report.contact_phone && (
                    <a 
                      href={`mailto:${report.contact_email}?subject=Sobre el reporte: ${report.title}`}
                      className="flex items-center justify-center gap-2 flex-1 glass-active hover:bg-brand text-brand-light hover:text-white py-3 px-4 rounded-xl font-bold transition-all border border-brand/30"
                    >
                      Enviar Correo
                    </a>
                  )}
                  <ShareButton 
                    title={report.title} 
                    text={report.description.substring(0, 50) + '...'} 
                  />
                </div>
              </div>

            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
