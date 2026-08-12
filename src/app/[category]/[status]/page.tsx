import { getReports } from '@/actions/report-actions';
import { ReportCard } from '@/components/ReportCard';
import { FeedClient } from '@/components/FeedClient';
import { Report } from '@/types';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

interface FeedPageProps {
  params: Promise<{
    category: string;
    status: string;
  }>;
}

const titles: Record<string, Record<string, string>> = {
  human: {
    searching: 'Personas Buscadas',
    found: 'Personas Encontradas',
    spotted: 'Personas Avistadas',
    resolved: 'Casos Resueltos (Personas)',
  },
  pet: {
    searching: 'Mascotas Buscadas',
    found: 'Mascotas Encontradas',
    spotted: 'Mascotas Avistadas',
    resolved: 'Casos Resueltos (Mascotas)',
  }
};

export default async function FeedPage({ params }: FeedPageProps) {
  const { category, status } = await params;
  
  // Validar parámetros
  if (!['human', 'pet'].includes(category) || !['searching', 'found', 'spotted', 'resolved'].includes(status)) {
    return (
      <main className="container mx-auto p-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-red-400">Categoría o estado inválido</h1>
      </main>
    );
  }

  const reports = await getReports(category, status) as Report[];
  const pageTitle = titles[category]?.[status] || 'Reportes';

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">
              {pageTitle}
            </h1>
            <p className="text-muted mt-2">
              Mostrando los reportes más recientes
            </p>
          </div>

          <Link 
            href="/publicar" 
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <PlusCircle className="w-5 h-5" />
            Crear Reporte
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border-white/5 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-2">No hay reportes en esta categoría</h3>
            <p className="text-muted mb-6">Sé el primero en publicar un reporte aquí si necesitas ayuda.</p>
            <Link 
              href="/publicar"
              className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Publicar ahora
            </Link>
          </div>
        ) : (
          <FeedClient 
            initialReports={reports} 
            category={category} 
            status={status} 
          />
        )}
      </div>
    </main>
  );
}
