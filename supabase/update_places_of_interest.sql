-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase para agregar las nuevas columnas a la tabla places_of_interest

ALTER TABLE public.places_of_interest 
ADD COLUMN donation_types text[] DEFAULT '{}'::text[],
ADD COLUMN is_temporary boolean DEFAULT false,
ADD COLUMN start_date timestamp with time zone,
ADD COLUMN end_date timestamp with time zone,
ADD COLUMN edit_token uuid DEFAULT uuid_generate_v4() NOT NULL;
