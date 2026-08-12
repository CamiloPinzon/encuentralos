import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Report } from '@/types';

// Colores vibrantes acordes al diseño moderno de la web
const getStatusColors = (status: string) => {
  switch (status) {
    case 'searching':
      return { border: 'rgba(251, 191, 36, 0.5)', text: '#FBBF24', label: 'SE BUSCA' }; // amber-400
    case 'found':
      return { border: 'rgba(52, 211, 153, 0.5)', text: '#34D399', label: 'ENCONTRADO' }; // emerald-400
    case 'spotted':
      return { border: 'rgba(96, 165, 250, 0.5)', text: '#60A5FA', label: 'AVISTADO' }; // blue-400
    case 'resolved':
      return { border: 'rgba(167, 139, 250, 0.5)', text: '#A78BFA', label: 'RESUELTO' }; // brand-light
    default:
      return { border: 'rgba(209, 213, 219, 0.5)', text: '#D1D5DB', label: 'REPORTE' }; // gray-300
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
            backgroundColor: '#09090b',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Fondo desenfocado usando la misma imagen si existe */}
          {report.image_url && (
            <img
              src={report.image_url}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.3,
              }}
            />
          )}

          {/* Gradiente principal oscuro (fallback seguro para Satori) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
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
            }}
          >
            {/* Cabecera / Estado */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderStyle: 'solid',
                borderWidth: '4px',
                borderColor: statusInfo.border,
                color: statusInfo.text,
                padding: '16px 60px',
                borderRadius: '100px',
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: '0.15em',
                marginBottom: '40px',
              }}
            >
              {`¡${statusInfo.label}!`}
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
                  borderStyle: 'solid',
                  borderWidth: '8px',
                  borderColor: 'rgba(255,255,255,0.1)',
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
                  borderStyle: 'solid',
                  borderWidth: '8px',
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                📷
              </div>
            )}

            {/* Título */}
            <h1
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                marginTop: '40px',
                marginBottom: '20px',
                lineHeight: 1.2,
                maxWidth: '900px',
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
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '20px 40px',
                  borderRadius: '20px',
                  fontSize: 32,
                  color: '#e4e4e7',
                  fontWeight: 600,
                }}
              >
                {`📞 Contacto: ${report.contact_phone || 'Por la app'}`}
              </div>
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
