-- Explicit, expiring read-only report capabilities. Existing report RLS stays intact.
create schema if not exists pdm_report_sharing;
revoke all on schema pdm_report_sharing from public;
grant usage on schema pdm_report_sharing to anon, authenticated;
create table pdm_report_sharing.links (
 token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
 report_id uuid not null references public.site_screening_reports(id) on delete cascade,
 created_by uuid not null default auth.uid(),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 days',
 revoked_at timestamptz
);
alter table pdm_report_sharing.links enable row level security;
grant insert,select on pdm_report_sharing.links to authenticated;
grant update(revoked_at) on pdm_report_sharing.links to authenticated;
create policy share_create on pdm_report_sharing.links for insert to authenticated with check (
 created_by=auth.uid() and expires_at<=now()+interval '30 days' and revoked_at is null and
 exists(select 1 from public.site_screening_reports r where r.id=report_id and r.deleted_at is null and (r.created_by=auth.uid() or public.site_platform_admin_access()))
);
create policy share_read on pdm_report_sharing.links for select to authenticated using(created_by=auth.uid());
create policy share_revoke on pdm_report_sharing.links for update to authenticated using(created_by=auth.uid()) with check(created_by=auth.uid());
create function public.site_create_report_share(p_report_id uuid,p_token_hash text) returns timestamptz
 language sql security invoker set search_path='' as $$
 insert into pdm_report_sharing.links(token_hash,report_id) values(p_token_hash,p_report_id) returning expires_at;
$$;
create function public.site_revoke_report_share(p_token_hash text) returns boolean
 language sql security invoker set search_path='' as $$
 with revoked as(update pdm_report_sharing.links set revoked_at=now() where token_hash=p_token_hash returning 1) select exists(select 1 from revoked);
$$;
create function pdm_report_sharing.read_report(p_token text) returns jsonb
 language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',r.id,'screening_type',r.screening_type,'organization_name',r.organization_name,'display_score',r.display_score,'created_at',r.created_at,'report_snapshot',r.report_snapshot)
 from pdm_report_sharing.links l join public.site_screening_reports r on r.id=l.report_id
 where p_token ~ '^[0-9a-f]{64}$' and l.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 and l.revoked_at is null and l.expires_at>now() and r.deleted_at is null;
$$;
create function public.site_read_shared_report(p_token text) returns jsonb
 language sql stable security invoker set search_path='' as $$select pdm_report_sharing.read_report(p_token);$$;
revoke all on function public.site_create_report_share(uuid,text),public.site_revoke_report_share(text),public.site_read_shared_report(text),pdm_report_sharing.read_report(text) from public;
grant execute on function public.site_create_report_share(uuid,text),public.site_revoke_report_share(text) to authenticated;
grant execute on function public.site_read_shared_report(text),pdm_report_sharing.read_report(text) to anon,authenticated;
