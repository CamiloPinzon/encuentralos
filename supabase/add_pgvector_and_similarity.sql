-- Habilitar extensión pgvector
create extension if not exists vector;

-- Modificar tabla reports para incluir vector y texto de características
alter table public.reports 
  add column if not exists features_text text,
  add column if not exists features_embedding vector(768); -- Modelo text-embedding-004 de Google produce vectores de 768 dimensiones

-- Crear función para buscar reportes similares
create or replace function match_reports (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  target_category text
)
returns table (
  id uuid,
  title text,
  description text,
  image_url text,
  status text,
  contact_phone text,
  contact_email text,
  similarity float
)
language sql stable
as $$
  select
    id,
    title,
    description,
    image_url,
    status,
    contact_phone,
    contact_email,
    1 - (reports.features_embedding <=> query_embedding) as similarity
  from reports
  where 1 - (reports.features_embedding <=> query_embedding) > match_threshold
    and category = target_category
    and status = 'searching' -- Solo buscar entre los que están perdidos
    and features_embedding is not null
  order by reports.features_embedding <=> query_embedding
  limit match_count;
$$;
