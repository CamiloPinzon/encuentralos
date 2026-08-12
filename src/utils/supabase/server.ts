import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Usaremos la clave de Service Role para tener privilegios de admin en el backend
// y poder saltarnos las restricciones de RLS que protegen la base de datos de usuarios públicos.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Key is missing in environment variables.');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}
