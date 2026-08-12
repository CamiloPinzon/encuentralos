'use client';

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
      className="flex flex-1 items-center justify-center gap-2 bg-transparent hover:bg-powder-blue/20 text-warm-ink py-3 px-4 rounded-sm font-medium transition-colors border border-powder-blue disabled:opacity-50"
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
      <span className="hidden sm:inline">{loading ? 'Creando...' : 'Póster Instagram'}</span>
      <span className="sm:hidden">{loading ? '...' : 'Instagram'}</span>
    </button>
  );
}
