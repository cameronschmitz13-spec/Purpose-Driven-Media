-- Harden screening writes and organization membership changes.

drop policy if exists screening_runs_insert_member on public.screening_runs;
drop policy if exists screening_runs_update_member on public.screening_runs;

alter table public.screening_findings
  drop constraint if exists screening_findings_score_range;
alter table public.screening_findings
  add constraint screening_findings_score_range
  check (score >= 0 and score <= max_score);

create or replace function private.enforce_finding_source_gate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  src_run uuid;
  src_included boolean;
  src_status text;
begin
  if new.source_id is null then return new; end if;

  select screening_run_id, included_in_score, match_status
    into src_run, src_included, src_status
  from public.screening_sources
  where id = new.source_id;

  if src_run is null then raise exception 'Finding source does not exist'; end if;
  if src_run <> new.screening_run_id then raise exception 'Finding source belongs to another screening run'; end if;
  if src_included is not true or src_status <> 'confirmed' then
    raise exception 'Finding source is not eligible for scoring';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_finding_source_gate() from public, anon, authenticated;

drop trigger if exists enforce_finding_source_gate on public.screening_findings;
create trigger enforce_finding_source_gate
before insert or update of source_id, screening_run_id
on public.screening_findings
for each row execute function private.enforce_finding_source_gate();

create or replace function private.prevent_last_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_owner_count integer;
begin
  if tg_op = 'DELETE' then
    if old.role <> 'owner' or old.status <> 'active' then return old; end if;
    select count(*) into active_owner_count
    from public.organization_members
    where organization_id = old.organization_id and role = 'owner' and status = 'active';
    if active_owner_count <= 1 then raise exception 'Organization must retain at least one active owner'; end if;
    return old;
  end if;

  if old.role = 'owner' and old.status = 'active'
     and (new.role <> 'owner' or new.status <> 'active') then
    select count(*) into active_owner_count
    from public.organization_members
    where organization_id = old.organization_id and role = 'owner' and status = 'active';
    if active_owner_count <= 1 then raise exception 'Organization must retain at least one active owner'; end if;
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_last_owner_removal() from public, anon, authenticated;

drop trigger if exists prevent_last_owner_removal on public.organization_members;
create trigger prevent_last_owner_removal
before update or delete on public.organization_members
for each row execute function private.prevent_last_owner_removal();
