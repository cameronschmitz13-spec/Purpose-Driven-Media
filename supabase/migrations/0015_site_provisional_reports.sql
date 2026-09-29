-- Fresh Site screenings are user supplied legacy snapshots. They are deliberately
-- separate from the trusted visibility-v1 run, findings and report tables.
create table private.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table private.platform_admins enable row level security;
revoke all on table private.platform_admins from public, anon, authenticated;

create function private.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from private.platform_admins pa
    join auth.users u on u.id = pa.user_id
    where pa.user_id = (select auth.uid())
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function private.is_platform_admin() from public, anon;
grant execute on function private.is_platform_admin() to authenticated;

-- The admin API must verify this before labeling an RLS-filtered list as
-- owner-wide; an absent owner grant otherwise resembles an empty result set.
create function public.site_platform_admin_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_platform_admin();
$$;

revoke all on function public.site_platform_admin_access() from public, anon;
grant execute on function public.site_platform_admin_access() to authenticated;

create table public.site_screening_reports (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  screening_type text not null check (screening_type in ('business', 'nonprofit', 'faith_ministry', 'organization')),
  organization_name text not null check (length(btrim(organization_name)) between 1 and 240),
  input_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(input_snapshot) = 'object' and octet_length(input_snapshot::text) <= 1048576),
  report_snapshot jsonb not null check (jsonb_typeof(report_snapshot) = 'object' and octet_length(report_snapshot::text) <= 2097152),
  display_score numeric(6,2) check (display_score is null or display_score between 0 and 100),
  rubric_version text not null default 'legacy-site-v1' check (rubric_version = 'legacy-site-v1'),
  score_provenance text not null default 'client_computed_unverified' check (score_provenance = 'client_computed_unverified'),
  status text not null default 'provisional' check (status = 'provisional'),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null
);

create index site_screening_reports_creator_date_idx
  on public.site_screening_reports(created_by, created_at desc) where deleted_at is null;
create index site_screening_reports_date_idx
  on public.site_screening_reports(created_at desc) where deleted_at is null;

alter table public.site_screening_reports enable row level security;
revoke all on table public.site_screening_reports from public, anon, authenticated;
grant select, insert on table public.site_screening_reports to authenticated;

create function private.stamp_site_report_creation()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := now();
  return new;
end;
$$;

revoke all on function private.stamp_site_report_creation() from public, anon, authenticated;
create trigger site_report_creation_time
  before insert on public.site_screening_reports
  for each row execute function private.stamp_site_report_creation();

create policy site_screening_reports_read
  on public.site_screening_reports for select to authenticated
  using (deleted_at is null and (created_by = (select auth.uid()) or (select private.is_platform_admin())));

create policy site_screening_reports_create
  on public.site_screening_reports for insert to authenticated
  with check (created_by = (select auth.uid()) and deleted_at is null and deleted_by is null);

-- A callable operation can mutate only the exact visible report ID. It logs the
-- disposition while preserving the original snapshot for forensic recovery.
create function public.delete_site_screening_report(p_report_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  affected public.site_screening_reports%rowtype;
begin
  if actor is null then raise exception 'Authentication required'; end if;

  update public.site_screening_reports r
  set deleted_at = now(), deleted_by = actor
  where r.id = p_report_id and r.deleted_at is null
    and (r.created_by = actor or private.is_platform_admin())
  returning * into affected;

  if affected.id is null then return null; end if;

  insert into public.audit_events(actor_user_id, organization_id, event_type, payload)
  values (actor, null, 'site_report_deleted',
    jsonb_build_object('report_id', affected.id, 'screening_type', affected.screening_type));
  return affected.id;
end;
$$;

revoke all on function public.delete_site_screening_report(uuid) from public, anon;
grant execute on function public.delete_site_screening_report(uuid) to authenticated;
