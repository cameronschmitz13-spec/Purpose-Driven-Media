# Supabase Auth and Screening Data Architecture

## Decision
Use **Supabase Auth** as the system of record for user authentication.

The PDM application must not store or manage plaintext passwords.

Supabase Auth owns credentials and sessions. PDM stores application profile, organization membership, screening, and report data in Postgres.

## Current provisioning state
As of 2026-09-20:
- one Supabase organization is visible in the connected account
- no Supabase project exists yet for PDM

Do not silently substitute another auth system.

Before project creation:
- owner must confirm which Supabase organization to use
- retrieve the current project cost for that organization
- obtain the required explicit cost confirmation
- then create/connect the PDM project

Non-auth website/UX work may proceed while provisioning is pending.

## Prepared migrations
The repository contains a proposed initial schema and RLS implementation:

- `supabase/migrations/0001_screening_schema.sql`
- `supabase/migrations/0002_rls_and_auth_helpers.sql`

These are prepared for review/application after a PDM Supabase project exists.

Do not claim they are deployed until they have actually been applied and the Supabase security advisors and cross-organization access tests pass.

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
