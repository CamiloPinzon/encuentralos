'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, PlusCircle, Search, Heart } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Función para saber si un link está activo
  const isActive = (path: string) => pathname.startsWith(path) && path !== '/' || (pathname === '/' && path === '/');

  const navLinks = [
    { name: 'Mascotas', path: '/pet/searching', icon: <Search className="w-4 h-4" /> },
    { name: 'Personas', path: '/human/searching', icon: <Search className="w-4 h-4" /> },
    { name: 'Adopciones', path: '/pet/adoption', icon: <Heart className="w-4 h-4" /> },
    { name: 'Clasificados', path: '/clasificados', icon: null },
    { name: 'Mis Reportes', path: '/recuperar', icon: null },
    { name: 'Lugares', path: '/lugares', icon: null },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
                  <Image src="/logo.jpg" alt="Encuéntralos" fill className="object-cover" />
                </div>
                <span className="font-extrabold text-xl tracking-tight hidden sm:block text-slate-800">
                  Encuéntralos
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand ${
                    isActive(link.path) ? 'text-brand' : 'text-muted'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Action & Social */}
            <div className="hidden md:flex items-center gap-4">
              <a 
                href="https://www.instagram.com/encuentralos.app?utm_source=qr&igsh=Mnk2bjJrZ213cm83" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-pink-300 bg-white hover:bg-pink-50 text-slate-700 hover:text-pink-600 transition-all shadow-sm hover:shadow-md"
                aria-label="Síguenos en Instagram"
              >
                <InstagramIcon className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-bold hidden lg:block">Instagram</span>
              </a>
              <Link
                href="/publicar"
                className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                Publicar Reporte
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-4">
              <Link
                href="/publicar"
                className="flex items-center justify-center bg-brand text-white w-9 h-9 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                aria-label="Publicar Reporte"
              >
                <PlusCircle className="w-5 h-5" />
              </Link>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-muted hover:text-slate-900 p-2 focus:outline-none bg-slate-100 rounded-lg"
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
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm mt-16 animate-fade-in">
          <div className="bg-card/90 border-b border-slate-200 shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand/10 text-brand'
                      : 'text-muted hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-2 border-t border-slate-200">
                <Link
                  href="/publicar"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-hover text-white px-5 py-3.5 rounded-2xl text-base font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Publicar un Reporte
                </Link>
                <div className="pt-4 flex justify-center">
                  <a 
                    href="https://www.instagram.com/encuentralos.app?utm_source=qr&igsh=Mnk2bjJrZ213cm83" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90"
                    aria-label="Síguenos en Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                    <span>Síguenos en Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
