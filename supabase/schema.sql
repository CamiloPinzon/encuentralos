-- Habilitar la extensión para UUID y Vector
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Tabla principal de Reportes
create table public.reports (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    category text not null check (category in ('human', 'pet')),
    status text not null check (status in ('searching', 'found', 'spotted', 'resolved', 'adoption')),
    title text not null,
    description text,
    contact_email text not null,
    contact_phone text,
    instagram_profile text,
    image_url text,
    edit_token uuid default uuid_generate_v4() not null,
    features_text text,
    features_embedding vector(768)
);

-- Crear función para buscar reportes similares (IA)
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
    and status = 'searching'
    and features_embedding is not null
  order by reports.features_embedding <=> query_embedding
  limit match_count;
$$;

-- Políticas de Seguridad de Filas (Row Level Security)
alter table public.reports enable row level security;

-- Permitir lectura a todos (para listar en el feed)
create policy "Reportes visibles para todos"
on public.reports for select
to public
using ( true );

-- Restringir INSERT/UPDATE/DELETE.
-- Al usar Next.js Server Actions con la Service Role Key, 
-- el backend podrá ignorar esta política y escribir directamente.
-- Si usas la anon_key y no usas tokens para actualizar, la actualización requeriría otra política.
-- Por ahora, bloqueamos la escritura pública desde el cliente para forzar el uso del Server Action.

create policy "Bloquear inserciones desde cliente público"
on public.reports for insert
to public
with check ( false );

create policy "Bloquear actualizaciones desde cliente público"
on public.reports for update
to public
using ( false );

create policy "Bloquear borrados desde cliente público"
on public.reports for delete
to public
using ( false );

-- =========================================
-- Tabla de Clasificados (Ofrecer/Necesitar Ayuda)
-- =========================================
create table public.classifieds (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    type text not null check (type in ('ofrece', 'necesita')),
    category text not null,
    title text not null,
    description text not null,
    contact_name text not null,
    contact_email text not null,
    contact_phone text,
    location text,
    instagram_profile text,
    image_url text,
    status text not null default 'active' check (status in ('active', 'closed')),
    edit_token uuid default uuid_generate_v4() not null
);

-- Políticas de Seguridad de Filas (Row Level Security) para Clasificados
alter table public.classifieds enable row level security;

-- Permitir lectura a todos
create policy "Clasificados visibles para todos"
on public.classifieds for select
to public
using ( true );

-- Restringir INSERT/UPDATE/DELETE desde cliente (Se usará Server Actions)
create policy "Bloquear inserciones desde cliente público para clasificados"
on public.classifieds for insert
to public
with check ( false );

create policy "Bloquear actualizaciones desde cliente público para clasificados"
on public.classifieds for update
to public
using ( false );

create policy "Bloquear borrados desde cliente público para clasificados"
on public.classifieds for delete
to public
using ( false );
