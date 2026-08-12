'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path) && path !== '/' || (pathname === '/' && path === '/');

  const navLinks = [
    { name: 'Mascotas', path: '/pet/searching' },
    { name: 'Personas', path: '/human/searching' },
    { name: 'Mis Reportes', path: '/recuperar' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-paper-white/90 backdrop-blur-md border-b border-powder-blue">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-light text-2xl tracking-tight text-warm-ink uppercase">
                  Encuéntralos
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-light transition-colors relative pb-1 ${
                    isActive(link.path) 
                      ? 'text-warm-ink border-b border-slate-bloom' 
                      : 'text-mist-gray hover:text-warm-ink'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Action */}
            <div className="hidden md:flex items-center">
              <Link
                href="/publicar"
                className="bg-slate-bloom hover:opacity-90 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-opacity"
              >
                Publicar Reporte
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-4">
              <Link
                href="/publicar"
                className="flex items-center justify-center bg-slate-bloom text-white px-4 py-1.5 rounded-full text-xs font-medium"
                aria-label="Publicar Reporte"
              >
                Publicar
              </Link>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-warm-ink p-2 focus:outline-none"
                aria-label="Menú principal"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-paper-white mt-16 animate-fade-in overflow-y-auto">
          <div className="px-6 pt-8 pb-12 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block text-2xl font-light transition-colors ${
                  isActive(link.path)
                    ? 'text-warm-ink'
                    : 'text-mist-gray hover:text-warm-ink'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-8 mt-8 border-t border-powder-blue">
              <Link
                href="/publicar"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full bg-slate-bloom hover:opacity-90 text-white px-5 py-4 rounded-full text-base font-medium transition-opacity"
              >
                Publicar un Reporte
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
