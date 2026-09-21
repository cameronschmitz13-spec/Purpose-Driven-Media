create or replace function private.is_org_member(target_org_id uuid)
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
  );
$$;

create or replace function private.is_org_admin(target_org_id uuid)
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
      and om.role in ('owner','admin')
  );
$$;

revoke all on function private.is_org_member(uuid) from public, anon;
revoke all on function private.is_org_admin(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.is_org_admin(uuid) to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.create_organization(
  p_name text,
  p_organization_type text,
  p_website_url text default null,
  p_canonical_domain text default null,
  p_city text default null,
  p_state_region text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  org_id uuid;
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  if p_organization_type not in ('business','nonprofit','faith_ministry','organization') then
    raise exception 'Invalid organization type';
  end if;

  insert into public.organizations (
    name, normalized_name, organization_type, website_url, canonical_domain, city, state_region
  ) values (
    trim(p_name), lower(trim(p_name)), p_organization_type, p_website_url, p_canonical_domain, p_city, p_state_region
  ) returning id into org_id;

  insert into public.organization_members (organization_id, user_id, role, status)
  values (org_id, uid, 'owner', 'active');

  return org_id;
end;
$$;

revoke all on function public.create_organization(text,text,text,text,text,text) from public, anon;
grant execute on function public.create_organization(text,text,text,text,text,text) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.rubric_versions enable row level security;
alter table public.screening_runs enable row level security;
alter table public.screening_sources enable row level security;
alter table public.screening_findings enable row level security;
alter table public.screening_reports enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy organizations_select_member on public.organizations
for select to authenticated
using ((select private.is_org_member(id)));

create policy organizations_update_admin on public.organizations
for update to authenticated
using ((select private.is_org_admin(id)))
with check ((select private.is_org_admin(id)));

create policy organizations_delete_owner on public.organizations
for delete to authenticated
using (exists (
  select 1 from public.organization_members om
  where om.organization_id = id
    and om.user_id = (select auth.uid())
    and om.status = 'active'
    and om.role = 'owner'
));

create policy organization_members_select_member on public.organization_members
for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy organization_members_insert_admin on public.organization_members
for insert to authenticated
with check ((select private.is_org_admin(organization_id)));

create policy organization_members_update_admin on public.organization_members
for update to authenticated
using ((select private.is_org_admin(organization_id)))
with check ((select private.is_org_admin(organization_id)));

create policy organization_members_delete_admin on public.organization_members
for delete to authenticated
using ((select private.is_org_admin(organization_id)));

create policy rubric_versions_select_authenticated on public.rubric_versions
for select to authenticated
using (true);

create policy screening_runs_select_member on public.screening_runs
for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy screening_runs_insert_member on public.screening_runs
for insert to authenticated
with check (
  initiated_by = (select auth.uid())
  and (select private.is_org_member(organization_id))
);

create policy screening_runs_update_member on public.screening_runs
for update to authenticated
using ((select private.is_org_member(organization_id)))
with check ((select private.is_org_member(organization_id)));

create policy screening_sources_select_member on public.screening_sources
for select to authenticated
using (exists (
  select 1
  from public.screening_runs sr
  where sr.id = screening_run_id
    and (select private.is_org_member(sr.organization_id))
));

create policy screening_findings_select_member on public.screening_findings
for select to authenticated
using (exists (
  select 1
  from public.screening_runs sr
  where sr.id = screening_run_id
    and (select private.is_org_member(sr.organization_id))
));

create policy screening_reports_select_member on public.screening_reports
for select to authenticated
using (exists (
  select 1
  from public.screening_runs sr
  where sr.id = screening_run_id
    and (select private.is_org_member(sr.organization_id))
));

create policy audit_events_select_admin on public.audit_events
for select to authenticated
using (organization_id is not null and (select private.is_org_admin(organization_id)));
