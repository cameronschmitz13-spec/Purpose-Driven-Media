# Supabase Auth and Screening Data Architecture

## Decision
Use **Supabase Auth** as the system of record for user authentication.

The PDM application must not store or manage plaintext passwords.

Supabase Auth owns credentials and sessions. PDM stores application profile, organization membership, screening, and report data in Postgres.

## Current provisioning state
As of 2026-09-20, the PDM Supabase project is provisioned and healthy.

- Project name: `Purpose Driven Media`
- Project ref: `dylgugjawlfbmtqmmzqq`
- Region: `us-east-2`
- API URL: `https://dylgugjawlfbmtqmmzqq.supabase.co`
- Project cost confirmed at creation: $0/month

Do not commit secret/service-role keys to GitHub.

Use the active modern publishable key through the site's environment/configuration when wiring the client.

## Deployed database foundation
The following migrations have been applied:

- `supabase/migrations/0001_screening_schema.sql`
- `supabase/migrations/0002_rls_and_auth_helpers.sql`
- `supabase/migrations/0003_harden_function_privileges.sql`
- `supabase/migrations/0004_seed_visibility_v1_rubrics.sql`
- `supabase/migrations/0005_extend_source_provenance.sql`
- `supabase/migrations/0006_dedupe_screening_sources.sql`
- `supabase/migrations/0007_harden_screening_and_membership_writes.sql`
- `supabase/migrations/0008_avoid_membership_policy_recursion.sql`
- `supabase/migrations/0009_add_screening_response_persistence.sql`
- `supabase/migrations/0010_define_visibility_v1_scoring_formula.sql`
- `supabase/migrations/0011_add_transactional_score_finalizer.sql`

The authenticated `create-organization` Edge Function is deployed using the modern publishable/secret key model. Gateway `verify_jwt` is enabled for authenticated user functions. The client sends its publishable key as `apikey` and the signed-in user's access token as `Authorization: Bearer <user-jwt>`; the function also validates the caller with `auth.getUser()` before privileged work.

Current public application tables have RLS enabled.

The authenticated `evaluate-source-identity` Edge Function is also deployed. It applies the entity gate, persists provenance/match decisions, and prevents rejected/ambiguous sources from being marked as scoring evidence.

The Supabase security advisor reports no current security lints after hardening.

Performance currently reports only expected unused-index informational notices because the new database has no production traffic yet.

Cross-organization isolation still requires end-to-end testing with real/test authenticated users before production auth is declared fully verified.

## Auth scope
Initial production auth should support:
- email + password
- email verification
- sign in
- sign out
- password reset
- secure session persistence

Optional later:
- magic link
- social login
- MFA for privileged/admin users

Do not add providers just because they are available.

## Credential handling
- never store passwords in PDM tables
- never log passwords
- never put secret/service-role keys in client code
- use a Supabase publishable key in public clients
- keep any elevated secret key server-side only
- use secure environment/secret storage
- never commit secrets to GitHub

## Suggested data model

### profiles
Application profile only.
- id uuid PK -> auth.users.id
- display_name
- created_at
- updated_at

### organizations
Canonical screening target.
- id
- name
- normalized_name
- organization_type
- canonical_domain
- website_url
- address fields
- city
- state_region
- postal_code
- phone
- created_at
- updated_at

### organization_members
- organization_id
- user_id
- role: owner / admin / member
- status
- created_at

### rubric_versions
- id
- name
- version
- screening_type
- config jsonb
- active_from
- retired_at

### screening_runs
- id
- organization_id
- initiated_by
- screening_type
- rubric_version_id
- status
- input_snapshot jsonb
- canonical_identity_snapshot jsonb
- started_at
- completed_at

### screening_sources
- id
- screening_run_id
- source_url
- source_type
- observed_name
- observed_city
- observed_state
- match_status
- match_basis
- confidence
- included_in_score
- excluded_reason
- fetched_at

### screening_findings
- id
- screening_run_id
- category_key
- rule_key
- finding_type
- raw_value jsonb
- score
- max_score
- confidence
- source_id
- explanation

### screening_reports
- id
- screening_run_id
- total_score
- planning_target
- report_snapshot jsonb
- created_at

### audit_events
Use for important application changes and accuracy investigations, without storing secrets.

## Row Level Security
Enable RLS on exposed application tables.

Users should only be able to access data for organizations they are authorized to access through `organization_members`.

Do not rely on `user_metadata` for authorization.

Organization-scoped authorization belongs in database membership/role data and RLS policies.

Admin-only operations must be separately protected.

## Data ownership
A user account may belong to multiple organizations.

Do not make `profiles` itself the organization record.

## Screening ownership
A report belongs to an organization and a screening run.

A user may view it only if authorized for that organization, unless the report is intentionally made public through a separate explicit sharing mechanism.

## Security verification
After schema/RLS changes:
- run Supabase security advisors
- inspect performance advisors
- test authorized user
- test different organization user
- test signed-out user
- verify no cross-organization data leakage

## Production email
Before production launch, configure a production-capable SMTP/email provider for signup verification and password resets rather than relying indefinitely on a limited development sender.


### Screening run creation
The authenticated `start-screening-run` Edge Function creates immutable-at-start run snapshots and selects the active `visibility-v1` rubric. Direct client insert/update policies on `screening_runs` have been removed; members retain RLS-scoped read access.


The service-only `finalize-screening-score` Edge Function uses secret-key authentication and the transactional `finalize_screening_score` RPC. It is not a browser endpoint.
