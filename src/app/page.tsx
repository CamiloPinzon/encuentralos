import Link from 'next/link';
import { Search, MapPin, ArrowRight, User, PawPrint } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-8 bg-paper-white relative">
      <div className="max-w-[1200px] mx-auto w-full text-center space-y-16 py-12">
        
        {/* Hero Section */}
        <section className="space-y-8">
          <div className="inline-flex items-center px-4 py-2 border border-powder-blue rounded-sm text-mist-gray text-xs font-light tracking-wide uppercase">
            Plataforma comunitaria de búsqueda
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-warm-ink leading-tight max-w-4xl mx-auto">
            Reuniendo familias, una búsqueda a la vez.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-mist-gray max-w-2xl mx-auto font-light leading-relaxed px-2">
            Reporta personas o mascotas perdidas, avistamientos y encuentros. Juntos podemos hacer la diferencia.
          </p>
        </section>

        {/* Acciones principales */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <Link 
            href="/publicar"
            className="w-full sm:w-auto px-8 py-4 bg-slate-bloom hover:opacity-90 text-white rounded-full font-medium text-sm transition-opacity flex items-center justify-center gap-2"
          >
            Publicar un Reporte
          </Link>
          <Link 
            href="/recuperar"
            className="w-full sm:w-auto px-8 py-4 border border-powder-blue hover:border-warm-ink text-warm-ink rounded-sm font-medium text-sm transition-colors flex items-center justify-center gap-2 bg-transparent"
          >
            Gestionar mis reportes
          </Link>
        </section>

        {/* Grilla de exploración */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 text-left border-t border-powder-blue">
          
          {/* Tarjeta Mascotas */}
          <div className="bg-paper-white p-8 rounded-sm border border-warm-ink transition-opacity hover:opacity-80 group">
            <div className="mb-8 border border-powder-blue w-12 h-12 flex items-center justify-center rounded-sm text-warm-ink">
              <PawPrint className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-light text-warm-ink mb-3">Mascotas</h2>
            <p className="text-mist-gray font-light mb-8">Busca entre los reportes de mascotas perdidas o encontradas en tu zona.</p>
            <div className="flex flex-col gap-4 border-t border-powder-blue pt-4">
              <Link href="/pet/searching" className="flex items-center justify-between text-warm-ink hover:text-slate-bloom transition-colors font-light">
                <span className="flex items-center gap-2"><Search className="w-4 h-4"/> Perdidas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pet/found" className="flex items-center justify-between text-warm-ink hover:text-slate-bloom transition-colors font-light">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Encontradas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tarjeta Personas */}
          <div className="bg-paper-white p-8 rounded-sm border border-warm-ink transition-opacity hover:opacity-80 group">
            <div className="mb-8 border border-powder-blue w-12 h-12 flex items-center justify-center rounded-sm text-warm-ink">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-light text-warm-ink mb-3">Personas</h2>
            <p className="text-mist-gray font-light mb-8">Ayuda a localizar familiares desaparecidos o reporta un avistamiento.</p>
            <div className="flex flex-col gap-4 border-t border-powder-blue pt-4">
              <Link href="/human/searching" className="flex items-center justify-between text-warm-ink hover:text-slate-bloom transition-colors font-light">
                <span className="flex items-center gap-2"><Search className="w-4 h-4"/> Buscadas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/human/found" className="flex items-center justify-between text-warm-ink hover:text-slate-bloom transition-colors font-light">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Encontradas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
