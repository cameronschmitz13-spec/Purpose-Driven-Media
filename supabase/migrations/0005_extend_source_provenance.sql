alter table public.screening_sources
  add column if not exists observed_domain text,
  add column if not exists observed_address text,
  add column if not exists observed_postal_code text,
  add column if not exists observed_phone text,
  add column if not exists identity_conflicts jsonb not null default '[]'::jsonb,
  add column if not exists field_differences jsonb not null default '{}'::jsonb;

comment on column public.screening_sources.identity_conflicts is
  'Entity-level conflicts considered during identity resolution. Rejected/ambiguous sources never affect scoring.';

comment on column public.screening_sources.field_differences is
  'Same-entity factual differences such as stale address/hours; these may become listing-consistency findings without replacing canonical first-party data.';
