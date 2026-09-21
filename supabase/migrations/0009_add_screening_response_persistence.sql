create table if not exists public.screening_responses (
  id uuid primary key default gen_random_uuid(),
  screening_run_id uuid not null references public.screening_runs(id) on delete cascade,
  question_key text not null,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (screening_run_id, question_key)
);

create index if not exists screening_responses_run_id_idx
  on public.screening_responses(screening_run_id);

create or replace function private.can_edit_screening_response(target_run_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.screening_runs sr
    where sr.id = target_run_id
      and sr.status not in ('complete','failed')
      and private.is_org_member(sr.organization_id)
  );
$$;

revoke all on function private.can_edit_screening_response(uuid) from public, anon;
grant execute on function private.can_edit_screening_response(uuid) to authenticated;

alter table public.screening_responses enable row level security;

create policy screening_responses_select_member
on public.screening_responses
for select to authenticated
using (
  exists (
    select 1 from public.screening_runs sr
    where sr.id = screening_run_id
      and private.is_org_member(sr.organization_id)
  )
);

create policy screening_responses_insert_member
on public.screening_responses
for insert to authenticated
with check ((select private.can_edit_screening_response(screening_run_id)));

create policy screening_responses_update_member
on public.screening_responses
for update to authenticated
using ((select private.can_edit_screening_response(screening_run_id)))
with check ((select private.can_edit_screening_response(screening_run_id)));

create policy screening_responses_delete_member
on public.screening_responses
for delete to authenticated
using ((select private.can_edit_screening_response(screening_run_id)));

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists screening_responses_set_updated_at on public.screening_responses;
create trigger screening_responses_set_updated_at
before update on public.screening_responses
for each row execute function private.set_updated_at();

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
