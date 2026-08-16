'use server'

import { createClient } from '@/utils/supabase/server';
import { extractFeaturesAndEmbed } from '@/utils/gemini-features';

export async function checkMatchesForFoundReport(formData: FormData) {
  const category = formData.get('category') as string;
  const imageFile = formData.get('image') as File | null;

  if (!category || !imageFile || imageFile.size === 0) {
    return { success: false, error: 'Imagen o categoría faltante' };
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imageFile.type;

    const extraction = await extractFeaturesAndEmbed(base64Data, mimeType, category);
    
    if (!extraction) {
       return { success: false, error: 'No se pudieron extraer las características.' };
    }

    const supabase = createClient();

    // Buscar coincidencias
    // Formateamos el vector para pgvector: '[1.1, 2.2, ...]'
    const embeddingStr = `[${extraction.embedding.join(',')}]`;
    const threshold = 0.65; // Ajustar según pruebas

    const { data, error } = await supabase.rpc('match_reports', {
      query_embedding: embeddingStr,
      match_threshold: threshold,
      match_count: 3,
      target_category: category
    });

    if (error) {
      console.error('Error buscando matches:', error);
      return { success: false, error: 'Error al buscar reportes similares' };
    }

    return { 
        success: true, 
        matches: data || [], 
        features: extraction.features,
        embedding: extraction.embedding
    };
  } catch (error: any) {
    console.error('Error en checkMatches:', error);
    return { success: false, error: error.message };
  }
}
