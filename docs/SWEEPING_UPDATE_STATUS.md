# Sweeping PDM Update — Implementation Status

## Completed backend foundation
The PDM Supabase backend is now provisioned and healthy.

- Project ref: `dylgugjawlfbmtqmmzqq`
- Region: `us-east-2`
- Project URL: `https://dylgugjawlfbmtqmmzqq.supabase.co`
- RLS enabled on all PDM application tables
- Security advisor: clean after hardening
- Auth profile trigger: deployed
- Authenticated `create-organization` Edge Function: deployed with `verify_jwt=true` plus explicit user-token validation using modern publishable/secret keys
- `visibility-v1` rubrics seeded for universal, business, nonprofit, faith/ministry, and general organization
- `evaluate-source-identity` Edge Function deployed
- source provenance extended with observed domain/address/postal/phone, conflicts, and same-entity field differences
- duplicate source URLs prevented per screening run
- GitHub migrations and deployed function source are synchronized

Performance advisor currently reports only unused-index informational notices, expected before production traffic.

## Completed architecture
The repository defines:
- homepage CRO direction
- PDM brand rules
- unified screening UX
- organization identity/source provenance gate
- exact LifePoint Chillicothe regression fixture
- two synthetic identity-conflict regression fixtures
- canonical 70/30 scoring architecture
- Supabase Auth/data architecture
- RLS requirements
- measurement/observability
- SEO baseline
- ChatGPT Sites → Supabase wiring rules
- usage-efficient skill routing

## Next live-site implementation
The production editing surface is ChatGPT Sites.

Repository commits do not automatically modify the live ChatGPT Site.

Current normal-chat tooling does not expose the ChatGPT Sites editor/Cloud Browser. A direct public fetch of `https://purposedrivenmedia.group/` also did not return the Site in this execution environment, so no claim is made that the current live homepage or screening UI has been visually inspected or edited in this run.

The remaining production UI work must be executed in a Work session that exposes the existing ChatGPT Site.

Run the next implementation in ChatGPT Work / Cloud Browser with access to the existing PDM Site.

Work should:
1. inspect the existing Site before editing
2. compare all screening types against the Non-Profit reference
3. wire Supabase Auth and session handling
4. wire organization membership and saved screening/report ownership
5. normalize all screening UX through one shared system/configuration
6. implement the identity gate in the actual screening pipeline
7. use the seeded `visibility-v1` rubric architecture
8. run the LifePoint regression
9. run cross-organization auth isolation tests
10. verify desktop/mobile/SEO/analytics
11. publish only after release blockers pass

## Release blockers
Do not publish the screening-engine/auth update until:
- LifePoint wrong-organization contamination is eliminated
- rejected/ambiguous sources have zero scoring impact
- Business/Non-Profit/Ministry/Organization share the intended UX
- signup/login/logout/reset/session restore work
- authenticated organization ownership works
- cross-organization access is denied
- mobile critical paths pass

## Canonical Work instruction
`Open Purpose-Driven-Media, read AGENTS.md, then execute prompts/09_SWEEPING_PDM_ACCURACY_UX_AUTH_UPDATE.md. Continue through implementation and QA. Use the already-provisioned Supabase project. Do not publish while any release blocker is failing.`


### Screening run creation
The authenticated `start-screening-run` Edge Function creates immutable-at-start run snapshots and selects the active `visibility-v1` rubric. Direct client insert/update policies on `screening_runs` have been removed; members retain RLS-scoped read access.


## Backend verification completed
- all 9 public application tables have RLS enabled
- screening engine tables expose SELECT-only RLS policies to authenticated clients
- direct browser insert/update policies on `screening_runs` were removed
- rejected/ambiguous source scoring constraint tested
- finding-to-source scoring gate tested
- finding score range constraint tested
- source dedupe index present
- `visibility-v1` rubrics present
- Supabase security advisor returns no security lints
- authenticated Edge Functions active: `create-organization`, `start-screening-run`, `evaluate-source-identity`
- all authenticated Edge Functions currently use `verify_jwt=true` and also validate the user token in-handler
- generated TypeScript database types committed at `supabase/database.types.ts`
- reproducible backend checks committed at `qa/backend_security_checks.sql`

Still pending before release:
- live ChatGPT Sites visual inspection/editing
- Site client configuration with project URL + publishable key
- production Auth redirect/email configuration
- real signup/verification/login/logout/reset/session restore
- two-user cross-organization isolation test
- full screening engine scoring/report-generation integration
- all four live screening UX paths
- LifePoint regression through the actual Site
- mobile/browser/SEO/analytics QA
