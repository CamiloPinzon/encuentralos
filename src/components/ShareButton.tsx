'use client';

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Si el navegador soporta Web Share API (casi todos los móviles)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        console.log('Error compartiendo:', err);
      }
    } else {
      // Fallback: copiar enlace al portapapeles
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copiando:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 flex-1 bg-slate-50/80 hover:bg-white/10 text-foreground py-3 px-4 rounded-xl font-medium transition-colors border border-slate-200"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 text-emerald-400" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5" />
          <span className="font-bold">Compartir</span>
        </>
      )}
    </button>
  );
}
