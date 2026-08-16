'use client';

import { useRef, useState, useEffect } from 'react';
import { Report } from '@/types';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FlyerModalProps {
  report: Report;
  onClose: () => void;
}

export function FlyerModal({ report, onClose }: FlyerModalProps) {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    setReportUrl(window.location.href);
  }, []);

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    
    try {
      setIsGenerating(true);
      
      // Esperamos un momento para asegurar que las fuentes/imágenes estén cargadas
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(flyerRef.current, { 
        quality: 1.0, 
        pixelRatio: 2, // Alta resolución
        style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement('a');
      link.download = `cartel-${report.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generando el cartel:', err);
      alert('Hubo un error al generar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isMissing = report.status === 'searching';
  const isAdoption = report.status === 'adoption';
  const headerColor = isMissing ? 'bg-red-600' : isAdoption ? 'bg-pink-600' : 'bg-emerald-600';
  const headerText = isMissing ? '¡SE BUSCA!' : isAdoption ? '¡EN ADOPCIÓN!' : '¡ENCONTRADO!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[95vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Previsualización del Cartel</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenedor scrolleable del cartel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-800/50">
          
          {/* EL CARTEL (Ancho fijo para que la imagen se genere consistente) */}
          <div 
            ref={flyerRef}
            className="bg-white w-[400px] shrink-0 text-black p-0 overflow-hidden flex flex-col shadow-xl border border-slate-200"
            style={{ fontFamily: 'sans-serif' }}
          >
            {/* Header del Cartel */}
            <div className={`${headerColor} w-full py-5 text-center`}>
              <h1 className="text-5xl font-black text-white tracking-widest uppercase m-0 leading-none">
                {headerText}
              </h1>
            </div>

            <div className="p-6 flex flex-col gap-4 items-center text-center">
              {/* Título */}
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight uppercase">
                {report.title}
              </h2>

              {/* Foto */}
              {report.image_url && report.image_url !== 'https://via.placeholder.com/300?text=Sin+Imagen' ? (
                <div className="w-full aspect-square relative bg-slate-100 rounded-xl overflow-hidden border-4 border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={report.image_url} 
                    alt={report.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-slate-100 flex items-center justify-center rounded-xl border-4 border-slate-200">
                  <span className="text-slate-400 font-bold">Sin fotografía</span>
                </div>
              )}

              {/* Descripción */}
              <div className="w-full border-t-2 border-b-2 border-slate-200 py-4 my-2">
                <p className="text-base font-medium text-slate-700 leading-relaxed text-left whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {/* Contacto y QR */}
              <div className="w-full flex items-center justify-between gap-4 mt-2">
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-red-600 uppercase mb-1">¡Ayúdanos a encontrarlo!</p>
                  <p className="text-sm font-bold text-slate-900">Contacto:</p>
                  {report.contact_phone && (
                    <p className="text-xl font-black text-slate-900">{report.contact_phone}</p>
                  )}
                  <p className="text-sm font-semibold text-slate-700">{report.contact_email}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Reportado el {format(new Date(report.created_at), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
                
                {reportUrl && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 bg-white border-2 border-slate-200 rounded-lg">
                      <QRCodeSVG value={reportUrl} size={90} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Escanear</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer del Cartel */}
            <div className="bg-slate-900 w-full py-3 text-center mt-auto">
              <p className="text-xs font-bold text-white tracking-widest">
                ENCUENTRALOS.APP
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
          <button 
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            disabled={isGenerating}
          >
            Cancelar
          </button>
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Descargar Cartel
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
