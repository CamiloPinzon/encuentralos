-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase para agregar la columna contact_email a la tabla places_of_interest

ALTER TABLE public.places_of_interest 
ADD COLUMN contact_email text;
