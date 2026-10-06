-- PollPop Free MVP schema (from 要件定義書 v4.0 §5.1)
-- Run this in the Supabase SQL Editor once.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_connect_account_id text,
  is_pro boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.polls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  options jsonb not null,
  theme text default 'animal_race',
  max_votes_per_user integer default 5,
  is_closed boolean default false,
  enable_super_votes boolean default false,
  manual_votes jsonb default '{}'::jsonb,
  custom_mascot_url text,
  question_number integer default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id integer not null,
  voter_fingerprint text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.paid_votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id integer not null,
  vote_count integer not null,
  amount_cents integer not null,
  supporter_name text default 'Anonymous',
  stripe_payment_intent_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.votes enable row level security;
alter table public.paid_votes enable row level security;

-- Free MVP: open policies (tighten when auth lands)
create policy "Allow public read polls" on public.polls for select using (true);
create policy "Allow insert polls" on public.polls for insert with check (true);
create policy "Allow update polls" on public.polls for update using (true);
create policy "Allow public read votes" on public.votes for select using (true);
create policy "Allow public insert votes" on public.votes for insert with check (true);
create policy "Allow public delete votes" on public.votes for delete using (true);
create policy "Allow public read paid_votes" on public.paid_votes for select using (true);

alter publication supabase_realtime add table public.polls;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.paid_votes;
