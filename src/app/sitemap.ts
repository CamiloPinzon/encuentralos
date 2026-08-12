import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos-seven.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Obtener todos los reportes activos
  const { data: reports } = await supabase
    .from('reports')
    .select('id, category, status, created_at')
    .order('created_at', { ascending: false });

  // Rutas estáticas principales
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${SITE_URL}/publicar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Rutas dinámicas de los reportes
  if (reports) {
    const reportRoutes: MetadataRoute.Sitemap = reports.map((report) => ({
      url: `${SITE_URL}/${report.category}/${report.status}/${report.id}`,
      lastModified: new Date(report.created_at),
      changeFrequency: 'daily',
      priority: 0.7,
    }));
    
    routes.push(...reportRoutes);
  }

  return routes;
}
