-- ---------------------------------------------------------------------------
-- Table privileges for the `authenticated` role.
--
-- RLS decides WHICH ROWS a user may touch, but Postgres still needs a base
-- table GRANT before RLS is even consulted. Without these, a signed-in user
-- gets "permission denied for table ..." — e.g. after create_organization
-- (which succeeds via SECURITY DEFINER) the app can't read the new membership
-- back, so it bounces to the create-org screen forever.
--
-- Writes that are funnelled through SECURITY DEFINER RPCs/triggers do NOT need
-- a direct grant here:
--   * profiles INSERT      → handle_new_user() trigger
--   * organizations INSERT → create_organization() RPC
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;

-- profiles: owner reads + updates their own row (see RLS policies).
grant select, update on public.profiles to authenticated;

-- organizations: members read; admins update.
grant select, update on public.organizations to authenticated;

-- organization_members: members read; admins insert/update/delete (invites).
grant select, insert, update, delete on public.organization_members to authenticated;
