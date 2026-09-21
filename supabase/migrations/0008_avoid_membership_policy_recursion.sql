create or replace function private.is_org_owner(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org_id
      and om.user_id = (select auth.uid())
      and om.status = 'active'
      and om.role = 'owner'
  );
$$;

revoke all on function private.is_org_owner(uuid) from public, anon;
grant execute on function private.is_org_owner(uuid) to authenticated;

drop policy if exists organization_members_insert_admin on public.organization_members;
drop policy if exists organization_members_update_admin on public.organization_members;
drop policy if exists organization_members_delete_admin on public.organization_members;

create policy organization_members_insert_admin
on public.organization_members
for insert to authenticated
with check (
  (select private.is_org_owner(organization_id))
  or ((select private.is_org_admin(organization_id)) and role in ('admin','member'))
);

create policy organization_members_update_admin
on public.organization_members
for update to authenticated
using (
  (select private.is_org_owner(organization_id))
  or ((select private.is_org_admin(organization_id)) and role <> 'owner')
)
with check (
  (select private.is_org_owner(organization_id))
  or ((select private.is_org_admin(organization_id)) and role <> 'owner')
);

create policy organization_members_delete_admin
on public.organization_members
for delete to authenticated
using (
  (select private.is_org_owner(organization_id))
  or ((select private.is_org_admin(organization_id)) and role <> 'owner')
);
