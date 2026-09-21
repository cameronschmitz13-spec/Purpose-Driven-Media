# ChatGPT Sites → Supabase Wiring

## Production backend
PDM now has a live Supabase project.

- Project ref: `dylgugjawlfbmtqmmzqq`
- Project URL: `https://dylgugjawlfbmtqmmzqq.supabase.co`
- Region: `us-east-2`
- Active rubric: `visibility-v1`

## Client configuration
The ChatGPT Site should use:
- the project URL above
- the project's active modern **publishable key**

The publishable key is intended for client use. Do not use or expose the service-role key.

Prefer the Site's environment/configuration mechanism if it has one. If ChatGPT Sites does not expose an environment-variable facility, use the publishable key only where the Site platform expects public client configuration.

Never paste a service-role/secret key into site code, browser storage, GitHub, or analytics.

## Auth
Wire the existing account UX to Supabase Auth:
- sign up with email/password
- email verification
- sign in
- sign out
- password reset
- session restoration

Production Auth redirect/site URL should resolve to the canonical PDM domain:
`https://purposedrivenmedia.group/`

Any additional callback route must be explicitly allow-listed in Supabase Auth before release.

## Application ownership
After authentication:
1. load/create `profiles`
2. load the user's `organization_members`
3. scope organization screens to memberships
4. scope saved screenings/reports to the selected organization
5. never trust a client-provided organization id without RLS/server verification

## Creating organizations
Use the deployed authenticated Edge Function:
`create-organization`

Do not insert directly into `organizations` from an untrusted client and then try to grant ownership separately.

The function explicitly validates the caller's Supabase Auth access token, creates the organization, and creates the caller's owner membership. It uses the modern publishable/secret key model; no service-role key is exposed to the client.

## Screening writes
Customer-facing clients may read only what RLS permits.

Source collection, scoring, provenance writes, report generation, and any privileged screening-engine operation should run through trusted server/Edge Function code rather than exposing elevated database credentials to the browser.

For third-party evidence, call the deployed `evaluate-source-identity` function before any source is eligible to affect scoring. A source with `match_status` of `rejected` or `ambiguous` must have zero scoring impact.

## UX
Do not make login a prerequisite for seeing the homepage or sample report.

Recommended flow:
- visitor can understand PDM and view the fictional sample without authentication
- visitor can begin the screening
- require/create account at the point needed to persist the organization, save progress, or retain the report
- preserve entered data through the auth transition where safely possible

## Release tests
Before enabling production account saving:
- signup + email verification
- login/logout
- password reset
- session restore
- create organization
- owner can access own organization
- second user cannot access first user's organization
- signed-out user cannot access protected data
- saved screening reopens for authorized user
- LifePoint regression passes


### Screening run creation
The authenticated `start-screening-run` Edge Function creates immutable-at-start run snapshots and selects the active `visibility-v1` rubric. Direct client insert/update policies on `screening_runs` have been removed; members retain RLS-scoped read access.
