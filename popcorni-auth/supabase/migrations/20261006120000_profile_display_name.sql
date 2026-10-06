-- Display names are chosen by the signed-in user. Billing columns stay service-role only.

alter table public.profiles
  add column if not exists display_name text not null default '';

grant update (display_name) on public.profiles to authenticated;

drop policy if exists profiles_update_display_name on public.profiles;
create policy profiles_update_display_name
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_popcorni_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    is_pro,
    pro_expires_at,
    stripe_connect_id
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      ''
    ),
    false,
    null,
    null
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

update public.profiles as profile
set display_name = coalesce(
  nullif(users.raw_user_meta_data->>'full_name', ''),
  nullif(users.raw_user_meta_data->>'name', ''),
  profile.display_name
)
from auth.users as users
where profile.id = users.id
  and profile.display_name = '';
