-- =====================================================================
-- THE VERB — Schema Supabase (PostgreSQL)
-- Rode este arquivo no SQL Editor do Supabase (uma vez).
-- =====================================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type editorial_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_type as enum ('reels', 'carousel', 'single_post', 'story');
exception when duplicate_object then null; end $$;

-- ---------- HELPERS ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- CLIENTS
-- =====================================================================
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  niche       text,
  contact     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_clients_updated on public.clients;
create trigger trg_clients_updated
  before update on public.clients
  for each row execute function public.set_updated_at();

-- =====================================================================
-- EDITORIAL LINES
-- =====================================================================
create table if not exists public.editorial_lines (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  status       editorial_status not null default 'draft',
  public_hash  text not null unique default encode(gen_random_bytes(9), 'base64'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Limpa o base64 para algo URL-safe
create or replace function public.sanitize_public_hash()
returns trigger as $$
begin
  new.public_hash := replace(replace(replace(new.public_hash, '/', '_'), '+', '-'), '=', '');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sanitize_hash on public.editorial_lines;
create trigger trg_sanitize_hash
  before insert on public.editorial_lines
  for each row execute function public.sanitize_public_hash();

drop trigger if exists trg_editorial_updated on public.editorial_lines;
create trigger trg_editorial_updated
  before update on public.editorial_lines
  for each row execute function public.set_updated_at();

-- =====================================================================
-- POSTS
-- =====================================================================
create table if not exists public.posts (
  id                 uuid primary key default gen_random_uuid(),
  editorial_line_id  uuid not null references public.editorial_lines(id) on delete cascade,
  owner_id           uuid not null references auth.users(id) on delete cascade,
  title              text,
  type               post_type not null default 'single_post',
  scheduled_date     date,
  content            jsonb,
  sort_order         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------- INDEXES ----------
create index if not exists idx_editorial_lines_client on public.editorial_lines(client_id);
create index if not exists idx_editorial_lines_hash   on public.editorial_lines(public_hash);
create index if not exists idx_posts_editorial         on public.posts(editorial_line_id);
create index if not exists idx_posts_scheduled         on public.posts(scheduled_date);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.clients         enable row level security;
alter table public.editorial_lines enable row level security;
alter table public.posts           enable row level security;

-- ADMIN: dono tem acesso total
drop policy if exists "owner_full_access_clients" on public.clients;
create policy "owner_full_access_clients"
  on public.clients for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "owner_full_access_editorial" on public.editorial_lines;
create policy "owner_full_access_editorial"
  on public.editorial_lines for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "owner_full_access_posts" on public.posts;
create policy "owner_full_access_posts"
  on public.posts for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- =====================================================================
-- ACESSO PÚBLICO (read-only, controlado, sem RLS aberta)
-- Retorna apenas linhas com status 'published', sem vazar owner_id etc.
-- =====================================================================
create or replace function public.get_public_editorial(p_hash text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',           el.id,
    'name',         el.name,
    'status',       el.status,
    'client_name',  c.name,
    'client_niche', c.niche,
    'posts', coalesce(
      (select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'type', p.type,
            'scheduled_date', p.scheduled_date,
            'content', p.content
          ) order by p.sort_order asc, p.scheduled_date asc nulls last
        )
        from posts p
        where p.editorial_line_id = el.id
      ), '[]'::jsonb
    )
  )
  from editorial_lines el
  join clients c on c.id = el.client_id
  where el.public_hash = p_hash
    and el.status = 'published'
  limit 1;
$$;

grant execute on function public.get_public_editorial(text) to anon;
grant execute on function public.get_public_editorial(text) to authenticated;

-- =====================================================================
-- FIM
-- Lembrete: crie o usuário admin em Authentication > Users (Add user),
-- ou desative "Confirm email" para login imediato em desenvolvimento.
-- =====================================================================
