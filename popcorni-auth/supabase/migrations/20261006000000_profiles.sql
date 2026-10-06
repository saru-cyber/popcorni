-- Popcorni profiles. Keep the table and column names aligned with
-- PROFILE_FIELDS / AUTH.profileTable in src/config/constants.ts.
-- Billing columns are written by the service role (Stripe webhooks), not by the signed-in user.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  is_pro boolean not null default false,
  pro_expires_at timestamptz null,
  stripe_connect_id text null
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select, insert on public.profiles to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and is_pro = false
    and pro_expires_at is null
    and stripe_connect_id is null
  );

create or replace function public.handle_new_popcorni_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_pro, pro_expires_at, stripe_connect_id)
  values (new.id, coalesce(new.email, ''), false, null, null)
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_popcorni on auth.users;
create trigger on_auth_user_created_popcorni
  after insert on auth.users
  for each row
  execute function public.handle_new_popcorni_user();

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
end $$;
