import Link from 'next/link';
import { PlusCircle, HandHeart, Search, MapPin, Phone, Mail, User } from 'lucide-react';
import { getClassifieds } from '@/actions/classifieds-actions';

// Forzar la renderización dinámica
export const dynamic = 'force-dynamic';

export default async function ClasificadosPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const typeFilter = params.type;
  
  // Fetch from DB
  const classifieds = await getClassifieds(typeFilter);

  return (
    <div className="min-h-screen pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-brand/10">
            <HandHeart className="w-64 h-64 rotate-12" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                <HandHeart className="w-8 h-8 text-brand" />
                Clasificados de Ayuda
              </h1>
              <p className="mt-3 text-slate-600 max-w-2xl text-lg">
                Un espacio dedicado para conectar a quienes necesitan apoyo con personas, fundaciones u hospitales dispuestos a brindar una mano amiga.
              </p>
            </div>
            
            <Link
              href="/clasificados/publicar"
              className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3.5 rounded-2xl text-base font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-1 w-full md:w-auto"
            >
              <PlusCircle className="w-5 h-5" />
              Publicar Anuncio
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Link 
            href="/clasificados" 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${!typeFilter ? 'bg-brand text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Todos
          </Link>
          <Link 
            href="/clasificados?type=ofrece" 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${typeFilter === 'ofrece' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Ofrecen Ayuda
          </Link>
          <Link 
            href="/clasificados?type=necesita" 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${typeFilter === 'necesita' ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Necesitan Ayuda
          </Link>
        </div>

        {/* Grid List */}
        {classifieds.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No hay clasificados en esta categoría</h3>
            <p className="text-slate-500 mt-2">Sé el primero en publicar una oferta o solicitud de ayuda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classifieds.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col group">
                {item.image_url && (
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${item.type === 'ofrece' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {item.type === 'ofrece' ? 'OFRECE AYUDA' : 'NECESITA AYUDA'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  {!item.image_url && (
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${item.type === 'ofrece' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {item.type === 'ofrece' ? 'OFRECE AYUDA' : 'NECESITA AYUDA'}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{item.title}</h3>
                  <div className="mt-2 text-xs font-medium text-brand bg-brand/10 inline-block px-2 py-1 rounded-lg w-fit">
                    {item.category}
                  </div>
                  
                  <p className="mt-4 text-slate-600 text-sm whitespace-pre-wrap flex-1">{item.description}</p>
                  
                  <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                    {item.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{item.contact_name}</span>
                    </div>
                    {item.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{item.contact_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{item.contact_email}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-slate-400 text-right">
                    Publicado el {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
