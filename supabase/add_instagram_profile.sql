-- Añadir campo instagram_profile a las tablas de la aplicación
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS instagram_profile text;
ALTER TABLE public.classifieds ADD COLUMN IF NOT EXISTS instagram_profile text;
ALTER TABLE public.places_of_interest ADD COLUMN IF NOT EXISTS instagram_profile text;
