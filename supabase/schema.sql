-- RUNNER couples-feed schema. Paste this whole file into the Supabase
-- SQL Editor (Dashboard → SQL Editor → New query → Run). Safe to re-run.

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Runner',
  code text not null unique,          -- share this to link with your partner
  partner_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Auto-create a profile (with a 6-char invite code) whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Runner'),
    upper(substr(md5(random()::text || new.id::text), 1, 6))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Who is my partner? (security definer so RLS policies can use it without
-- recursing into the profiles policies themselves)
create or replace function public.my_partner_id()
returns uuid
language sql stable
security definer set search_path = public
as $$
  select partner_id from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles: read self and partner" on public.profiles;
create policy "profiles: read self and partner" on public.profiles
  for select to authenticated
  using (id = auth.uid() or id = public.my_partner_id());

drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Link two accounts by invite code. Both sides get partner_id set atomically.
create or replace function public.link_partner(p_code text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  target public.profiles%rowtype;
  me public.profiles%rowtype;
begin
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then return 'error: no profile'; end if;
  if me.partner_id is not null then return 'error: you are already linked'; end if;

  select * into target from public.profiles
    where upper(code) = upper(trim(p_code)) and id <> auth.uid();
  if target.id is null then return 'error: code not found'; end if;
  if target.partner_id is not null and target.partner_id <> me.id then
    return 'error: that person is already linked to someone else';
  end if;

  update public.profiles set partner_id = target.id where id = me.id;
  update public.profiles set partner_id = me.id where id = target.id;
  return 'ok';
end;
$$;

-- ---------------------------------------------------------------- activities
create table if not exists public.activities (
  user_id uuid not null references public.profiles (id) on delete cascade,
  id text not null,                    -- the app's local activity id
  date timestamptz not null,
  name text not null default 'Run',
  seconds integer not null default 0,
  miles double precision not null default 0,
  route jsonb not null default '[]'::jsonb,
  splits jsonb not null default '[]'::jsonb,
  source text not null default 'gps',
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.activities enable row level security;

drop policy if exists "activities: read self and partner" on public.activities;
create policy "activities: read self and partner" on public.activities
  for select to authenticated
  using (user_id = auth.uid() or user_id = public.my_partner_id());

drop policy if exists "activities: write self" on public.activities;
create policy "activities: write self" on public.activities
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------- kudos
create table if not exists public.kudos (
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_user_id uuid not null,
  activity_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_user_id, activity_id)
);

alter table public.kudos enable row level security;

drop policy if exists "kudos: read self and partner" on public.kudos;
create policy "kudos: read self and partner" on public.kudos
  for select to authenticated
  using (user_id = auth.uid() or user_id = public.my_partner_id());

drop policy if exists "kudos: give own" on public.kudos;
create policy "kudos: give own" on public.kudos
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "kudos: take back own" on public.kudos;
create policy "kudos: take back own" on public.kudos
  for delete to authenticated using (user_id = auth.uid());
