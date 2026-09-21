create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text,
  organization_type text not null check (organization_type in ('business','nonprofit','faith_ministry','organization')),
  canonical_domain text,
  website_url text,
  street_address text,
  city text,
  state_region text,
  postal_code text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.rubric_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  screening_type text not null check (screening_type in ('business','nonprofit','faith_ministry','organization','universal')),
  config jsonb not null default '{}'::jsonb,
  active_from timestamptz not null default now(),
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  unique (screening_type, version)
);

create table if not exists public.screening_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  initiated_by uuid references auth.users(id) on delete set null,
  screening_type text not null check (screening_type in ('business','nonprofit','faith_ministry','organization')),
  rubric_version_id uuid not null references public.rubric_versions(id),
  status text not null default 'pending' check (status in ('pending','resolving_identity','collecting_sources','scoring','complete','failed')),
  input_snapshot jsonb not null default '{}'::jsonb,
  canonical_identity_snapshot jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.screening_sources (
  id uuid primary key default gen_random_uuid(),
  screening_run_id uuid not null references public.screening_runs(id) on delete cascade,
  source_url text not null,
  source_type text not null,
  observed_name text,
  observed_city text,
  observed_state text,
  match_status text not null check (match_status in ('confirmed','rejected','ambiguous')),
  match_basis jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  included_in_score boolean not null default false,
  excluded_reason text,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint screening_sources_scoring_gate check (
    included_in_score = false or match_status = 'confirmed'
  )
);

create table if not exists public.screening_findings (
  id uuid primary key default gen_random_uuid(),
  screening_run_id uuid not null references public.screening_runs(id) on delete cascade,
  category_key text not null,
  rule_key text not null,
  finding_type text not null,
  raw_value jsonb not null default '{}'::jsonb,
  score numeric(8,3) not null default 0,
  max_score numeric(8,3) not null check (max_score >= 0),
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  source_id uuid references public.screening_sources(id) on delete set null,
  explanation text,
  created_at timestamptz not null default now(),
  unique (screening_run_id, category_key, rule_key)
);

create table if not exists public.screening_reports (
  id uuid primary key default gen_random_uuid(),
  screening_run_id uuid not null unique references public.screening_runs(id) on delete cascade,
  total_score numeric(6,2) not null check (total_score >= 0 and total_score <= 100),
  planning_target numeric(6,2) check (planning_target is null or (planning_target >= 0 and planning_target <= 100)),
  report_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_members_user_id_idx on public.organization_members(user_id);
create index if not exists screening_runs_organization_id_idx on public.screening_runs(organization_id);
create index if not exists screening_runs_initiated_by_idx on public.screening_runs(initiated_by);
create index if not exists screening_runs_rubric_version_id_idx on public.screening_runs(rubric_version_id);
create index if not exists screening_sources_run_id_idx on public.screening_sources(screening_run_id);
create index if not exists screening_sources_match_status_idx on public.screening_sources(match_status);
create index if not exists screening_findings_run_id_idx on public.screening_findings(screening_run_id);
create index if not exists screening_findings_source_id_idx on public.screening_findings(source_id);
create index if not exists audit_events_organization_id_idx on public.audit_events(organization_id);
create index if not exists audit_events_actor_user_id_idx on public.audit_events(actor_user_id);
