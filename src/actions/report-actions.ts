'use server'

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';
import { v2 as cloudinary } from 'cloudinary';
import { Resend } from 'resend';

// La configuración de Cloudinary se toma automáticamente de la variable de entorno CLOUDINARY_URL
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Server Action para crear un nuevo reporte.
 * Recibe FormData y se asume que la subida de imágenes a Cloudinary (unsigned) 
 * ya se realizó en el cliente, enviando la URL de la imagen en este form.
 */
export async function createReport(formData: FormData) {
  const category = formData.get('category') as string;
  const status = formData.get('status') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const contact_email = formData.get('contact_email') as string;
  const contact_phone = formData.get('contact_phone') as string;
  const instagram_profile = formData.get('instagram_profile') as string;
  const latitude = formData.get('latitude') as string;
  const longitude = formData.get('longitude') as string;
  const imageFile = formData.get('image') as File | null;
  const department = formData.get('department') as string;
  const municipality = formData.get('municipality') as string;
  const featuresText = formData.get('features_text') as string;
  const featuresEmbeddingStr = formData.get('features_embedding') as string;

  
  if (!contact_email) {
    return { success: false, error: 'El email de contacto es obligatorio' };
  }

  // Basic length validations (Risk Medium)
  if (title && title.length > 100) return { success: false, error: 'El título no puede exceder 100 caracteres' };
  if (description && description.length > 2000) return { success: false, error: 'La descripción no puede exceder 2000 caracteres' };
  if (contact_email.length > 100) return { success: false, error: 'Email inválido' };
  if (contact_phone && contact_phone.length > 50) return { success: false, error: 'Teléfono inválido' };

  let imageUrl = null;

  if (imageFile && imageFile.size > 0) {
    // Unrestricted File Upload validation (Risk High)
    if (!imageFile.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen válida (jpg, png, webp, etc).' };
    }
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      return { success: false, error: 'La imagen no puede pesar más de 5MB.' };
    }

    // Convertimos el archivo a base64 para subirlo a Cloudinary usando el SDK de Node
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imageFile.type;
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    // --- MODERACIÓN DE IMAGEN CON GEMINI ---
    const { moderateImage } = await import('@/utils/gemini-moderator');
    const moderation = await moderateImage(base64Data, mimeType);
    
    if (!moderation.isSafe) {
      return { success: false, error: 'Imagen rechazada por políticas comunitarias: ' + moderation.reason };
    }
    // ----------------------------------------

    try {
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: 'encuentralos_reports',
      });
      imageUrl = uploadResult.secure_url;
    } catch (err: any) {
      return { success: false, error: 'Error al subir imagen a Cloudinary: ' + err.message };
    }

    // Si no vienen features del frontend (ej. no pasó por el check de matches) y es imagen,
    // extraemos características y generamos embedding para TODOS los reportes que tengan imagen.
    if (!featuresText || !featuresEmbeddingStr) {
       try {
           const { extractFeaturesAndEmbed } = await import('@/utils/gemini-features');
           const extraction = await extractFeaturesAndEmbed(base64Data, mimeType, category);
           if (extraction) {
               formData.set('features_text', extraction.features);
               formData.set('features_embedding', JSON.stringify(extraction.embedding));
           }
       } catch (extractErr) {
           console.error("Error extrayendo features en createReport:", extractErr);
           // No bloqueamos la creación del reporte por esto
       }
    }
  }

  const finalFeaturesText = formData.get('features_text') as string;
  const finalFeaturesEmbeddingStr = formData.get('features_embedding') as string;
  let finalEmbedding = null;
  if (finalFeaturesEmbeddingStr) {
      try {
          finalEmbedding = `[${JSON.parse(finalFeaturesEmbeddingStr).join(',')}]`;
      } catch (e) {
          console.error("Error parsing embedding:", e);
      }
  }

  // Generamos el token de edición único
  const editToken = uuidv4();

  // Inicializar Supabase Client
  const supabase = createClient();

  // Inserción en Base de Datos
  const { data, error } = await supabase
    .from('reports')
    .insert([
      {
        category,
        subject_category: category,
        status,
        status_type: status,
        title,
        description,
        contact_email,
        contact_name: 'Usuario', // Legacy column
        contact_phone: contact_phone || 'No proporcionado',
        instagram_profile: instagram_profile ? instagram_profile.replace('@', '') : null,
        image_url: imageUrl || 'https://via.placeholder.com/300?text=Sin+Imagen',
        edit_token: editToken,
        edit_token_hash: editToken, // Legacy column
        location: municipality && department ? `${municipality}, ${department}` : 'Ubicación seleccionada en el mapa', // Legacy column
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        features_text: finalFeaturesText || null,
        features_embedding: finalEmbedding || null
      }
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Error al guardar el reporte: ' + error.message };
  }

  // Enviar correo con el enlace de edición
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos-seven.vercel.app';
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: contact_email,
      subject: 'Gestiona tu reporte en Encuéntralos',
      html: `
        <h2>¡Tu reporte ha sido publicado!</h2>
        <p>Hola, has publicado un reporte titulado: <strong>${title}</strong></p>
        <p>Para editarlo, cambiar su estado (ej. de Perdido a Encontrado) o eliminarlo, haz clic en el siguiente enlace único:</p>
        <p><a href="${baseUrl}/gestionar/${editToken}" style="display:inline-block;padding:10px 20px;background-color:#10b981;color:white;text-decoration:none;border-radius:8px;">Gestionar mi reporte</a></p>
        <p><strong>Importante:</strong> No compartas este correo con nadie, ya que cualquiera con el enlace podría modificar o borrar tu publicación.</p>
      `
    });
  } catch (emailError) {
    console.error('Error enviando correo de confirmación:', emailError);
    // No bloqueamos el flujo si el correo falla, igual se creó el reporte
  }

  // Trigger Webhook para Instagram (Zapier/Make)
  const webhookUrl = process.env.INSTAGRAM_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const locationText = municipality && department ? `${municipality}, ${department}` : 'Ubicación seleccionada en el mapa';
      const statusEmoji = status === 'searching' ? '🔍' : status === 'adoption' ? '🏡' : '✅';
      const instagramTag = instagram_profile ? `\n\nPublicado por: @${instagram_profile.replace('@', '')}` : '';
      const caption = `¡Ayuda a difundir! ${statusEmoji}\n${title}\n\n${description}\n\n📍 Ubicación: ${locationText}${instagramTag}\n\nConoce más y contacta al anunciante en el enlace de nuestra biografía.\n\n#Encuentralos #Mascotas #Comunidad`;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          caption,
          image_url: imageUrl || 'https://via.placeholder.com/300?text=Sin+Imagen',
          category,
          status,
          location: locationText,
          link: `${baseUrl}/${category}/${status}/${data.id}`
        })
      });
    } catch (webhookError) {
      console.error('Error enviando webhook de Instagram:', webhookError);
    }
  }

  revalidatePath(`/${category}/${status}`);
  revalidatePath('/');

  return {
    success: true,
    message: 'Reporte creado exitosamente',
    reportId: data.id,
    manageUrl: `/gestionar/${editToken}`
  };
}

/**
 * Server Action para obtener la lista de reportes por categoría y estado
 * Implementa paginación con page y limit.
 */
export async function getReports(category: string, status: string, page: number = 0, limit: number = 10) {
  const supabase = createClient();
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('category', category)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data;
}

/**
 * Server Action para obtener un reporte específico por su ID (UUID)
 */
export async function getReportById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching report by id:', error);
    return null;
  }

  return data;
}

/**
 * Server Action para obtener un reporte por su Token de edición
 */
export async function getReportByToken(token: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('edit_token', token)
    .single();

  if (error) return null;
  return data;
}

/**
 * Server Action para cambiar el estado de un reporte
 */
export async function updateReportStatus(token: string, newStatus: string) {
  const supabase = createClient();
  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('id, category')
    .eq('edit_token', token)
    .single();

  if (fetchError || !report) return { success: false, error: 'Token inválido' };

  const { error } = await supabase
    .from('reports')
    .update({ status: newStatus })
    .eq('edit_token', token);

  if (error) return { success: false, error: 'Error al actualizar' };

  revalidatePath(`/${report.category}/${newStatus}`);
  revalidatePath('/');
  return { success: true };
}

/**
 * Server Action para eliminar definitivamente un reporte
 */
export async function deleteReport(token: string) {
  const supabase = createClient();
  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('category, status')
    .eq('edit_token', token)
    .single();

  if (fetchError || !report) return { success: false, error: 'Token inválido' };

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('edit_token', token);

  if (error) return { success: false, error: 'Error al eliminar' };

  revalidatePath(`/${report.category}/${report.status}`);
  revalidatePath('/');
  return { success: true };
}

/**
 * Server Action para recuperar enlaces de gestión vía Email.
 */
export async function recoverManagementLinks(email: string) {
  if (!email) {
    throw new Error('Debes proporcionar un correo electrónico');
  }

  const supabase = createClient();

  // Buscar reportes asociados a este correo
  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, title, edit_token')
    .eq('contact_email', email);

  if (error) {
    throw new Error('Error al buscar reportes');
  }

  if (!reports || reports.length === 0) {
    // Por seguridad, retornamos éxito incluso si no hay reportes para no filtrar emails
    return { success: true, message: 'Si el correo existe en nuestra base de datos, te enviaremos los enlaces de gestión.' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos-seven.vercel.app';

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Tus enlaces de gestión - Encuéntralos',
      html: `
        <h2>Tus enlaces de gestión</h2>
        <p>Has solicitado recuperar los enlaces para gestionar tus reportes en Encuéntralos. Aquí tienes la lista:</p>
        <ul>
          ${reports.map(r => `
            <li style="margin-bottom: 15px;">
              <strong>${r.title}</strong><br/>
              <a href="${baseUrl}/gestionar/${r.edit_token}">Gestionar este reporte</a>
            </li>
          `).join('')}
        </ul>
        <p><strong>Importante:</strong> No compartas este correo, ya que cualquiera con los enlaces podría modificar o borrar tus publicaciones.</p>
      `
    });
  } catch (emailError) {
    console.error('Error enviando correo de recuperación:', emailError);
    // Continuamos para mostrar mensaje genérico
  }
  
  return {
    success: true,
    message: 'Si el correo existe en nuestra base de datos, te enviaremos los enlaces de gestión.'
  };
}
