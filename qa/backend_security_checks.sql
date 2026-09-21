-- PDM backend regression checks.
-- Run against a disposable branch or in a transaction before production release.

-- 1. Confirm RLS is enabled on every public application table.
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname='public'
  and relkind='r'
  and relname in (
    'profiles','organizations','organization_members','rubric_versions',
    'screening_runs','screening_sources','screening_findings',
    'screening_reports','audit_events'
  )
order by relname;

-- 2. Browser clients must not have direct write policies for screening engine tables.
select tablename, policyname, cmd
from pg_policies
where schemaname='public'
  and tablename in ('screening_runs','screening_sources','screening_findings','screening_reports')
order by tablename, cmd, policyname;

-- Expected: SELECT policies only.

-- 3. Provenance/scoring enforcement must exist.
select
  exists(select 1 from pg_constraint where conname='screening_sources_scoring_gate') as source_scoring_gate,
  exists(select 1 from pg_constraint where conname='screening_findings_score_range') as finding_score_range,
  exists(select 1 from pg_trigger where tgname='enforce_finding_source_gate') as finding_source_gate,
  exists(select 1 from pg_indexes where schemaname='public' and indexname='screening_sources_run_url_uidx') as source_dedupe;

-- 4. Rubric versions.
select screening_type, version, retired_at
from public.rubric_versions
where version='visibility-v1'
order by screening_type;

-- 5. Run Supabase security advisor after migrations.
-- Expected: no security lints.

-- 6. End-to-end tests still required with two real/test authenticated users:
--    A owns Org A, B owns Org B.
--    A must not be able to select Org B, its membership, runs, sources,
--    findings, reports, or admin audit events, and vice versa.
