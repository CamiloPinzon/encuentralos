-- Habilitar la extensión para UUID
create extension if not exists "uuid-ossp";

-- Tabla principal de Reportes
create table public.reports (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    category text not null check (category in ('human', 'pet')),
    status text not null check (status in ('searching', 'found', 'spotted', 'resolved')),
    title text not null,
    description text,
    contact_email text not null,
    contact_phone text,
    image_url text,
    edit_token uuid default uuid_generate_v4() not null
);

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
