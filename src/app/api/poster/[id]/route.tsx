import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Report } from '@/types';

export const runtime = 'edge';

// Colores por estado
const getStatusColors = (status: string) => {
  switch (status) {
    case 'searching':
      return { bg: '#b45309', text: '#fcd34d', label: 'SE BUSCA' }; // amber
    case 'found':
      return { bg: '#047857', text: '#6ee7b7', label: 'ENCONTRADO' }; // emerald
    case 'spotted':
      return { bg: '#1d4ed8', text: '#93c5fd', label: 'AVISTADO' }; // blue
    case 'resolved':
      return { bg: '#6d28d9', text: '#c4b5fd', label: 'RESUELTO' }; // brand
    default:
      return { bg: '#374151', text: '#d1d5db', label: 'REPORTE' }; // gray
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Hacemos la consulta a Supabase directamente para evitar importar 
    // report-actions.ts (el cual importa Cloudinary y rompe el Edge Runtime)
    const supabase = createClient();
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) {
      return new Response('Not found', { status: 404 });
    }

    const statusInfo = getStatusColors(report.status);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#09090b', // zinc-950
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Gradiente principal oscuro (usaremos un div sólido con transparencia como fallback seguro para Satori) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(9, 9, 11, 0.7)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              padding: '60px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Cabecera / Estado */}
            <div
              style={{
                backgroundColor: statusInfo.bg,
                color: statusInfo.text,
                padding: '20px 60px',
                borderRadius: '100px',
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                marginBottom: '40px',
              }}
            >
              ¡{statusInfo.label}!
            </div>

            {/* Imagen Principal */}
            {report.image_url ? (
              <div
                style={{
                  display: 'flex',
                  width: '600px',
                  height: '600px',
                  borderRadius: '40px',
                  overflow: 'hidden',
                  border: '8px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                }}
              >
                <img
                  src={report.image_url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: '600px',
                  height: '600px',
                  borderRadius: '40px',
                  backgroundColor: '#27272a',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 100,
                  color: '#52525b',
                  border: '8px solid rgba(255,255,255,0.05)',
                }}
              >
                📷
              </div>
            )}

            {/* Título */}
            <h1
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                margin: '40px 0 20px 0',
                lineHeight: 1.2,
                maxWidth: '900px',
                textShadow: '0 4px 10px rgba(0,0,0,0.5)',
              }}
            >
              {report.title.length > 50 ? report.title.substring(0, 50) + '...' : report.title}
            </h1>

            {/* Información de Contacto / Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginTop: 'auto',
                gap: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '20px 40px',
                  borderRadius: '20px',
                  fontSize: 32,
                  color: '#e4e4e7',
                  fontWeight: 600,
                }}
              >
                📞 Contacto: {report.contact_phone || 'Por la app'}
              </div>
            </div>

            {/* Brand Logo o Texto */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                display: 'flex',
                fontSize: 24,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              ENCUÉNTRALOS.COM
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (e: any) {
    console.error('Error in ImageResponse:', e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
