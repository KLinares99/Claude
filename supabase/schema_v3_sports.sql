-- RUNNER v3: sport types (run / ride / walk) + workout intensity.
-- Run AFTER schema.sql (and ideally schema_v2_friends.sql). Paste into the
-- Supabase SQL Editor and Run. Safe to re-run.
--
-- The app works fine before this runs — it just syncs activities without
-- the sport tag (everything shows as a run on other devices) and workouts
-- without intensity. Run this to sync both properly.

alter table public.activities
  add column if not exists sport text not null default 'run';

-- workout_logs exists only if schema_v2_friends.sql was run; guard it.
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'workout_logs') then
    alter table public.workout_logs
      add column if not exists intensity text;
  end if;
end;
$$;
