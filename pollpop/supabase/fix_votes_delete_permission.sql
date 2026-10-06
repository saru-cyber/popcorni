-- Fix: Q2 / next-question fails with "permission denied for table votes"
-- Run this entire script in the Supabase SQL Editor.
--
-- Cause:
--   startNextQuestion() (src/lib/polls.ts) calls:
--     supabase.from("votes").delete().eq("poll_id", pollId)
--   using the anon key from the browser.
--   RLS DELETE policy alone is not enough — the `anon` / `authenticated`
--   roles also need table-level DELETE privilege (GRANT).
--   Without GRANT DELETE, Postgres returns: permission denied for table votes.

-- 1) Table privileges for PostgREST roles
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on table public.votes
  to anon, authenticated;

grant select, insert, update
  on table public.polls
  to anon, authenticated;

-- 2) Ensure RLS stays enabled
alter table public.votes enable row level security;
alter table public.polls enable row level security;

-- 3) DELETE policy for clearing votes between questions
drop policy if exists "Allow public delete votes" on public.votes;
create policy "Allow public delete votes"
  on public.votes
  for delete
  using (true);

-- Keep existing read/insert policies idempotent (safe to re-run)
drop policy if exists "Allow public read votes" on public.votes;
create policy "Allow public read votes"
  on public.votes
  for select
  using (true);

drop policy if exists "Allow public insert votes" on public.votes;
create policy "Allow public insert votes"
  on public.votes
  for insert
  with check (true);

-- 4) Ensure question_number column exists (session multi-question)
alter table public.polls
  add column if not exists question_number integer default 1 not null;
