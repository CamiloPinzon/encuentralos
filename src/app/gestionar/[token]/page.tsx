'use client';

import { useState, use, useEffect } from 'react';
import { getReportByToken, updateReportStatus, deleteReport } from '@/actions/report-actions';
import { Report } from '@/types';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Trash2, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function GestionarPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getReportByToken(token).then(data => {
      setReport(data as Report);
      setLoading(false);
    });
  }, [token]);

  const handleResolve = async () => {
    if (!confirm('¿Estás seguro de que quieres marcar este caso como RESUELTO?')) return;
    setActionLoading(true);
    try {
      await updateReportStatus(token, 'resolved');
      router.push(`/${report?.category}/resolved/${report?.id}`);
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás SEGURO de querer ELIMINAR definitivamente este reporte? Esta acción no se puede deshacer.')) return;
    setActionLoading(true);
    try {
      await deleteReport(token);
      alert('Reporte eliminado correctamente');
      router.push('/');
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

  if (!report) {
    return (
      <main className="min-h-screen py-20 px-4 text-center flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-3xl font-bold">Token Invalido</h1>
        <p className="text-muted">Este enlace de gestión no es válido o el reporte ya fue eliminado.</p>
        <Link href="/" className="text-brand hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Gestión de Reporte</h1>
          <p className="text-muted">Administra el estado de tu publicación de forma segura.</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 text-left shadow-2xl">
          <div className="space-y-2 pb-6 border-b border-white/5">
            <h2 className="text-2xl font-bold">{report.title}</h2>
            <p className="text-muted text-sm line-clamp-2">{report.description}</p>
            <div className="pt-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                Estado Actual: <span className="text-brand-light">{report.status}</span>
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResolve}
              disabled={actionLoading || report.status === 'resolved'}
              className="w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Marcar como Resuelto
              </span>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                Finaliza la búsqueda exitosamente
              </span>
            </button>

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
                Borrar de la base de datos
              </span>
            </button>
          </div>
          
          <div className="pt-4 flex justify-center">
             <Link href={`/${report.category}/${report.status}/${report.id}`} className="text-sm text-brand hover:underline">
               Ver reporte público
             </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
