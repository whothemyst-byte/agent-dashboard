create table if not exists public.user_onboarding_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  organization text not null,
  purpose text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_onboarding_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_onboarding_profiles'
      and policyname = 'onboarding_select_own'
  ) then
    create policy onboarding_select_own
      on public.user_onboarding_profiles
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_onboarding_profiles'
      and policyname = 'onboarding_insert_own'
  ) then
    create policy onboarding_insert_own
      on public.user_onboarding_profiles
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_onboarding_profiles'
      and policyname = 'onboarding_update_own'
  ) then
    create policy onboarding_update_own
      on public.user_onboarding_profiles
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;