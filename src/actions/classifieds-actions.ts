'use server'

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';
import { v2 as cloudinary } from 'cloudinary';

const CATEGORY_EMOJIS: Record<string, string> = {
  "Voluntariado": "🤝",
  "Donaciones": "📦",
  "Refugio Temporal": "🏠",
  "Refugio de Animales": "🐾",
  "Asistencia Médica": "🏥",
  "Transporte": "🚗",
  "Alimentos": "🥫",
  "Otro": "📢"
};

export async function createClassified(formData: FormData) {
  const type = formData.get('type') as string;
  const category = formData.get('category') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const contact_name = formData.get('contact_name') as string;
  const contact_email = formData.get('contact_email') as string;
  const contact_phone = formData.get('contact_phone') as string;
  const location = formData.get('location') as string;
  
  if (!contact_email || !title || !description || !type || !category || !contact_name) {
    return { success: false, error: 'Faltan campos obligatorios' };
  }

  const editToken = uuidv4();
  const supabase = createClient();

  // Generar URL de Cloudinary para Instagram (Diseño Tipográfico)
  const bgId = 'encuentralos_assets/bg_clasificados.jpg';
  const tagText = type === 'ofrece' ? '¡OFRECE AYUDA!' : '¡NECESITA AYUDA!';
  const emoji = CATEGORY_EMOJIS[category] || '📢';
  
  const encodedTag = encodeURIComponent(`${emoji} ${tagText}`);
  const encodedTitle = encodeURIComponent(title);
  const cleanDesc = description.replace(/\r?\n|\r/g, " "); // Cloudinary text overlay no maneja bien multilinea natural a menos que el crop sea fit
  const encodedDesc = encodeURIComponent(cleanDesc.substring(0, 200) + (cleanDesc.length > 200 ? '...' : ''));
  const encodedLocation = encodeURIComponent(`📍 ${location || 'No especificada'}`);
  const encodedContact = encodeURIComponent(`👤 ${contact_name}`);

  // Para evitar errores si Cloudinary_URL no está, lo ponemos en un bloque try catch
  let instagramImageUrl = 'https://encuentralos.camilopinzon.com/icon.png';
  try {
    const cloudinaryUrlEnv = process.env.CLOUDINARY_URL || '';
    const cloudName = cloudinaryUrlEnv.split('@')[1] || 'xysikv0c';
    cloudinary.config({ cloud_name: cloudName, secure: true });

    instagramImageUrl = cloudinary.url(bgId, {
      analytics: false,
      transformation: [
        { width: 1080, height: 1080, crop: "fill" },
        { overlay: { font_family: "Arial", font_size: 45, font_weight: "bold", text: encodedTag }, color: type === 'ofrece' ? "#3b82f6" : "#ec4899", gravity: "north", y: 150 },
        { overlay: { font_family: "Arial", font_size: 65, font_weight: "bold", text: encodedTitle }, color: "#1e293b", gravity: "center", y: -120, width: 850, crop: "fit" },
        { overlay: { font_family: "Arial", font_size: 40, text: encodedDesc }, color: "#475569", gravity: "center", y: 80, width: 850, crop: "fit" },
        { overlay: { font_family: "Arial", font_size: 35, text: encodedLocation }, color: "#64748b", gravity: "south", y: 220 },
        { overlay: { font_family: "Arial", font_size: 35, font_weight: "bold", text: encodedContact }, color: "#64748b", gravity: "south", y: 150 }
      ]
    });
  } catch (error) {
    console.error("Error generando url de cloudinary:", error);
  }

  const { data, error } = await supabase
    .from('classifieds')
    .insert([
      {
        type,
        category,
        title,
        description,
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        location: location || null,
        image_url: null, // Ya no se suben fotos de usuario
        edit_token: editToken,
      }
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Error al guardar el clasificado: ' + error.message };
  }

  // Trigger Webhook para Instagram (Zapier/Make)
  const webhookUrl = process.env.INSTAGRAM_WEBHOOK_URL;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos-seven.vercel.app';
  
  if (webhookUrl) {
    try {
      const typeText = type === 'ofrece' ? '¡Nueva oferta de ayuda! 📢' : '¡Atención comunidad, se necesita ayuda! 📢';
      const caption = `${typeText}\n${title}\n\n${description}\n\n📍 Ubicación: ${location || 'No especificada'}\n👤 Contacto: ${contact_name}\n\nSi quieres ayudar o conocer más, ingresa al enlace en nuestra biografía.\n\n#Encuentralos #Clasificados #Ayuda #Comunidad`;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'classified',
          type,
          category,
          title,
          description,
          caption,
          image_url: instagramImageUrl,
          location: location || 'No especificada',
          contact_name,
          link: `${baseUrl}/clasificados`
        })
      });
    } catch (webhookError) {
      console.error('Error enviando webhook de Instagram:', webhookError);
    }
  }

  revalidatePath('/clasificados');

  return {
    success: true,
    message: 'Clasificado publicado exitosamente',
    id: data.id,
  };
}

export async function getClassifieds(typeFilter?: string, page: number = 0, limit: number = 20) {
  const supabase = createClient();
  const from = page * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from('classifieds')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (typeFilter && (typeFilter === 'ofrece' || typeFilter === 'necesita')) {
    query = query.eq('type', typeFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching classifieds:', error);
    return [];
  }

  return data;
}
