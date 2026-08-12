'use client';

import { Instagram } from 'lucide-react';
import { useState } from 'react';

export function InstagramButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Intentamos abrir el póster en una nueva pestaña (funciona mejor en móviles)
      window.open(`/api/poster/${reportId}`, '_blank');
    } catch (err) {
      console.error('Error al generar el póster:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex flex-1 items-center justify-center gap-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
    >
      <Instagram className="w-5 h-5" />
      <span className="hidden sm:inline">{loading ? 'Creando...' : 'Póster Instagram'}</span>
      <span className="sm:hidden">{loading ? '...' : 'Instagram'}</span>
    </button>
  );
}
