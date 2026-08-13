-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase para asignar todos los lugares huérfanos a tu correo

UPDATE public.places_of_interest 
SET contact_email = 'pinzonac@gmail.com'
WHERE contact_email IS NULL OR contact_email = '';
