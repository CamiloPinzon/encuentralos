'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Image as ImageIcon, CheckCircle2, ArrowLeft, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createClassified } from '@/actions/classifieds-actions';

const CATEGORIES = [
  "Voluntariado",
  "Donaciones",
  "Refugio Temporal",
  "Refugio de Animales",
  "Asistencia Médica",
  "Transporte",
  "Alimentos",
  "Otro"
];

export default function PublicarClasificadoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createClassified(formData);
      
      if (!result.success) {
        setError(result.error || 'Ocurrió un error al publicar el anuncio');
      } else {
        setSuccess(true);
        // Esperar un momento antes de redirigir para que el usuario vea el éxito
        setTimeout(() => {
          router.push('/clasificados');
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Anuncio Publicado!</h2>
          <p className="text-slate-600">
            Tu clasificado se ha publicado exitosamente y estará visible para todos.
          </p>
          <p className="text-sm text-slate-500">Redirigiendo a clasificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <Link href="/clasificados" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Clasificados
        </Link>

        <div className="glass rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Publicar Clasificado de Ayuda
          </h1>
          <p className="mt-2 text-slate-600">
            Llena el formulario para ofrecer o solicitar ayuda.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-8">
          
          {/* Tipo y Categoría */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm">1</span>
              ¿Qué necesitas publicar?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tipo de Anuncio <span className="text-red-500">*</span></label>
                <select name="type" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all">
                  <option value="">Selecciona una opción</option>
                  <option value="ofrece">Ofrezco ayuda / servicio</option>
                  <option value="necesita">Necesito ayuda / servicio</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Categoría <span className="text-red-500">*</span></label>
                <select name="category" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all">
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Detalles */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm">2</span>
              Detalles del Anuncio
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Título Corto <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  maxLength={100}
                  placeholder="Ej: Voluntarios para refugio de mascotas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Descripción <span className="text-red-500">*</span></label>
                <textarea 
                  name="description" 
                  required 
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe detalladamente qué se ofrece o se necesita..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Datos de Contacto */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm">3</span>
              Información de Contacto
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nombre o Entidad <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="contact_name" 
                  required 
                  maxLength={100}
                  placeholder="Tu nombre, fundación, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Correo Electrónico <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="contact_email" 
                  required 
                  maxLength={100}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Teléfono (Opcional)</label>
                <input 
                  type="tel" 
                  name="contact_phone" 
                  maxLength={50}
                  placeholder="+57 300 000 0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Perfil de Instagram (Opcional)</label>
                <input 
                  type="text" 
                  name="instagram_profile" 
                  maxLength={50}
                  placeholder="@usuario"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Ubicación / Ciudad (Opcional)</label>
                <input 
                  type="text" 
                  name="location" 
                  maxLength={100}
                  placeholder="Bogotá, Localidad, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
            </div>
          </div>


          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand hover:bg-brand-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <PlusCircle className="w-6 h-6" />
                  Publicar Anuncio
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
