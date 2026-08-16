import Link from 'next/link';
import { 
  Search, MapPin, HeartHandshake, ArrowRight, User, 
  PawPrint, Heart, Printer, Map, MessageCircle 
} from 'lucide-react';

const InstagramIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start py-12 px-4 sm:px-8 relative overflow-hidden">
      
      {/* Círculos decorativos de fondo para potenciar el efecto glassmorphism */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-0 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-6xl mx-auto w-full text-center space-y-20">
        
        {/* 1. Hero Section */}
        <section className="space-y-8 max-w-4xl mx-auto mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-brand/30 text-brand-light text-sm font-medium mb-2 animate-fade-in">
            <HeartHandshake className="w-4 h-4" />
            Red comunitaria de búsqueda y ayuda
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            No estás solo en la búsqueda. La comunidad te ayuda a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-emerald-400">encontrarlos.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted leading-relaxed px-4">
            Reporta mascotas o personas desaparecidas en segundos. Generamos tus carteles automáticamente y facilitamos la difusión masiva en redes sociales.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/publicar"
              className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:-translate-y-1"
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
          </div>
        </section>

        {/* 2. Sección de Funcionalidades */}
        <section className="text-left space-y-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Herramientas diseñadas para la rapidez</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Cuando cada minuto cuenta, nuestra tecnología hace el trabajo pesado por ti.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-8 rounded-3xl border border-slate-200 hover:border-brand/30 transition-all hover:-translate-y-1">
              <div className="bg-brand/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-brand">
                <Printer className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Carteles Inteligentes</h3>
              <p className="text-muted leading-relaxed">Olvídate de editar imágenes. Generamos automáticamente pósters listos para Instagram Stories y WhatsApp con un solo clic, incluyendo códigos QR.</p>
            </div>

            <div className="glass p-8 rounded-3xl border border-slate-200 hover:border-emerald-500/30 transition-all hover:-translate-y-1">
              <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                <Map className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Mapeo Exacto</h3>
              <p className="text-muted leading-relaxed">Visualiza el lugar exacto de extravío o avistamiento en mapas interactivos para organizar rutas de búsqueda eficientes en tu comunidad.</p>
            </div>

            <div className="glass p-8 rounded-3xl border border-slate-200 hover:border-pink-500/30 transition-all hover:-translate-y-1">
              <div className="bg-pink-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Contacto Inmediato</h3>
              <p className="text-muted leading-relaxed">Conecta directamente por WhatsApp o llamada con quien haya visto a tu ser querido, sin intermediarios ni registros que retrasen la ayuda.</p>
            </div>
          </div>
        </section>

        {/* 3. Mega Banner de Comunidad (Instagram) - CRÍTICO */}
        <section className="w-full">
          <a 
            href="https://www.instagram.com/encuentralos.app?utm_source=qr&igsh=Mnk2bjJrZ213cm83"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-2xl group transition-all hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] hover:-translate-y-1"
          >
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            <div className="relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
              
              <div className="text-left space-y-6 flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-pink-300 text-sm font-bold border border-white/10 uppercase tracking-widest">
                  <InstagramIcon className="w-4 h-4" /> La red que salva vidas
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                  Cada seguidor es <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
                    un par de ojos más buscando.
                  </span>
                </h2>
                <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                  El éxito de Encuéntralos depende de cuántos seamos. Al unirte a nuestra cuenta de Instagram, te conviertes en una pieza clave de nuestra red de alerta temprana. <strong>Tu follow literalmente ayuda a reunir familias.</strong>
                </p>
                
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                  <InstagramIcon className="w-6 h-6" />
                  Seguir a @encuentralos.app
                </div>
              </div>

              {/* Elemento visual a la derecha */}
              <div className="hidden lg:flex w-64 h-64 shrink-0 bg-white/5 rounded-full border border-white/10 items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full animate-pulse blur-xl opacity-50"></div>
                <InstagramIcon className="w-24 h-24 text-white relative z-10" />
              </div>
              
            </div>
          </a>
        </section>

        {/* 4. Grilla de exploración (Mascotas y Personas) */}
        <section className="text-left space-y-8 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explora los reportes activos</h2>
            <p className="text-muted text-lg">Navega por las alertas recientes en tu comunidad y ofrece tu ayuda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tarjeta Mascotas */}
            <div className="glass p-8 rounded-3xl border border-slate-200 hover:border-brand/30 transition-colors group">
              <div className="bg-brand/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PawPrint className="w-7 h-7 text-brand-light" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Mascotas</h3>
              <p className="text-muted mb-6">Busca entre los reportes de mascotas perdidas o encontradas en tu zona.</p>
              <div className="flex flex-col gap-3">
                <Link href="/pet/searching" className="flex items-center justify-between p-4 rounded-xl glass-active hover:bg-slate-50/80 transition-colors group/link">
                  <span className="flex items-center gap-3 font-bold text-amber-500"><Search className="w-5 h-5"/> Mascotas Perdidas</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover/link:text-amber-500 transition-colors" />
                </Link>
                <Link href="/pet/found" className="flex items-center justify-between p-4 rounded-xl glass-active hover:bg-slate-50/80 transition-colors group/link">
                  <span className="flex items-center gap-3 font-bold text-emerald-500"><MapPin className="w-5 h-5"/> Mascotas Encontradas</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover/link:text-emerald-500 transition-colors" />
                </Link>
                <Link href="/pet/adoption" className="flex items-center justify-between p-4 rounded-xl glass-active hover:bg-slate-50/80 transition-colors group/link">
                  <span className="flex items-center gap-3 font-bold text-pink-500"><Heart className="w-5 h-5"/> En Adopción</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover/link:text-pink-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Tarjeta Personas */}
            <div className="glass p-8 rounded-3xl border border-slate-200 hover:border-emerald-500/30 transition-colors group">
              <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Personas</h3>
              <p className="text-muted mb-6">Ayuda a localizar familiares desaparecidos o reporta un avistamiento urgente.</p>
              <div className="flex flex-col gap-3">
                <Link href="/human/searching" className="flex items-center justify-between p-4 rounded-xl glass-active hover:bg-slate-50/80 transition-colors group/link">
                  <span className="flex items-center gap-3 font-bold text-amber-500"><Search className="w-5 h-5"/> Personas Buscadas</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover/link:text-amber-500 transition-colors" />
                </Link>
                <Link href="/human/found" className="flex items-center justify-between p-4 rounded-xl glass-active hover:bg-slate-50/80 transition-colors group/link">
                  <span className="flex items-center gap-3 font-bold text-emerald-500"><MapPin className="w-5 h-5"/> Personas Encontradas</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover/link:text-emerald-500 transition-colors" />
                </Link>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
