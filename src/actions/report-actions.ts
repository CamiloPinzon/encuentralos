'use server'

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';
import { v2 as cloudinary } from 'cloudinary';

// La configuración de Cloudinary se toma automáticamente de la variable de entorno CLOUDINARY_URL

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
  const latitude = formData.get('latitude') as string;
  const longitude = formData.get('longitude') as string;
  const imageFile = formData.get('image') as File | null;
  
  if (!contact_email) {
    throw new Error('El email de contacto es obligatorio');
  }

  let imageUrl = null;

  if (imageFile && imageFile.size > 0) {
    // Convertimos el archivo a base64 para subirlo a Cloudinary usando el SDK de Node
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imageFile.type;
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    try {
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: 'encuentralos_reports',
      });
      imageUrl = uploadResult.secure_url;
    } catch (err: any) {
      throw new Error('Error al subir imagen a Cloudinary: ' + err.message);
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
        status,
        title,
        description,
        contact_email,
        contact_phone,
        image_url: imageUrl,
        edit_token: editToken,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error('Error al guardar el reporte: ' + error.message);
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
 */
export async function getReports(category: string, status: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('category', category)
    .eq('status', status)
    .order('created_at', { ascending: false });

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

  if (fetchError || !report) throw new Error('Token inválido');

  const { error } = await supabase
    .from('reports')
    .update({ status: newStatus })
    .eq('edit_token', token);

  if (error) throw new Error('Error al actualizar');

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

  if (fetchError || !report) throw new Error('Token inválido');

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('edit_token', token);

  if (error) throw new Error('Error al eliminar');

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

  // const supabase = createClient();

  // Buscar reportes asociados a este correo
  /*
  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, title, edit_token')
    .eq('contact_email', email);

  if (error) {
    throw new Error('Error al buscar reportes');
  }
  */

  // Simulación de reportes encontrados
  const mockReports = [
    { id: '1', title: 'Perrito perdido', edit_token: 'token-abc' },
    { id: '2', title: 'Gato encontrado', edit_token: 'token-xyz' }
  ];

  if (mockReports.length === 0) {
    return { success: false, message: 'No se encontraron reportes con ese correo.' };
  }

  // Aquí integrarías el envío de email, ej. con Resend
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Tus enlaces de gestión - Encuéntralos',
    html: `
      <p>Aquí tienes tus enlaces para gestionar tus reportes:</p>
      <ul>
        ${reports.map(r => `<li>${r.title}: <a href="https://tu-dominio.com/gestionar/${r.edit_token}">Gestionar</a></li>`).join('')}
      </ul>
    `
  });
  */

  console.log(`Simulando envío de correo a ${email} con los enlaces de gestión...`);
  
  return {
    success: true,
    message: 'Si el correo existe en nuestra base de datos, te enviaremos los enlaces de gestión.'
  };
}
