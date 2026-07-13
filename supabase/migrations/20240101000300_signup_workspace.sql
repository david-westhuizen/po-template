-- ---------------------------------------------------------------------------
-- Self-service signup provisioning for end-user portals.
--
-- create_organization() is the ADMIN bootstrap (always role 'admin') — the only
-- path into the back-office. End-user apps (Customer/Partner) instead call this
-- to spin up the signer's OWN workspace with a NON-privileged role, so they
-- land straight in their app on signup.
--
-- SECURITY: the role is supplied by the client, so this MUST refuse privileged
-- roles — otherwise anyone could self-assign 'admin' and enter the Admin app.
-- Keep the denylist in sync with the roles that grant back-office access.
-- ---------------------------------------------------------------------------

create or replace function public.signup_create_workspace(_role text, _name text default null)
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

  if _role is null or _role in ('admin', 'manager') then
    raise exception 'Role % cannot be self-assigned at signup', _role;
  end if;

  insert into public.organizations (name, created_by)
  values (coalesce(nullif(btrim(_name), ''), 'My workspace'), auth.uid())
  returning * into org;

  insert into public.organization_members (org_id, user_id, role)
  values (org.id, auth.uid(), _role);

  return org;
end;
$$;

grant execute on function public.signup_create_workspace(text, text) to authenticated;
