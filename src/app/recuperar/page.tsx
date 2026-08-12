'use client';

import { useState } from 'react';
import { recoverManagementLinks } from '@/actions/report-actions';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const result = await recoverManagementLinks(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al intentar enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-8">
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-brand-light" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Recuperar Enlaces
          </h1>
          <p className="text-muted text-lg">
            Si perdiste el enlace secreto para editar tu reporte, ingresa tu correo y te lo enviaremos nuevamente.
          </p>
        </div>

        {success ? (
          <div className="glass p-8 rounded-3xl border border-emerald-500/30 text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-emerald-400">¡Revisa tu bandeja!</h2>
            <p className="text-muted">
              Si el correo está asociado a algún reporte activo, recibirás un mensaje con tus enlaces de gestión en los próximos minutos.
            </p>
            <Link 
              href="/"
              className="inline-block mt-4 text-brand hover:underline font-medium"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="glass p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Correo electrónico registrado</label>
              <input 
                type="email" 
                name="email"
                required
                placeholder="ejemplo@correo.com"
                className="w-full px-5 py-4 rounded-xl input-glass text-foreground text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Enviar enlaces de recuperación
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
