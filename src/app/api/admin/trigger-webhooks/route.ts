import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const webhookUrl = process.env.INSTAGRAM_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
  }

  const supabase = createClient();
  
  // Fetch active reports (searching or spotted)
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['searching', 'spotted'])
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos.camilopinzon.com';
  
  const results = [];
  
  for (const report of reports || []) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: report.title,
          description: report.description,
          image_url: report.image_url || 'https://via.placeholder.com/300?text=Sin+Imagen',
          category: report.category,
          status: report.status,
          location: report.municipality && report.department ? `${report.municipality}, ${report.department}` : 'Ubicación seleccionada en el mapa',
          link: `${baseUrl}/${report.category}/${report.status}/${report.id}`
        })
      });
      
      results.push({ id: report.id, status: response.status });
      
      // Add a small delay to avoid rate limiting on Zapier/Make
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err: any) {
      results.push({ id: report.id, error: err.message });
    }
  }

  return NextResponse.json({ 
    success: true, 
    processed: results.length,
    results 
  });
}
