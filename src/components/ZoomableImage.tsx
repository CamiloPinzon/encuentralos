'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Imagen Principal */}
      <div 
        className="relative w-full h-[50vh] md:h-full min-h-[400px] cursor-zoom-in group"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/70 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 bg-black/60 p-3 rounded-full backdrop-blur-md transform scale-90 group-hover:scale-100 transition-all">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Modal de Pantalla Completa */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            aria-label="Cerrar imagen"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  );
}
