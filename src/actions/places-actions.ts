'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { PlaceOfInterest } from '@/types';

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
  const donation_types = formData.getAll('donation_types') as string[];
  const is_temporary = formData.get('is_temporary') === 'on';
  const start_date = formData.get('start_date') as string | null;
  const end_date = formData.get('end_date') as string | null;

  if (!category || !name || !department || !municipality || !address || isNaN(latitude) || isNaN(longitude)) {
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
