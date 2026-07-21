-- RUNNER v2: usernames, friends (follow), and workout sync.
-- Run AFTER schema.sql. Paste this whole file into the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → Run). Safe to re-run.

-- ---------------------------------------------------------------- usernames
alter table public.profiles add column if not exists username text unique;

-- Claim / change your @username (3–20 chars: a–z, 0–9, underscore).
create or replace function public.set_username(p_username text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  u text := lower(trim(p_username));
begin
  if u !~ '^[a-z0-9_]{3,20}$' then
    return 'error: 3–20 characters — letters, numbers or underscore';
  end if;
  if exists (select 1 from public.profiles where username = u and id <> auth.uid()) then
    return 'error: that username is taken';
  end if;
  update public.profiles set username = u where id = auth.uid();
  return 'ok';
end;
$$;

-- ---------------------------------------------------------------- follows
create table if not exists public.follows (
  follower uuid not null references public.profiles (id) on delete cascade,
  followee uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, followee)
);

alter table public.follows enable row level security;

drop policy if exists "follows: read own edges" on public.follows;
create policy "follows: read own edges" on public.follows
  for select to authenticated
  using (follower = auth.uid() or followee = auth.uid());

drop policy if exists "follows: follow" on public.follows;
create policy "follows: follow" on public.follows
  for insert to authenticated with check (follower = auth.uid());

drop policy if exists "follows: unfollow" on public.follows;
create policy "follows: unfollow" on public.follows
  for delete to authenticated using (follower = auth.uid());

-- Do I follow `target`? / Does `target` follow me? (security definer so other
-- tables' policies can use these without recursing into follows' own RLS)
create or replace function public.i_follow(target uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.follows where follower = auth.uid() and followee = target);
$$;

create or replace function public.follows_me(target uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.follows where follower = target and followee = auth.uid());
$$;

-- Follow someone by @username.
create or replace function public.follow_user(p_username text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  target public.profiles%rowtype;
begin
  select * into target from public.profiles where username = lower(trim(p_username));
  if target.id is null then return 'error: no one has that username'; end if;
  if target.id = auth.uid() then return 'error: that is you'; end if;
  insert into public.follows (follower, followee) values (auth.uid(), target.id)
    on conflict do nothing;
  return 'ok';
end;
$$;

-- ---------------------------------------------------------------- profiles RLS
-- Now visible: yourself, your partner, people you follow, people who follow you.
drop policy if exists "profiles: read self and partner" on public.profiles;
create policy "profiles: read self and partner" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or id = public.my_partner_id()
    or public.i_follow(id)
    or public.follows_me(id)
  );

-- ---------------------------------------------------------------- activities RLS
-- Followers can read your runs (they appear in their feed).
drop policy if exists "activities: read self and partner" on public.activities;
create policy "activities: read self and partner" on public.activities
  for select to authenticated
  using (
    user_id = auth.uid()
    or user_id = public.my_partner_id()
    or public.i_follow(user_id)
  );

-- ---------------------------------------------------------------- workout logs
create table if not exists public.workout_logs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  id text not null,                    -- the app's local log id
  date timestamptz not null,
  name text not null default 'Workout',
  seconds integer not null default 0,
  volume double precision not null default 0,
  exercises jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.workout_logs enable row level security;

drop policy if exists "workouts: read visible" on public.workout_logs;
create policy "workouts: read visible" on public.workout_logs
  for select to authenticated
  using (
    user_id = auth.uid()
    or user_id = public.my_partner_id()
    or public.i_follow(user_id)
  );

drop policy if exists "workouts: write self" on public.workout_logs;
create policy "workouts: write self" on public.workout_logs
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------- kudos RLS
-- See hearts on anything that can appear in your feed (yours, partner's,
-- and people you follow), and on your own activities from anyone.
drop policy if exists "kudos: read self and partner" on public.kudos;
create policy "kudos: read self and partner" on public.kudos
  for select to authenticated
  using (
    user_id = auth.uid()
    or activity_user_id = auth.uid()
    or activity_user_id = public.my_partner_id()
    or public.i_follow(activity_user_id)
  );
