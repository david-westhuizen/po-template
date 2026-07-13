-- ---------------------------------------------------------------------------
-- Organizations — organization-based multi-tenancy (the reusable B2B layer).
--
--   organizations         one row per tenant/company
--   organization_members  membership + PER-ORG role (a user can be admin of
--                          one org and member of another)
--
-- RLS is scoped by membership via SECURITY DEFINER helpers so policies never
-- recurse. Every domain table you add should carry an `org_id` and use
-- `using (public.is_org_member(org_id))`.
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

create table if not exists public.organization_members (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null,
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Membership/role helpers ----------------------------------------------------
-- SECURITY DEFINER + bypassing RLS is what prevents recursive policy
-- evaluation when a policy on organization_members needs to read membership.
create or replace function public.is_org_member(_org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where org_id = _org and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(_org uuid, _role text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where org_id = _org and user_id = auth.uid() and role = _role
  );
$$;

-- RLS policies ---------------------------------------------------------------
create policy "Members can read their organizations"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "Admins can update their organization"
  on public.organizations for update
  using (public.has_org_role(id, 'admin'));

create policy "Members can read memberships in their orgs"
  on public.organization_members for select
  using (public.is_org_member(org_id));

create policy "Admins manage memberships"
  on public.organization_members for insert
  with check (public.has_org_role(org_id, 'admin'));

create policy "Admins update memberships"
  on public.organization_members for update
  using (public.has_org_role(org_id, 'admin'));

create policy "Admins remove memberships"
  on public.organization_members for delete
  using (public.has_org_role(org_id, 'admin'));

-- Create-org bootstrap -------------------------------------------------------
-- Chicken-and-egg: the first admin membership can't satisfy the "admins
-- manage memberships" policy because no admin exists yet. This SECURITY
-- DEFINER RPC creates the org AND the creator's admin membership atomically,
-- bypassing RLS. This is the ONLY sanctioned way to become an admin.
create or replace function public.create_organization(_name text, _slug text default null)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (_name, _slug, auth.uid())
  returning * into org;

  insert into public.organization_members (org_id, user_id, role)
  values (org.id, auth.uid(), 'admin');

  return org;
end;
$$;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text) to authenticated;
grant execute on function public.create_organization(text, text) to authenticated;

-- NOTE: inviting existing users as members/partners is left as an extension —
-- add an add_org_member(_org, _email, _role) SECURITY DEFINER RPC (guarded by
-- has_org_role(_org,'admin')) plus an email invite flow when you need it.
