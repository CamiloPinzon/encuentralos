'use client';

import { useState } from 'react';

export function InstagramButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const url = `/api/poster/${reportId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al generar la imagen');
      
      const blob = await response.blob();
      const file = new File([blob], `poster-${reportId}.png`, { type: 'image/png' });

      // Verificamos si el navegador soporta compartir archivos nativamente (iOS/Android)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Reporte Encuéntralos',
          text: 'Ayúdame a compartir este reporte.',
        });
      } else {
        // Fallback para escritorio u otros navegadores: forzar la descarga de la imagen
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `poster-${reportId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        
        alert("Póster descargado en tu dispositivo. ¡Ya puedes subirlo a Instagram!");
      }
    } catch (err) {
      console.error('Error al generar el póster:', err);
      alert('Hubo un error al preparar la imagen para compartir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex flex-1 items-center justify-center gap-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
      <span className="font-bold">{loading ? 'Cargando...' : 'Instagram'}</span>
    </button>
  );
}
