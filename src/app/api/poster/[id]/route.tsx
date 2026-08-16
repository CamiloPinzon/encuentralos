import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';


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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.image_url}
              alt="Fondo desenfocado"
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
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              padding: '100px 60px',
              position: 'relative',
            }}
          >
            {/* Cabecera / Estado */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderStyle: 'solid',
                borderWidth: '6px',
                borderColor: statusInfo.border,
                color: statusInfo.text,
                padding: '24px 80px',
                borderRadius: '100px',
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: '0.15em',
                marginBottom: '80px',
              }}
            >
              {`¡${statusInfo.label}!`}
            </div>

            {/* Imagen Principal */}
            {report.image_url ? (
              <div
                style={{
                  display: 'flex',
                  width: '850px',
                  height: '850px',
                  borderRadius: '60px',
                  overflow: 'hidden',
                  borderStyle: 'solid',
                  borderWidth: '12px',
                  borderColor: 'rgba(255,255,255,0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.image_url}
                  alt={report.title}
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
                  width: '850px',
                  height: '850px',
                  borderRadius: '60px',
                  backgroundColor: '#27272a',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 150,
                  color: '#52525b',
                  borderStyle: 'solid',
                  borderWidth: '12px',
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
                fontSize: 80,
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                marginTop: '80px',
                marginBottom: '30px',
                lineHeight: 1.1,
                maxWidth: '900px',
                textShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }}
            >
              {report.title.length > 50 ? report.title.substring(0, 50) + '...' : report.title}
            </h1>

            {/* Descripción */}
            {report.description && (
              <p
                style={{
                  display: 'flex',
                  fontSize: 36,
                  color: '#d4d4d8',
                  textAlign: 'center',
                  maxWidth: '900px',
                  lineHeight: 1.4,
                  marginBottom: '60px',
                }}
              >
                {report.description.length > 150 ? report.description.substring(0, 150) + '...' : report.description}
              </p>
            )}

            {/* Información de Contacto / Footer */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginTop: 'auto',
                gap: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '30px 60px',
                  borderRadius: '30px',
                  fontSize: 56,
                  color: '#ffffff',
                  fontWeight: 900,
                  borderStyle: 'solid',
                  borderWidth: '4px',
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                {report.contact_phone ? `📞 ${report.contact_phone}` : '📩 Contacto vía Email'}
              </div>
              
              {report.contact_email && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    color: '#a1a1aa',
                    fontWeight: 600,
                  }}
                >
                  {report.contact_email}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  marginTop: '40px',
                  fontSize: 24,
                  color: '#71717a',
                  fontWeight: 'bold',
                  letterSpacing: '0.1em'
                }}
              >
                ENCUENTRALOS.APP
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      }
    );
  } catch (e: unknown) {
    console.error('Error in ImageResponse:', e);
    const error = e as Error;
    return new Response(`Failed to generate the image: ${error.message}`, {
      status: 500,
    });
  }
}
