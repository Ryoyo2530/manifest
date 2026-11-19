-- Manifest initial schema
-- Apply with: supabase db push (or the Supabase SQL editor).
-- All user-owned records are protected by RLS. Never expose service_role keys in the browser.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  avatar_url text,
  language text not null default 'en',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do update
    set email = excluded.email,
        display_name = case
          when public.profiles.display_name = '' then excluded.display_name
          else public.profiles.display_name
        end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null default 'Other',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wish_id uuid not null,
  output_type text not null check (output_type in ('video', 'image', 'audio')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  style text,
  mood text,
  presence text,
  input_snapshot jsonb not null default '{}'::jsonb,
  creative_brief jsonb not null default '{}'::jsonb,
  provider text,
  provider_job_id text,
  idempotency_key text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint generations_wish_owner_fk
    foreign key (wish_id, user_id) references public.wishes(id, user_id) on delete cascade,
  unique (user_id, idempotency_key)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null,
  asset_type text not null check (asset_type in ('video', 'image', 'audio', 'thumbnail')),
  storage_key text not null,
  file_url text,
  mime_type text not null,
  duration_seconds numeric,
  width integer,
  height integer,
  file_size_bytes bigint,
  created_at timestamptz not null default now(),
  constraint media_assets_generation_owner_fk
    foreign key (generation_id, user_id) references public.generations(id, user_id) on delete cascade,
  unique (storage_key)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null,
  created_at timestamptz not null default now(),
  constraint favorites_generation_owner_fk
    foreign key (generation_id, user_id) references public.generations(id, user_id) on delete cascade,
  unique (user_id, generation_id)
);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid,
  output_type text not null check (output_type in ('video', 'image', 'audio')),
  usage_units integer not null default 1 check (usage_units > 0),
  created_at timestamptz not null default now(),
  constraint usage_records_generation_owner_fk
    foreign key (generation_id, user_id) references public.generations(id, user_id) on delete cascade
);

create index if not exists wishes_user_created_idx on public.wishes(user_id, created_at desc);
create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);
create index if not exists generations_wish_created_idx on public.generations(wish_id, created_at desc);
create index if not exists media_assets_generation_idx on public.media_assets(generation_id);
create index if not exists favorites_user_created_idx on public.favorites(user_id, created_at desc);
create index if not exists usage_records_user_created_idx on public.usage_records(user_id, created_at desc);

drop trigger if exists wishes_set_updated_at on public.wishes;
create trigger wishes_set_updated_at before update on public.wishes
  for each row execute procedure public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.wishes enable row level security;
alter table public.generations enable row level security;
alter table public.media_assets enable row level security;
alter table public.favorites enable row level security;
alter table public.usage_records enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can manage own wishes" on public.wishes;
create policy "Users can manage own wishes" on public.wishes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can manage own generations" on public.generations;
create policy "Users can manage own generations" on public.generations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can manage own media assets" on public.media_assets;
create policy "Users can manage own media assets" on public.media_assets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can manage own favorites" on public.favorites;
create policy "Users can manage own favorites" on public.favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can view own usage" on public.usage_records;
create policy "Users can view own usage" on public.usage_records for select to authenticated using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.wishes to authenticated;
grant select, insert, update, delete on public.generations to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select on public.usage_records to authenticated;
