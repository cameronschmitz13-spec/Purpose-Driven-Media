# PDM Site ↔ Supabase Integration Contract

Use this contract when wiring the existing ChatGPT Site. Do not rebuild the Site.

## Client
Project URL:
`https://dylgugjawlfbmtqmmzqq.supabase.co`

Use the project's active modern publishable key in the browser client. Never expose a secret key.

Authenticated function calls should be made with the signed-in Supabase session so the request carries:
- `apikey: <publishable key>`
- `Authorization: Bearer <user access token>`

## Authentication
Required production paths:
- email/password signup
- email verification
- sign in
- sign out
- password reset
- session restoration

Do not gate the public homepage or fictional sample report behind login.

## Create organization
Function: `create-organization`

Request body:
```json
{
  "name": "Example Organization",
  "organization_type": "business",
  "website_url": "https://example.org",
  "canonical_domain": "example.org",
  "street_address": "123 Main St",
  "city": "Example",
  "state_region": "MO",
  "postal_code": "64000",
  "phone": "555-555-5555"
}
```

Allowed organization types:
- `business`
- `nonprofit`
- `faith_ministry`
- `organization`

Response:
```json
{ "organization_id": "<uuid>" }
```

## Start screening
Function: `start-screening-run`

Request body:
```json
{
  "organization_id": "<uuid>",
  "screening_type": "business",
  "input_snapshot": {
    "first_party_social": {},
    "first_party_links": {}
  }
}
```

The function:
- confirms the caller can read the organization through RLS
- requires the screening type to match the configured organization type
- selects `visibility-v1`
- captures the canonical identity snapshot
- creates the run as `resolving_identity`
- records `screening_started`

Do not insert or update `screening_runs` directly from browser code.

## Evaluate third-party source identity
Function: `evaluate-source-identity`

Call this before a third-party candidate is allowed to influence scoring.

Request body:
```json
{
  "screening_run_id": "<uuid>",
  "candidate": {
    "source_url": "https://directory.example/page",
    "source_type": "directory",
    "observed_name": "Example Organization",
    "observed_domain": "example.org",
    "observed_address": "123 Main St",
    "observed_city": "Example",
    "observed_state": "MO",
    "observed_postal_code": "64000",
    "observed_phone": "555-555-5555"
  }
}
```

Decision:
- `confirmed` → may be eligible for scoring
- `rejected` → zero scoring impact
- `ambiguous` → zero scoring impact until resolved

The database also enforces that a finding cannot cite a rejected/ambiguous source.

## Reads
The signed-in client may read, subject to RLS:
- its own profile
- organizations where it has active membership
- organization memberships it is allowed to see
- active rubrics
- its organizations' screening runs
- sources/findings/reports belonging to those runs
- audit events for organizations where it is an admin/owner

## Screening answer persistence
User-entered screening answers are stored in `screening_responses`.

The signed-in client may upsert/delete responses for a run only while that run is not `complete` or `failed`. RLS scopes the run to the user's organization membership.

Use one stable `question_key` per shared/configured question. Do not encode audience-specific layout into the database.

## Writes
Browser code may write only user-owned/user-entered application state allowed by RLS, including `screening_responses`.

Browser code should not directly write:
- screening sources
- screening findings
- screening reports
- screening run status/rubric/canonical identity

Those belong to trusted screening-engine paths.

## UX mapping
All four audience types use one shared screening shell.

Only configuration changes:
- labels/help copy
- sector questions
- sector scoring rules
- recommendation wording

The Non-Profit screening remains the canonical interaction/visual reference.

## Release gate
Do not publish until:
1. signup/verification/login/logout/reset/session restore pass
2. create organization passes
3. Business/Non-Profit/Ministry/Organization share the intended UX
4. LifePoint Chillicothe positive/stale-address case passes
5. wrong-state LifePoint case is rejected with zero score impact
6. synthetic identity-conflict fixtures pass
7. two-user cross-organization reads are denied
8. saved screening/report reopen works
9. mobile critical paths pass
10. browser console has no release-blocking errors


## Trusted score finalization
Function: `finalize-screening-score`

This endpoint is **service-to-service only**. It requires a Supabase secret key in the `apikey` header and is deployed with `verify_jwt=false` because the function uses secret-key authentication rather than a user JWT.

Never call it from browser code and never place a Supabase secret key in ChatGPT Site client code.

The trusted screening evaluator supplies all 13 rubric ratings:
- 7 universal ratings, each 0–4 and worth 10 points after normalization
- 6 sector ratings, each 0–4 and worth 5 points after normalization

Formula:
`points = (rating / 4) × weight`

The database RPC finalizes the score transactionally, writes the 13 findings, writes the immutable report snapshot, marks the run complete, and records the completion audit event.

If a rating cites a `source_id`, the database trigger rejects it unless that source belongs to the same run and is `confirmed` + `included_in_score=true`.

Critical visibility leaks are stored as explicit report flags; they do not silently rewrite the mathematical total.
