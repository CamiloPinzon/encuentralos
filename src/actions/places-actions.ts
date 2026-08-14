'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { PlaceOfInterest } from '@/types';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';

const resend = new Resend(process.env.RESEND_API_KEY);

const PLACE_EMOJIS: Record<string, string> = {
  "veterinary": "🏥",
  "shelter": "🏡",
  "donation": "🛍️",
  "public": "🏢"
};

export async function createPlaceOfInterest(formData: FormData) {
  const category = formData.get('category') as string;
  const name = formData.get('name') as string;
  const department = formData.get('department') as string;
  const municipality = formData.get('municipality') as string;
  const address = formData.get('address') as string;
  const latitude = parseFloat(formData.get('latitude') as string);
  const longitude = parseFloat(formData.get('longitude') as string);
  const business_hours = formData.get('business_hours') as string | null;
  const contact_info = formData.get('contact_info') as string | null;
  const contact_email = formData.get('contact_email') as string;
  const donation_types = formData.getAll('donation_types') as string[];
  const is_temporary = formData.get('is_temporary') === 'on';
  const start_date = formData.get('start_date') as string | null;
  const end_date = formData.get('end_date') as string | null;

  if (!category || !name || !department || !municipality || !address || !contact_email || isNaN(latitude) || isNaN(longitude)) {
    return { success: false, error: 'Faltan campos obligatorios' };
  }

  const supabase = createClient();

  // 1. Check for duplicates using the RPC
  const { data: isDuplicate, error: rpcError } = await supabase
    .rpc('check_nearby_place', {
      p_category: category,
      p_lat: latitude,
      p_lon: longitude,
      p_radius_meters: 50
    });

  if (rpcError) {
    console.error('RPC Error:', rpcError);
    // Ignore RPC error if function doesn't exist yet, but ideally we should fail
  } else if (isDuplicate) {
    return { success: false, error: 'Ya existe un lugar de esta categoría a menos de 50 metros.' };
  }

  // 2. Insert new place
  const { data, error } = await supabase
    .from('places_of_interest')
    .insert([{
      name,
      category,
      department,
      municipality,
      address,
      latitude,
      longitude,
      business_hours,
      contact_info,
      contact_email,
      donation_types: category === 'donation' ? donation_types : [],
      is_temporary: category === 'donation' ? is_temporary : false,
      start_date: (category === 'donation' && is_temporary && start_date) ? start_date : null,
      end_date: (category === 'donation' && is_temporary && end_date) ? end_date : null
    }])
    .select('edit_token')
    .single();

  if (error) {
    return { success: false, error: 'Error al guardar el lugar: ' + error.message };
  }

  // Enviar correo con el enlace de edición
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos.camilopinzon.com';
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: contact_email,
      subject: 'Gestiona tu lugar en Encuéntralos',
      html: `
        <h2>¡Tu lugar ha sido publicado!</h2>
        <p>Hola, has publicado un lugar titulado: <strong>${name}</strong></p>
        <p>Para administrarlo o eliminarlo definitivamente, haz clic en el siguiente enlace único:</p>
        <p><a href="${baseUrl}/lugares/gestionar/${data.edit_token}" style="display:inline-block;padding:10px 20px;background-color:#10b981;color:white;text-decoration:none;border-radius:8px;">Gestionar mi lugar</a></p>
        <p><strong>Importante:</strong> No compartas este correo con nadie, ya que cualquiera con el enlace podría borrar tu publicación.</p>
      `
    });
  } catch (emailError) {
    console.error('Error enviando correo de confirmación de lugar:', emailError);
  }

  // Generar URL de Cloudinary para Instagram (Diseño Tipográfico)
  const bgId = 'encuentralos_assets/bg_lugares.jpg';
  const tagText = '¡NUEVO LUGAR EN EL MAPA!';
  const emoji = PLACE_EMOJIS[category] || '📍';
  
  const encodedTag = encodeURIComponent(`${emoji} ${tagText}`);
  const encodedTitle = encodeURIComponent(name);
  const locationText = `${municipality}, ${department}`;
  const addressText = address ? `📍 ${address}` : '';
  const contactText = contact_info ? `👤 ${contact_info}` : '';
  const encodedAddress = encodeURIComponent(addressText);
  const encodedContact = encodeURIComponent(contactText);

  let instagramImageUrl = 'https://encuentralos.camilopinzon.com/icon.png';
  try {
    const cloudinaryUrlEnv = process.env.CLOUDINARY_URL || '';
    const cloudName = cloudinaryUrlEnv.split('@')[1] || 'xysikv0c';
    cloudinary.config({ cloud_name: cloudName, secure: true });

    const transformations: any[] = [
      { width: 1080, height: 1080, crop: "fill" },
      { overlay: { font_family: "Arial", font_size: 45, font_weight: "bold", text: encodedTag }, color: "#3b82f6", gravity: "north", y: 150 },
      { overlay: { font_family: "Arial", font_size: 75, font_weight: "bold", text: encodedTitle }, color: "#1e293b", gravity: "center", y: -100, width: 850, crop: "fit" },
      { overlay: { font_family: "Arial", font_size: 40, text: encodeURIComponent(locationText) }, color: "#475569", gravity: "center", y: 80, width: 850, crop: "fit" }
    ];

    if (encodedAddress) {
      transformations.push({ overlay: { font_family: "Arial", font_size: 35, text: encodedAddress }, color: "#64748b", gravity: "south", y: 220 });
    }
    
    if (encodedContact) {
      transformations.push({ overlay: { font_family: "Arial", font_size: 35, font_weight: "bold", text: encodedContact }, color: "#64748b", gravity: "south", y: 150 });
    }

    instagramImageUrl = cloudinary.url(bgId, {
      analytics: false,
      transformation: transformations
    });
  } catch (error) {
    console.error("Error generando url de cloudinary para lugares:", error);
  }

  // Trigger Webhook para Instagram (Zapier/Make)
  const webhookUrl = process.env.INSTAGRAM_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const donationText = (category === 'donation' && donation_types.length > 0) 
        ? ` | Se recibe: ${donation_types.join(', ')}` 
        : '';
        
      const caption = `¡Nuevo lugar en nuestra comunidad! 📍\n${name}\n\nDirección: ${address}\n${contact_info ? 'Contacto: ' + contact_info + '\n' : ''}${donationText ? donationText + '\n' : ''}\nConoce más ingresando al enlace en nuestra biografía.\n\n#Encuentralos #Lugares #Comunidad`;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          description: `Dirección: ${address}${contact_info ? ' | Contacto: ' + contact_info : ''}${donationText}`,
          caption,
          image_url: instagramImageUrl,
          category,
          status: 'lugar',
          location: locationText,
          link: `${baseUrl}/lugares`
        })
      });
    } catch (webhookError) {
      console.error('Error enviando webhook de Instagram para lugar:', webhookError);
    }
  }

  revalidatePath('/lugares');
  return { 
    success: true, 
    message: 'Lugar de interés publicado exitosamente',
    edit_token: data.edit_token 
  };
}

export async function getPlacesOfInterest(filters?: { department?: string, municipality?: string, category?: string }): Promise<PlaceOfInterest[]> {
  const supabase = createClient();
  let query = supabase.from('places_of_interest').select('*').order('created_at', { ascending: false });

  if (filters?.department) query = query.eq('department', filters.department);
  if (filters?.municipality) query = query.eq('municipality', filters.municipality);
  if (filters?.category && filters.category !== 'all') query = query.eq('category', filters.category);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  return data as PlaceOfInterest[];
}

export async function getPlaceByToken(token: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places_of_interest')
    .select('*')
    .eq('edit_token', token)
    .single();

  if (error) {
    return null;
  }
  return data as PlaceOfInterest;
}

export async function deletePlaceOfInterest(token: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('places_of_interest')
    .delete()
    .eq('edit_token', token);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/lugares');
  return { success: true };
}
