# WORK PROMPT — PDM Sweeping Accuracy, Unified UX, Supabase Auth, CRO & SEO Update

You are working on the existing Purpose Driven Media site and screening product.

## FIRST: READ ONLY THESE FILES
1. `AGENTS.md`
2. `docs/BRAND.md`
3. `docs/CRO_BASELINE.md`
4. `docs/SEO_BASELINE.md`
5. `docs/VISIBILITY_SCREENING.md`
6. `docs/SCREENING_ACCURACY_AND_IDENTITY.md`
7. `docs/UNIFIED_SCREENING_UX.md`
8. `docs/SUPABASE_AUTH_AND_DATA.md`
9. `docs/IMPLEMENTATION_SKILLS.md`
10. `docs/CHATGPT_SITES_IMPLEMENTATION.md`
11. `docs/MEASUREMENT_AND_OBSERVABILITY.md`
12. `docs/SCORING_ARCHITECTURE.md`
13. `qa/fixtures/lifepoint_chillicothe_mo.json`
14. `docs/CHATGPT_SITES_SUPABASE_WIRING.md`
15. `docs/SITE_SUPABASE_INTEGRATION_CONTRACT.md`
16. `supabase/database.types.ts`

Do not load unrelated repo history unless needed.

Production site:
https://purposedrivenmedia.group/

Current editing surface:
ChatGPT Sites

## PRIMARY OBJECTIVE
Perform a comprehensive update that:

1. implements the approved homepage CRO/SEO critique,
2. makes Business, Non-Profit, Ministry, and Organization screening UX visually and behaviorally consistent,
3. uses the current Non-Profit screening as the canonical screening UX reference,
4. eliminates cross-organization source contamination,
5. makes screening scoring reproducible and provenance-aware,
6. uses Supabase Auth as the authentication system of record,
7. preserves PDM branding and current working functionality,
8. improves mobile UX and accessibility,
9. verifies every screening type end-to-end before publishing.

Do NOT rebuild from scratch unless there is no safe way to reuse the existing implementation.

---

# PHASE 0 — INSPECT BEFORE CHANGING

Inspect:
- live homepage
- all current screening entry points
- Business screening
- Non-Profit screening
- Ministry screening
- General Organization screening
- completed report UX
- history/progress UX
- login/signup/reset flows
- data/source collection flow
- scoring logic if accessible
- SEO settings if accessible

Document:
- what already matches,
- what differs between screening types,
- duplicated UI/components,
- duplicated scoring logic,
- any auth currently in use,
- all places third-party data enters the pipeline.

Do not make changes until this map is clear.

---

# PHASE 1 — HOMEPAGE CRO

The site must communicate within the first screen:
- who PDM helps,
- the visibility problem,
- what the Visibility Screening does,
- what action to take.

Preferred hero direction:

Eyebrow:
`PDM Visibility Screening`

H1:
`Can Customers Actually Find Your Business Online?`

Support:
`Purpose Driven Media identifies where your business or organization is easy to find, where people may get confused, and what to fix first.`

Primary CTA:
`Start My Visibility Screening`

Secondary CTA:
`See a Sample Report`

Alternative direct-response hook, if it tests better in the existing layout:
`People Can't Choose a Business They Can't Find.`

Do not add multiple competing primary CTAs.

Recommended homepage order:
1. Problem + CTA
2. Sample Visibility Screening
3. What PDM checks
4. What the visitor receives
5. Real proof
6. How the process works
7. Relevant services/software
8. FAQ
9. Final CTA

Never fabricate proof.

---

# PHASE 2 — SAMPLE SCREENING

Show a realistic but explicitly fictional sample.

Use:
`Riverbend Family Outreach`

Required visible disclosure:
`Sample Report — fictional organization for illustration only.`

Do not present sample scores as client results.

After the sample:
`What would your organization score?`

CTA:
`Start My Visibility Screening`

---

# PHASE 3 — ONE SCREENING UX FOR EVERY AUDIENCE

Treat the current Non-Profit screening as the canonical UX.

Business Screening must look and behave like it.

Ministry and Organization screenings must use the same shell too.

Use ONE shared screening UI system for:
- navigation
- progress
- questions
- inputs
- source/status feedback
- loading
- errors
- report
- score gauge
- category bars
- Fix First / Improve Next / Monitor cards
- progress history
- actions
- mobile behavior

Audience differences come from configuration, NOT duplicated UI.

Keep stable internal category keys.

If a business-specific rule genuinely differs from a non-profit rule, change rubric configuration, not layout.

---

# PHASE 4 — SCREENING ACCURACY / LIFEPOINT DEFECT

This is release-blocking.

Known defect pattern:
A LifePoint/Lifepoint screening has pulled third-party information belonging to another LifePoint church in another state.

Fix the data pipeline so third-party evidence can never affect a screening based only on name similarity.

For every run:

1. Build a canonical organization fingerprint from the submitted target:
   - submitted URL
   - canonical domain
   - verified name
   - organization type
   - city/state
   - address/postal if available
   - phone if available
   - first-party links

2. Every third-party candidate must pass the identity gate.

The backend now includes the deployed authenticated `evaluate-source-identity` Edge Function. Wire the actual screening pipeline through it (or an equivalently strict trusted-server path); do not recreate a weaker client-only matcher.

Include if:
- exact domain/address/phone/verified profile match,
OR
- at least two supporting identity signals with no conflict.

Reject if:
- same name but different state,
- same name but different city with no strong match,
- conflicting domain/address/phone,
- ambiguous branch/campus,
- unresolved identity.

Name-only match is NEVER sufficient.

3. Rejected/ambiguous data must not affect scores or customer-facing claims.

4. Store provenance and rejection reason.

5. Never overwrite verified first-party identity with third-party data.

6. Use the canonical regression fixture at `qa/fixtures/lifepoint_chillicothe_mo.json`.
   The target is Lifepoint Church of Chillicothe at `https://lifepoint-church.com/`, primary worship address 434 Locust St, Chillicothe, MO 64601.
   Verify that wrong-state/same-name LifePoint sources are rejected and contribute zero scoring impact.
   Preserve legitimate known Lifepoint Chillicothe facilities as described in the fixture.

7. Add at least two additional same-name regression cases.

Accuracy beats completeness.

---

# PHASE 5 — SCORING INTEGRITY

Read and use `docs/SCORING_ARCHITECTURE.md` as the target architecture.

Inspect current scoring logic.

Do not arbitrarily change score values.

Create a versioned scoring/rubric model so each screening run records:
- screening type
- rubric version
- inputs
- included evidence
- category score
- total score
- report snapshot

If Business and Non-Profit share a category, use the same rule unless a documented audience-specific reason exists.

Historical reports must not silently recalculate after a rubric update.

---

# PHASE 6 — SUPABASE AUTH

Use Supabase Auth as the source of truth for authentication.

Do not store passwords in application tables.

Required:
- signup
- email verification
- sign in
- sign out
- password reset
- session persistence

Use Supabase Postgres for:
- profiles
- organizations
- organization memberships
- screening runs
- sources/provenance
- findings
- rubric versions
- reports

Enable RLS on exposed application tables.

Users may only access organizations they belong to.

Do not use user-editable metadata for authorization.

Never expose service-role/secret keys in the browser.

Use a publishable frontend key and secure server-side secrets.

Supabase is now provisioned:
- Project ref: `dylgugjawlfbmtqmmzqq`
- Project URL: `https://dylgugjawlfbmtqmmzqq.supabase.co`
- Region: `us-east-2`
- Database/RLS/provenance/security migrations 0001–0011 are deployed.
- `visibility-v1` rubrics are seeded.
- The authenticated `create-organization` Edge Function is deployed.
- The authenticated `evaluate-source-identity` Edge Function is deployed.
- The authenticated `start-screening-run` Edge Function is deployed.
- The service-only `finalize-screening-score` Edge Function is deployed; never call it from browser code or expose a secret key.
- Both functions explicitly validate Supabase Auth user tokens and use the modern publishable/secret key model.
- Current Supabase security advisor result is clean.

Wire the existing ChatGPT Site to this project using the active modern publishable key and the rules in `docs/CHATGPT_SITES_SUPABASE_WIRING.md`.

Never expose a service-role/secret key.

Run Supabase security advisors after schema/RLS work.

---

# PHASE 7 — BRAND

Use the actual PDM visual identity:
- gold double chevrons
- navy wordmark
- navy/gold/warm-white base
- correct audience lockup where appropriate

General site default:
`Helping Organizations get Found, understood, and connected online.`

Core line:
`Get Found, Understood, and Connected.`

Do not substitute plant/leaf/mountain/generic AI icons for the chevrons.

Do not AI-redraw the logo if the original asset is available.

---

# PHASE 8 — MOBILE + ACCESSIBILITY

Verify all screening types on mobile.

Required:
- readable scores
- stacked cards
- no horizontal scroll
- comfortable tap targets
- visible focus states
- semantic headings
- form labels
- errors tied to fields
- status not communicated by color only
- charts/scores have accessible labels

---

# PHASE 9 — SEO

Where supported:
- one meaningful H1
- logical H2 hierarchy
- intent-aligned title/meta
- canonical clean URL
- no accidental noindex
- sitemap/robots sane
- social sharing metadata
- alt text
- factual structured data only

Recommended homepage title:
`Online Visibility Screening for Businesses & Organizations | Purpose Driven Media`

Recommended meta:
`Find out how easily customers can discover, understand, and connect with your organization online. Get a practical Visibility Screening and prioritized roadmap.`

Do not create thin keyword pages.

---

# PHASE 9.5 — MEASUREMENT + OBSERVABILITY

Preserve existing analytics where working and add only the minimum events needed to understand the funnel and diagnose screening failures.

Track:
- homepage primary CTA
- sample report
- screening start
- identity resolved
- screening completion
- report viewed
- signup completion
- login completion
- saved-report reopen

For internal accuracy telemetry, record source confirmed/rejected/ambiguous and pipeline failures without logging passwords, tokens, secret keys, or unnecessary PII.

Ensure events do not double-fire.

---

# PHASE 10 — REQUIRED QA BEFORE PUBLISH

Run the same test matrix for:
- Business
- Non-Profit
- Ministry
- Organization

For each:
1. start screening
2. identity resolution
3. source collection
4. third-party match/rejection
5. questions/input
6. scoring
7. report rendering
8. mobile rendering
9. authenticated save/history
10. re-open saved report

Run explicit LifePoint regression.

Auth tests:
- new signup
- verification
- login
- logout
- reset
- unauthorized cross-org access attempt
- signed-out protected-route attempt

Website:
- hero CTA
- sample report CTA
- forms
- navigation
- desktop
- mobile
- no console-breaking errors

Do not publish if cross-organization contamination remains.

---

# USAGE-EFFICIENT EXECUTION

Use High reasoning for:
- initial architecture map
- entity-resolution/data-accuracy design
- scoring/rubric decisions
- auth/RLS security design

Then switch to Medium for implementation.

Use Instant/lower effort for:
- copy
- spacing
- repetitive metadata
- simple QA fixes

Load only the relevant skills:
- Supabase skill for auth/database/RLS
- Supabase Postgres Best Practices only for schema/query work
- Agent Browser for live-flow testing
- Agent Browser Verify for final verification

Do not load React/Next.js/shadcn skills unless the current implementation actually uses them.

---

# FINAL DELIVERABLE

Return a concise implementation report containing:

1. Homepage changes
2. Screening UX changes
3. Shared components/config introduced
4. Accuracy/entity-resolution fixes
5. LifePoint regression result
6. Scoring/rubric changes
7. Supabase Auth/data changes
8. RLS/security results
9. SEO changes
10. Mobile/accessibility results
11. Measurement/observability changes
12. Tests passed/failed
13. Anything blocked and exact reason
14. Anything requiring owner confirmation

Do not claim a fix is complete without verifying it.
