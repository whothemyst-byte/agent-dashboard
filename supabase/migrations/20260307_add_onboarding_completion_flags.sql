alter table public.user_onboarding_profiles
  add column if not exists details_completed boolean not null default false,
  add column if not exists agent_selection_completed boolean not null default false;

update public.user_onboarding_profiles
set details_completed = true
where coalesce(name,'') <> ''
  and coalesce(organization,'') <> ''
  and coalesce(purpose,'') <> '';

update public.user_onboarding_profiles p
set agent_selection_completed = true
where exists (
  select 1
  from public.agents a
  where a.user_id = p.user_id
    and a.is_default = true
    and a.role in ('ceo', 'manager', 'techlead')
  group by a.user_id
  having count(distinct a.role) = 3
);
