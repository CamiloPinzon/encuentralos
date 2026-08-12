import Link from 'next/link';
import { Search, MapPin, HeartHandshake, ArrowRight, User, PawPrint } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Círculos decorativos de fondo para potenciar el efecto glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-5xl mx-auto w-full text-center space-y-12">
        
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-brand/30 text-brand-light text-sm font-medium mb-4 animate-fade-in">
            <HeartHandshake className="w-4 h-4" />
            Plataforma comunitaria de búsqueda
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Reuniendo familias,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-emerald-400">
              una búsqueda a la vez.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed px-2">
            Reporta personas o mascotas perdidas, avistamientos y encuentros. Juntos podemos hacer la diferencia.
          </p>
        </section>

        {/* Acciones principales */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/publicar"
            className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:-translate-y-1"
          >
            Publicar un Reporte
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/recuperar"
            className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/10 text-foreground rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
          >
            Gestionar mis reportes
          </Link>
        </section>

        {/* Grilla de exploración */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 text-left">
          
          {/* Tarjeta Mascotas */}
          <div className="glass p-8 rounded-3xl border border-white/10 hover:border-brand/30 transition-colors group">
            <div className="bg-brand/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PawPrint className="w-7 h-7 text-brand-light" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Mascotas</h2>
            <p className="text-muted mb-6">Busca entre los reportes de mascotas perdidas o encontradas en tu zona.</p>
            <div className="flex flex-col gap-3">
              <Link href="/pet/searching" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2 font-medium text-amber-400"><Search className="w-4 h-4"/> Perdidas</span>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
              <Link href="/pet/found" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2 font-medium text-emerald-400"><MapPin className="w-4 h-4"/> Encontradas</span>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
            </div>
          </div>

          {/* Tarjeta Personas */}
          <div className="glass p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-colors group">
            <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Personas</h2>
            <p className="text-muted mb-6">Ayuda a localizar familiares desaparecidos o reporta un avistamiento.</p>
            <div className="flex flex-col gap-3">
              <Link href="/human/searching" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2 font-medium text-amber-400"><Search className="w-4 h-4"/> Buscadas</span>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
              <Link href="/human/found" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2 font-medium text-emerald-400"><MapPin className="w-4 h-4"/> Encontradas</span>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
